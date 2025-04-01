import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { MongoClient } from 'mongodb';

// This function handles user registration and saves the data to MongoDB
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, userType } = await req.json();

    // Validate the request data
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' }, 
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB URI not configured');
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
      await client.connect();
      const db = client.db();
      const usersCollection = db.collection('users');

      // Check if email already exists
      const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' }, 
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);

      // Set the user role based on userType
      const role = userType === 'artist' ? 'artist' : 'user';

      // Create a new user object
      const newUser = {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert the user into the database
      const result = await usersCollection.insertOne(newUser);

      console.log(`User registered: ${email}`);

      return NextResponse.json(
        { 
          success: true,
          message: 'User registered successfully',
          userId: result.insertedId.toString()
        },
        { status: 201 }
      );
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' }, 
      { status: 500 }
    );
  }
} 