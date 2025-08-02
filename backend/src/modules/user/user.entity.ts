import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

registerEnumType(Role, {
  name: 'Role',
});

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;
}
