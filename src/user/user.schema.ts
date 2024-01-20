// user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  displayName: string;

  @Prop({ enum: ['male', 'female'] })
  gender: string;

  @Prop()
  birthday: string;

  @Prop()
  horoscope: string;

  @Prop()
  chineseZodiac: string;

  @Prop()
  height: number;

  @Prop()
  weight: number;

  @Prop({ type: [String] })
  interests: string[];

  // Add more fields as needed

  // Timestamps
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  image: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
