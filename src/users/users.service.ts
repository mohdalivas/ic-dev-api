import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel) {}

  async create(input: CreateUserDto) {
    // return 'This action adds a new user';
    try {
      // console.log('userDto', userDto)
      const savable = new this.userModel(input);
      let user = await savable.save();
      // .then(async user => {
      // Generate 20 bit activation code.
      return new Promise((resolve, reject) => {
        crypto.randomBytes(20, async (error, buf) => {
          if (error) reject(error);
          // Ensure the activation code is unique.
          user.activeToken = user._id + buf.toString('hex');
          // Set expiration time is 24 hours.
          user.activeExpires = Date.now() + 24 * 3600 * 1000;
          // save user object
          await user.save();
          // .then(async user => {
          // Send activation email
          resolve({
            message:
              'User registered successfully. Please get activated before login.',
          });
        });
      });
    } catch (error) {
      console.log('user create error', error);
      throw new UnprocessableEntityException(error);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(user: any, option = {}) {
    let userInfo = await this.userModel.findOne(user, option).lean()
    if (!userInfo) throw 'User not found'
    return userInfo
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
