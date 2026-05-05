import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from '../ai/ai.module';
import { WorkflowProcessor } from './workflow.processor';
import { IntentClassificationStep } from './steps/intent-classification.step';
import { DataExtractionStep } from './steps/data-extraction.step';
import { RoutingDecisionStep } from './steps/routing-decision.step';
import { WORKFLOW_QUEUE } from './constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: WORKFLOW_QUEUE }),
    AiModule,
  ],
  providers: [
    WorkflowProcessor,
    IntentClassificationStep,
    DataExtractionStep,
    RoutingDecisionStep,
  ],
})
export class WorkflowModule {}
