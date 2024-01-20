// user.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto, UpdateProfileDto } from './user.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(@Request() req) {
    return this.userService.createProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, updateUserDto);
  }
}
