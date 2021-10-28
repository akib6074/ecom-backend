import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserDto,
  DtoValidationPipe,
  ResponseDto,
  ResponseService,
  UpdateUserDto,
  UuidValidationPipe,
} from '@test/ecom-common';

import { UserService } from '../services/user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const userDto = this.userService.findById(id);
    //console.log(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, userDto);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Registration successful',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  create(
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    createUserDto: CreateUserDto,
  ): Promise<ResponseDto> {
    const userDto = this.userService.create(createUserDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Registration successful',
      userDto,
    );
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(new DtoValidationPipe({ skipMissingProperties: true }))
    dto: UpdateUserDto,
  ): Promise<ResponseDto> {
    //console.log(dto);
    const userDto = this.userService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'User updated successfully',
      userDto,
    );
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.userService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'User deleted successfully',
      deleted,
    );
  }
}
