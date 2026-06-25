import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../common/redis/redis.module';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
      passReqToCallback: true, // needed to extract raw token for blacklist check
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    // Extract raw token and check if it has been blacklisted (i.e. user logged out)
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      const blacklisted = await this.redis.get(`blacklist:access:${token}`);
      if (blacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
