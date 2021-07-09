import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true
    });
  }

  async validate(req: any, payload: any) {
    return await this.authService.validatePayload(req, payload).then(async payload => {
      // console.log({ payload, user: req.user })
      if (!payload) throw new UnauthorizedException()
      else if (payload && payload.message) throw new NotFoundException(payload.message) //== HttpStatus.NOT_FOUND
      // console.log('2.jwt.strategy validate req.user', req.user, 'payload', payload)
      // return payload;
      return req.user;
    })
  }
}




























