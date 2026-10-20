import { Module } from '@nestjs/common';
import {
  ContactSubmissionsController,
  PublicContactController,
} from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  controllers: [PublicContactController, ContactSubmissionsController],
  providers: [ContactService],
})
export class ContactModule {}
