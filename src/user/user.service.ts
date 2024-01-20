// user.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto, LoginUserDto, UpdateProfileDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { createWriteStream } from 'fs';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, confirmPassword } = createUserDto;

    // Check if the user with the given email or username already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email is already in use');
    }

    // Check if the password and confirm password match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    return await newUser.save();
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const { email, password } = loginUserDto;

    // Find the user by email
    const user = await this.userModel.findOne({ email });

    // Check if the user exists and the password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new NotFoundException('Invalid email or password');
    }

    // Generate and return a JWT token
    const token = this.jwtService.sign({
      id: user._id,
      username: user.username,
      email: user.email,
    });
    return { token };
  }

  async getProfile(userId: string): Promise<User> {
    // Check if the user with the given ID exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto & { image?: Request['file'] },
  ): Promise<User> {
    // Check if the user with the given ID exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields from the DTO
    const { displayName, gender, birthday, height, weight, interests, image } =
      updateProfileDto;

    if (displayName !== undefined) user.displayName = displayName;
    if (gender !== undefined) user.gender = gender;
    if (birthday !== undefined) {
      user.birthday = birthday;
      user.horoscope = this.calculateHoroscope(birthday);
      user.chineseZodiac = this.calculateChineseZodiac(birthday);
    }
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;
    if (interests !== undefined) user.interests = interests;

    // Handle image upload using multer
    if (image) {
      // Save the image to a storage location (e.g., server file system, cloud storage)
      const imageFileName = `${userId}_${Date.now()}_${image.originalname}`;
      const imagePath = `./uploads/${imageFileName}`; // Change the path based on your setup

      const writeStream = createWriteStream(imagePath);
      writeStream.write(image.buffer);
      writeStream.end();

      // Save the image path/filename to the user document
      user.image = imagePath; // Adjust this based on your storage strategy
    }

    // Save the updated user
    return await user.save();
  }

  async addInterest(userId: string, interest: string): Promise<User> {
    // Check if the user with the given ID exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the interest is already in the user's interests
    if (user.interests.includes(interest)) {
      throw new ConflictException('Interest already exists for the user');
    }

    // Add the interest to the user's interests
    user.interests.push(interest);

    // Save the updated user
    return await user.save();
  }

  async deleteInterest(userId: string, interest: string): Promise<User> {
    // Check if the user with the given ID exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the interest is in the user's interests
    if (!user.interests.includes(interest)) {
      throw new NotFoundException('Interest not found for the user');
    }

    // Remove the interest from the user's interests
    user.interests = user.interests.filter(
      (existingInterest) => existingInterest !== interest,
    );

    // Save the updated user
    return await user.save();
  }

  private calculateHoroscope(birthday: string): string {
    // Implement logic to calculate horoscope based on birthday
    // You can use a library or your custom logic
    // For demonstration purposes, let's assume a simple implementation
    // Adjust this based on your requirements
    // This is just an example, and you may need to modify it based on your application's needs

    const date = new Date(birthday);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return 'Aries';
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return 'Taurus';
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return 'Gemini';
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return 'Cancer';
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return 'Leo';
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return 'Virgo';
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return 'Libra';
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return 'Scorpio';
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return 'Sagittarius';
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return 'Capricorn';
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return 'Aquarius';
    } else {
      return 'Pisces';
    }
  }

  private calculateChineseZodiac(birthday: string): string {
    // Implement logic to calculate Chinese Zodiac based on birthday
    // You can use a library or your custom logic
    // For demonstration purposes, let's assume a simple implementation
    // Adjust this based on your requirements
    // This is just an example, and you may need to modify it based on your application's needs

    const date = new Date(birthday);
    const year = date.getFullYear();

    const zodiacMap = [
      'Monkey',
      'Rooster',
      'Dog',
      'Pig',
      'Rat',
      'Ox',
      'Tiger',
      'Rabbit',
      'Dragon',
      'Snake',
      'Horse',
      'Goat',
    ];
    const zodiacIndex = (year - 1900) % 12;

    return zodiacMap[zodiacIndex];
  }

  async createProfile(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    // Check if the user with the given email or username already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email is already in use');
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    return await newUser.save();
  }

  // Other user-related methods go here
}
