import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async setRefreshTokenHash(
    userId: string,
    hash: string | null,
    isLogin = false,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hash,
        ...(isLogin ? { lastLoginAt: new Date() } : {}),
      },
    });
  }

  /**
   * Atomically swaps the stored refresh hash only if it still equals `expected`,
   * so two concurrent refreshes with the same token cannot both succeed.
   */
  async rotateRefreshTokenHash(userId: string, expected: string, next: string) {
    const { count } = await this.prisma.user.updateMany({
      where: { id: userId, refreshToken: expected },
      data: { refreshToken: next },
    });
    return count === 1;
  }
}
