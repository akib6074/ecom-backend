import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ActiveStatus,
  BcryptService,
  ConversionService,
  CreateUserDto,
  DeleteDto,
  ExceptionService,
  isActive,
  RequestService,
  SystemException,
  UpdateUserDto,
  UserDto,
  UserEntity,
} from '@test/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly bcryptService: BcryptService,
    private readonly requestService: RequestService,
  ) {}

  findById = async (id: string): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      //console.log(user);
      this.exceptionService.notFound(user, 'User is not found');
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  create = async (createUserDto: CreateUserDto): Promise<any> => {
    try {
      const user = await this.createUser(createUserDto);
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  createUser = async (createUserDto: CreateUserDto): Promise<UserEntity> => {
    createUserDto.password = await this.bcryptService.hashPassword(
      createUserDto.password,
    );
    //console.log(createUserDto.password);
    let userDto: UserDto = createUserDto;
    userDto = this.requestService.forCreate(userDto);

    const dtoToEntity = await this.conversionService.toEntity<
      UserEntity,
      UserDto
    >(userDto);
    const user = this.userRepository.create(dtoToEntity);
    user.isActive = ActiveStatus.enabled;
    await this.userRepository.save(user);
    return user;
  };

  update = async (id: string, dto: UpdateUserDto): Promise<UserDto> => {
    try {
      const saveDto = await this.getUserAndProfile(id);
      dto.password = await this.bcryptService.hashPassword(dto.password);
      //console.log(saveDto.password);
      dto = this.requestService.forUpdate(dto);
      //console.log(dto);
      const user = await this.conversionService.toEntity<UserEntity, UserDto>({
        ...saveDto,
        ...dto,
      });
      const updatedUser = await this.userRepository.save(user, {
        reload: true,
      });

      return this.conversionService.toDto<UserEntity, UserDto>(updatedUser);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  async getUserAndProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    this.exceptionService.notFound(user, 'User not found!');
    return user;
  }

  remove = async (id: string): Promise<DeleteDto> => {
    try {
      const saveDto = await this.getUser(id);

      const deleted = await this.userRepository.remove(saveDto);
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  };

  getUser = async (id: string): Promise<UserEntity> => {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    this.exceptionService.notFound(user, 'User not found!');
    return user;
  };

  findOneByEmailOrPhone = async (emailOrPhone: string): Promise<UserDto> => {
    try {
      const query = this.userRepository.createQueryBuilder('user');

      const user = await query
        .where(
          '(user.phone = :phone OR user.email = :email) and user.isActive = :isActive',
          {
            phone: emailOrPhone,
            email: emailOrPhone,
            ...isActive,
          },
        )
        .getOne();

      this.exceptionService.notFound(
        user,
        'User is not found by phone or email',
      );

      return await this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
