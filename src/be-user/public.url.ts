import { RequestMethod } from '@nestjs/common';

export const publicUrls = [
  { path: '/api/auth/login', method: RequestMethod.POST },
  { path: '/api/users/registration', method: RequestMethod.POST },
];
