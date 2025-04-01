import mongoose from 'mongoose'
import { User } from '@/models/User'
import { loadEnv } from './env'

async function testDb() {
  try {
    console.log('Loading environment variables...')
    const env = loadEnv()
    console.log('Environment loaded successfully')
    
    console.log('Connecting to MongoDB...')
    console.log('MongoDB URI:', env.MONGODB_URI)
    
    await mongoose.connect(env.MONGODB_URI)
    console.log('Connected successfully!')

    const testUser = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123',
      role: 'USER'
    })

    console.log('Test user created:', testUser)

    const count = await User.countDocuments()
    console.log('Total users:', count)

    await mongoose.disconnect()
    console.log('Disconnected from database')
    process.exit(0)
  } catch (error: any) {
    console.error('Database test failed:', error.message)
    console.error(error.stack)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

testDb() 