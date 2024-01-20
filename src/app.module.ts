// app.module.ts

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    MulterModule.register({
      dest: './uploads', // Set the destination directory for uploaded files
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
