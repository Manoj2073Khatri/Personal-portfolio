import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { CreateUserInput } from '../user/dto/create-user.input';
import { UserService } from '../user/user.service';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Mutation(() => String)
  async signup(@Args('createUserInput') createUserInput: CreateUserInput) {
    const user = await this.userService.create(createUserInput);
    const { access_token } = await this.authService.login(user);
    return access_token;
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { access_token } = await this.authService.login(user);
    return access_token;
  }
}
