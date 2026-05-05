import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { WORKFLOW_QUEUE } from '../workflow/constants';

@Module({
  imports: [BullModule.registerQueue({ name: WORKFLOW_QUEUE })],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
