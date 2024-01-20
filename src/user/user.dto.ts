import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  Equals,
  IsOptional,
  IsDateString,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Request } from 'express';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Equals('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsIn(['male', 'female'], {
    message: 'Invalid gender. Must be "male" or "female".',
  })
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  horoscope?: string;

  @IsOptional()
  @IsString()
  chineseZodiac?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString({ each: true }) // Ensure each item in the array is a string
  interests?: string[];

  @IsOptional()
  image?: Request['file'];
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  // Include other fields to update as needed
}
