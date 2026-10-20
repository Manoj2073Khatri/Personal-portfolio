import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsJWT,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ format: 'password' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsJWT()
  refreshToken: string;
}

export class AuthUserResponse {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true, type: String }) name: string | null;
  @ApiProperty({ enum: Role }) role: Role;
}

export class TokenResponse {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ description: 'Access token lifetime in seconds' })
  accessTokenExpiresIn: number;
  @ApiProperty({ description: 'Refresh token lifetime in seconds' })
  refreshTokenExpiresIn: number;
  @ApiProperty({ type: AuthUserResponse }) user: AuthUserResponse;
}
