import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, NotFoundException,  ConflictException, HttpStatus, HttpException, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
      rememberField: 'remember',
      passReqToCallback: true
    });
  }

  async validate(req: any, username: string, password: string): Promise<any> {
    try {
      return await this.authService.validateUser(username, password).then(async user => {
        if (!user) throw new UnauthorizedException()
        else if (user && user['message']) throw new NotFoundException(user['message'])
        return user;
      })
    } catch (error) {
      console.log('local validate error', error)
      throw new UnprocessableEntityException(error)
    }
  }
}
