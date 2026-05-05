import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, StepName } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { WORKFLOW_QUEUE, WORKFLOW_JOB } from '../workflow/constants';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(WORKFLOW_QUEUE) private readonly workflowQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        userId,
        customerName: dto.customerName,
        contactChannel: dto.contactChannel,
        rawMessage: dto.message,
        workflow: {
          create: {
            userId,
            steps: {
              create: [
                { stepName: StepName.INTENT_CLASSIFICATION },
                { stepName: StepName.DATA_EXTRACTION },
                { stepName: StepName.ROUTING_DECISION },
              ],
            },
          },
        },
      },
      include: {
        workflow: { include: { steps: true } },
      },
    });

    await this.workflowQueue.add(WORKFLOW_JOB, {
      workflowId: lead.workflow!.id,
      leadId: lead.id,
    });

    return lead;
  }

  async findAll(userId: string) {
    return this.prisma.lead.findMany({
      where: { userId },
      include: {
        workflow: { include: { steps: { orderBy: { createdAt: 'asc' } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, userId },
      include: {
        workflow: { include: { steps: { orderBy: { createdAt: 'asc' } } } },
      },
    });

    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async retry(userId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, userId },
      include: { workflow: { include: { steps: true } } },
    });

    if (!lead) throw new NotFoundException('Lead not found');

    const workflow = lead.workflow;
    if (!workflow) throw new BadRequestException('No workflow found for this lead');

    if (workflow.status !== 'FAILED') {
      throw new BadRequestException(
        `Workflow cannot be retried — current status: ${workflow.status}`,
      );
    }

    // Reset workflow and all steps back to initial state
    await this.prisma.$transaction([
      this.prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          status: 'PENDING',
          failureReason: null,
          finalCategory: null,
          finalQueue: null,
          finalPriority: null,
          startedAt: null,
          completedAt: null,
        },
      }),
      this.prisma.workflowStep.updateMany({
        where: { workflowId: workflow.id },
        data: {
          status: 'NOT_STARTED',
          output: Prisma.JsonNull,
          rawAiResponse: Prisma.JsonNull,
          errorReason: null,
          retryCount: 0,
          startedAt: null,
          completedAt: null,
        },
      }),
    ]);

    await this.workflowQueue.add(WORKFLOW_JOB, {
      workflowId: workflow.id,
      leadId: lead.id,
    });

    return this.findOne(userId, id);
  }
}
