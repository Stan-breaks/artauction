import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import NextAuth from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authOptions } from "@/lib/auth";

// We don't need to declare the module here as it's already declared in lib/types.ts
// This also avoids conflicts with multiple declarations

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const client = new MongoClient(process.env.MONGODB_URI);

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };