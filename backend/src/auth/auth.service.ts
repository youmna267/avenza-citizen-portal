import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Redis } from 'ioredis';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { REDIS_CLIENT } from '../common/redis/redis.module';

const BCRYPT_ROUNDS = 12; // cost factor 12 per RFP security spec

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    if (dto.cnic) {
      const existingCnic = await this.usersRepository.findOne({
        where: { cnic: dto.cnic },
      });
      if (existingCnic) {
        throw new ConflictException('An account with this CNIC already exists');
      }
    }

    // bcrypt cost factor 12 — brute-force resistant per RFP spec
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.usersRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      cnic: dto.cnic,
      address: dto.address,
      passwordHash,
    });

    const saved = await this.usersRepository.save(user);
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    // Same error for wrong email and wrong password — prevents user enumeration
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    // Check if this refresh token has been blacklisted (i.e. user logged out)
    const blacklisted = await this.redis.get(`blacklist:refresh:${refreshToken}`);
    if (blacklisted) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Rotate: blacklist the used refresh token so it cannot be reused
    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redis.setex(`blacklist:refresh:${refreshToken}`, ttl, '1');
    }

    return this.buildAuthResponse(user);
  }

  async logout(accessToken: string, refreshToken?: string) {
    // Blacklist the access token for its remaining lifetime
    try {
      const payload = this.jwtService.decode(accessToken) as any;
      if (payload?.exp) {
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redis.setex(`blacklist:access:${accessToken}`, ttl, '1');
        }
      }
    } catch {
      // If we can't decode, just ignore
    }

    // Blacklist the refresh token too if provided
    if (refreshToken) {
      try {
        const payload = this.jwtService.verify(refreshToken, {
          secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        }) as any;
        if (payload?.exp) {
          const ttl = payload.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await this.redis.setex(`blacklist:refresh:${refreshToken}`, ttl, '1');
          }
        }
      } catch {
        // Token already expired, nothing to blacklist
      }
    }

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { passwordHash, ...profile } = user;
    return profile;
  }

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Short-lived access token (15 min)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    // Long-lived refresh token (7 days)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const { passwordHash, ...profile } = user;

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer',
      user: profile,
    };
  }
}
