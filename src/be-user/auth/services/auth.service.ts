import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BcryptService,
  LoginDto,
  Redis,
  SystemException,
  UserDto,
  UserResponseDto,
} from '@test/ecom-common';
import * as jwt from 'jsonwebtoken';
import { RedisService } from 'nestjs-redis';

import { UserService } from '../../users/user/services/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly bcryptService: BcryptService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto): Promise<UserResponseDto> {
    try {
      const user = await this.validateUser(loginDto);
      const userResponseDto = await this.generatePayload(user);
      const accessToken = await this.generateToken(userResponseDto, loginDto);
      await this.redisService
        .getClient(Redis.REDIS_SESSION)
        .set(accessToken, JSON.stringify(userResponseDto));
      userResponseDto.accessToken = accessToken;

      return Promise.resolve(userResponseDto);
    } catch (error) {
      //console.log(loginDto);
      throw new SystemException(error);
    }
  }

  async generateToken(
    payload: UserResponseDto,
    loginDto: LoginDto,
  ): Promise<string> {
    const privateKEY = this.configService
      .get('PRIVATE_KEY')
      .replace(/\\n/g, '\n');

    let accessToken;

    if (loginDto.isChecked === 1) {
      accessToken = jwt.sign({ ...payload }, privateKEY, {
        expiresIn: '365d',
        algorithm: 'RS256',
      });
    } else {
      accessToken = jwt.sign({ ...payload }, privateKEY, {
        expiresIn: '1h',
        algorithm: 'RS256',
      });
    }
    this.logger.log('access token: ' + accessToken);
    return Promise.resolve(accessToken);
  }

  async generatePayload(userDto: UserDto): Promise<UserResponseDto> {
    const userResponseDto = new UserResponseDto();
    userResponseDto.userId = userDto.id;
    userResponseDto.phone = userDto.phone;
    userResponseDto.userName = userDto.firstName + ' ' + userDto.lastName;
    return Promise.resolve(userResponseDto);
  }

  async validateUser(loginDto: LoginDto): Promise<UserDto> {
    try {
      const user: UserDto = await this.userService.findOneByEmailOrPhone(
        loginDto.phone || loginDto.email,
      );

      const isPasswordMatched = await this.bcryptService.comparePassword(
        loginDto.password,
        user?.password,
      );

      if (!isPasswordMatched) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User password is not valid',
        });
      }
      return user;
    } catch (error) {
      throw new SystemException(error);
    }
  }
}
