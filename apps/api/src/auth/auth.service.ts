import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { EnvConfig } from '../config/env.schema';
import type { SignupDto } from './dto/signup.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvConfig, true>,
  ) {}

  async signup(dto: SignupDto): Promise<{ accessToken: string }> {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already in use');

    const rounds = this.config.get('BCRYPT_ROUNDS', { infer: true });
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash },
    });

    return { accessToken: this.sign({ sub: user.id, email: user.email }) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const valid =
      user !== null && (await bcrypt.compare(dto.password, user.passwordHash));

    // Constant-time rejection — don't leak whether the email exists
    if (!user || !valid) throw new UnauthorizedException('Invalid credentials');

    return { accessToken: this.sign({ sub: user.id, email: user.email }) };
  }

  private sign(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }
}
