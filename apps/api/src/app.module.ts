import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { validateEnv } from './config/env.config';
import type { EnvConfig } from './config/env.schema';
import { HealthModule } from './common/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { WorkflowModule } from './workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env'],
    }),

    // BullMQ global connection — reads Redis config from env
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => ({
        connection: {
          host: config.get('REDIS_HOST', { infer: true }),
          port: config.get('REDIS_PORT', { infer: true }),
          ...(config.get('REDIS_PASSWORD', { infer: true })
            ? { password: config.get('REDIS_PASSWORD', { infer: true }) }
            : {}),
        },
      }),
    }),

    PrismaModule,
    HealthModule,
    AuthModule,
    LeadsModule,
    WorkflowModule,
  ],
})
export class AppModule {}
