import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IntentCategory, StepName, StepStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { IntentClassificationStep } from './steps/intent-classification.step';
import { DataExtractionStep } from './steps/data-extraction.step';
import { RoutingDecisionStep } from './steps/routing-decision.step';
import {
  type IntentClassificationOutput,
  type DataExtractionOutput,
} from './schemas/step-outputs.schema';
import { WORKFLOW_QUEUE, STEP_MAX_RETRIES } from './constants';

interface WorkflowJobData {
  workflowId: string;
  leadId: string;
}

type StepResult<T> =
  | { success: true; output: T; rawResponse: unknown }
  | { success: false; error: string };

@Processor(WORKFLOW_QUEUE)
export class WorkflowProcessor extends WorkerHost {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly classificationStep: IntentClassificationStep,
    private readonly extractionStep: DataExtractionStep,
    private readonly routingStep: RoutingDecisionStep,
  ) {
    super();
  }

  async process(job: Job<WorkflowJobData>): Promise<void> {
    const { workflowId, leadId } = job.data;
    this.logger.log(`Processing workflow ${workflowId} for lead ${leadId}`);

    const lead = await this.prisma.lead.findUniqueOrThrow({
      where: { id: leadId },
    });

    const workflow = await this.prisma.workflow.findUniqueOrThrow({
      where: { id: workflowId },
      include: { steps: true },
    });

    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    const getStep = (name: StepName) =>
      workflow.steps.find((s) => s.stepName === name)!;

    // ── Step 1: Intent Classification ─────────────────────────────────────
    const classificationResult =
      await this.runStep<IntentClassificationOutput>(
        getStep(StepName.INTENT_CLASSIFICATION).id,
        () =>
          this.classificationStep.run(lead.rawMessage).then((r) => ({
            output: r.output,
            rawResponse: r.rawResponse,
          })),
      );

    if (!classificationResult.success) {
      await this.skipRemaining(workflow.steps
        .filter((s) => s.stepName !== StepName.INTENT_CLASSIFICATION)
        .map((s) => s.id));
      await this.failWorkflow(workflowId, `Intent classification failed: ${classificationResult.error}`);
      return;
    }

    // ── Step 2: Data Extraction ────────────────────────────────────────────
    const extractionResult = await this.runStep<DataExtractionOutput>(
      getStep(StepName.DATA_EXTRACTION).id,
      () =>
        this.extractionStep
          .run(
            lead.rawMessage,
            classificationResult.output.category,
            lead.contactChannel.toLowerCase(),
          )
          .then((r) => ({ output: r.output, rawResponse: r.rawResponse })),
    );

    if (!extractionResult.success) {
      await this.skipRemaining([getStep(StepName.ROUTING_DECISION).id]);
      await this.failWorkflow(workflowId, `Data extraction failed: ${extractionResult.error}`);
      return;
    }

    // ── Step 3: Routing Decision ───────────────────────────────────────────
    const routingResult = await this.runStep(
      getStep(StepName.ROUTING_DECISION).id,
      () =>
        this.routingStep
          .run(
            classificationResult.output,
            extractionResult.output,
            lead.rawMessage,
          )
          .then((r) => ({ output: r.output, rawResponse: r.rawResponse })),
    );

    if (!routingResult.success) {
      await this.failWorkflow(workflowId, `Routing decision failed: ${routingResult.error}`);
      return;
    }

    // ── All steps succeeded ────────────────────────────────────────────────
    const categoryMap: Record<string, IntentCategory> = {
      sales_new: 'SALES_NEW',
      sales_existing: 'SALES_EXISTING',
      support: 'SUPPORT',
      spam: 'SPAM',
      unknown: 'UNKNOWN',
    };

    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        finalCategory: categoryMap[classificationResult.output.category],
        finalQueue: routingResult.output.queue,
        finalPriority: routingResult.output.priority,
      },
    });

    this.logger.log(`Workflow ${workflowId} completed`);
  }

  private async runStep<T>(
    stepId: string,
    fn: () => Promise<{ output: T; rawResponse: unknown }>,
  ): Promise<StepResult<T>> {
    await this.prisma.workflowStep.update({
      where: { id: stepId },
      data: { status: StepStatus.PROCESSING, startedAt: new Date() },
    });

    let lastError = '';

    for (let attempt = 0; attempt <= STEP_MAX_RETRIES; attempt++) {
      try {
        const { output, rawResponse } = await fn();

        await this.prisma.workflowStep.update({
          where: { id: stepId },
          data: {
            status: StepStatus.COMPLETED,
            output: output as object,
            rawAiResponse: rawResponse as object,
            completedAt: new Date(),
            retryCount: attempt,
          },
        });

        return { success: true, output, rawResponse };
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Step ${stepId} attempt ${attempt + 1} failed: ${lastError}`,
        );

        if (attempt < STEP_MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    await this.prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: StepStatus.FAILED,
        errorReason: lastError,
        retryCount: STEP_MAX_RETRIES,
      },
    });

    return { success: false, error: lastError };
  }

  private async skipRemaining(stepIds: string[]): Promise<void> {
    if (!stepIds.length) return;
    await this.prisma.workflowStep.updateMany({
      where: { id: { in: stepIds } },
      data: { status: StepStatus.SKIPPED },
    });
  }

  private async failWorkflow(workflowId: string, reason: string): Promise<void> {
    this.logger.error(`Workflow ${workflowId} failed: ${reason}`);
    await this.prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'FAILED', failureReason: reason },
    });
  }
}
