import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'JWT_SECRET', // use process.env.JWT_SECRET ideally
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy, AuthResolver],
})
export class AuthModule {}
