import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  DtoValidationPipe,
  LoginDto,
  ResponseService,
  UserResponseDto,
} from '@test/ecom-common';

import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Login is successful',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    loginDto: LoginDto,
  ) {
    //console.log('working as well');
    //console.log(loginDto);
    const payload = this.authService.login(loginDto);
    return this.responseService.toResponse<UserResponseDto>(
      HttpStatus.OK,
      'Login is successful',
      payload,
    );
  }
}
