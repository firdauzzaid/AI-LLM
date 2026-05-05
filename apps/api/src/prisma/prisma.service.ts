import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
      ],
      errorFormat: "pretty",
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Connected to database");
    } catch (error) {
      this.logger.error("Failed to connect to database", error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log("Database connection closed");
  }

  /**
   * Utility untuk cleanup di E2E tests
   * JANGAN dipanggil di production
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      throw new Error("cleanDatabase() cannot be called in production");
    }

    // Urutan penting karena FK constraints
    const models = ["aiCallLog", "workflowStep", "workflow", "lead", "user"];

    for (const model of models) {
      await (this as any)[model].deleteMany();
    }

    this.logger.warn("Database cleaned");
  }
}
