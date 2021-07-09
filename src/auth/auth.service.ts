import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateAuthDto } from './auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}
  
  register(input: CreateAuthDto) {
    try {
      return this.usersService.create(input);
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException(error);
    }
  }

  login(user) {
    try {
      if (user) {
        const payload = { sub: user.id };
        var token = this.jwtService.sign(payload)
        var decodedToken = this.jwtService.decode(token)
        let data = {
          _id: user._id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          token,
          tokenExpires: decodedToken['exp'],
          refreshToken: undefined,
          admin: user.admin,
          superadmin: user.superadmin
        }
        return data
      }
      else throw 'User not found!';
    } catch (error) {
      console.log(error)
      throw new UnprocessableEntityException(error)
    }
  }

  async validateUser(username: string, pass: string) {
    if (!username || !pass) return { status: 'error', message: 'Username or password not found!' }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let query;
    if (re.test(String(username).toLowerCase())) query = { email: username };
    else query = { username: username };
    return this.usersService.findOne(query).then(user=>{
      if (user && user['password']) {
        return new Promise((resolve, reject) => {
          bcrypt.compare(pass, user['password'], (err, isMatch) => {
            if (err) reject(err);
            if (user && !user['active']) return reject('User not active!')
            else if (isMatch) {
              resolve(user)
            }
            else reject('Wrong Password!')
          })
        })
      } else {
        // console.log('2validateUser user', user, pass)
        return { status: 'error', message: 'User not found!' };
      }
    })
  }

  async validatePayload(req: any, payload: string): Promise<any> {
    return await this.usersService.findOne({ id: payload.sub }, { id: 1, fullname: 1, clientId: 1, _clientId: 1, admin: 1, superadmin: 1, image: 1 }).then(async user => {
      // console.log(user)
      if (user) { //  && user.deviceMAC
        req.user = {}
        payload['id'] = req.user.id = user.id
        payload['name'] = req.user.name = user.fullname
        payload['_id'] = req.user._id = user._id
        payload['clientId'] = req.user.clientId = user.clientId
        payload['_clientId'] = req.user._clientId = user._clientId
        payload['image'] = req.user.image = user.image
        payload['admin'] = req.user.admin = user.admin
        payload['superadmin'] = req.user.superadmin = user.superadmin
        payload['appPermissions'] = req.user.appPermissions = user.appPermissions
        return payload
      } else {
        // console.log('2validateUser user', user, pass)
        return { status: 'error', message: 'User not found!' };
      }
    }).catch(error => {
      console.log('validatePayload error', error, 'validateUser error.Error', error.Error);
      return error;
    });
  }
}