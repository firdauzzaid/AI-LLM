// lead-workflow/apps/api/src/common/health/health.controller.ts

import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from "@nestjs/terminus";
import { PrismaHealthIndicator } from "../../prisma/prisma.health";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.isHealthy("database"),
      async () => ({
        api: {
          status: "up",
          timestamp: new Date().toISOString(),
        },
      }),
    ]);
  }
}
