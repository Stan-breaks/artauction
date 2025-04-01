import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    const users = db.collection('users');

    // Check if user exists
    const existingUser = await users.findOne({ email });

    if (existingUser) {
      await client.close();
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      name,
      role: role || 'USER',
      createdAt: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId.toString(), role: role || 'USER' },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    await client.close();

    return NextResponse.json({
      user: {
        id: result.insertedId.toString(),
        name,
        email,
        role: role || 'USER',
      },
      token,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 