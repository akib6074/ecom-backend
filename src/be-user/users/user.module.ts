import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BcryptService,
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
  UserEntity,
} from '@test/ecom-common';

import { UserController } from './user/controllers/user.controller';
import { UserService } from './user/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  exports: [UserService],

  providers: [
    UserService,
    ConversionService,
    ResponseService,
    BcryptService,
    ExceptionService,
    RequestService,
    RequestService,
    ExceptionService,
  ],
  controllers: [UserController],
})
export class UserModule {}
