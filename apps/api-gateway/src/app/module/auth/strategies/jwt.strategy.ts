import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          let token = null;
          if (request?.cookies && (request.cookies['token'] || request.cookies['jwt'])) {
            token = request.cookies['token'] || request.cookies['jwt'];
          } else if (request?.headers?.cookie) {
            const match = request.headers.cookie.match(/(?:^|;\s*)(?:token|jwt)=([^;]+)/);
            if (match) {
              token = decodeURIComponent(match[1]);
            }
          }
          if (!token && request?.headers?.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ') && authHeader.slice(7).trim() !== 'undefined' && authHeader.slice(7).trim() !== 'null') {
              token = authHeader.slice(7).trim();
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-local-jwt-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
