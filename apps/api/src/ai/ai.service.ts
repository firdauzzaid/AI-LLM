import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ZodSchema } from 'zod';
import type { EnvConfig } from '../config/env.schema';

export class AiValidationError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: unknown,
  ) {
    super(message);
    this.name = 'AiValidationError';
  }
}

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private client!: OpenAI;
  private defaultModel!: string;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  onModuleInit() {
    const groqKey = this.config.get('GROQ_API_KEY', { infer: true });

    if (!groqKey) {
      this.logger.warn(
        'GROQ_API_KEY is not set — AI calls will fail at runtime. Add it to your .env file.',
      );
      return;
    }

    this.client = new OpenAI({
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    this.defaultModel = this.config.get('GROQ_MODEL', { infer: true });
    this.logger.log(`AI provider: Groq (model: ${this.defaultModel})`);
  }

  async callStructured<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: ZodSchema<T>,
    options: { model?: string; temperature?: number } = {},
  ): Promise<{ output: T; rawResponse: unknown; tokens: number }> {
    if (!this.client) {
      throw new Error(
        'AI client is not initialized. Set GROQ_API_KEY in your .env file.',
      );
    }

    const model = options.model ?? this.defaultModel;
    const temperature = options.temperature ?? 0.1;
    const startMs = Date.now();

    const completion = await this.client.chat.completions.create({
      model,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const latencyMs = Date.now() - startMs;
    const tokens = completion.usage?.total_tokens ?? 0;
    this.logger.debug(`AI call: model=${model} tokens=${tokens} latency=${latencyMs}ms`);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new AiValidationError('Empty response from AI provider', null);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new AiValidationError(
        `AI response is not valid JSON: ${content.slice(0, 200)}`,
        content,
      );
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      throw new AiValidationError(
        `AI response failed schema validation: ${issues}`,
        parsed,
      );
    }

    return { output: result.data, rawResponse: parsed, tokens };
  }
}
