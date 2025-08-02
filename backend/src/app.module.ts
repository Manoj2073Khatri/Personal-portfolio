import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './infra/prisma/prisma.service';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }), // pass request to resolvers for auth
    }),
    UserModule,
    AuthModule,
  ],
  // controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
