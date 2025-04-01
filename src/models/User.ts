import mongoose from 'mongoose'

export interface IUser {
  name: string
  email: string
  password: string
  role: 'USER' | 'ARTIST' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['USER', 'ARTIST', 'ADMIN'],
      default: 'USER',
    },
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema) 