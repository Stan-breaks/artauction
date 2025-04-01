import { MongoClient } from 'mongodb'
import { loadEnv } from './env'

async function testMongo() {
  try {
    console.error('Loading environment variables...')
    const env = loadEnv()
    console.error('Environment loaded successfully')
    
    console.error('Connecting to MongoDB...')
    console.error('MongoDB URI:', env.MONGODB_URI)
    
    const client = new MongoClient(env.MONGODB_URI)
    await client.connect()
    console.error('Connected successfully!')

    const db = client.db()
    const collections = await db.listCollections().toArray()
    console.error('Collections:', collections)

    const testDoc = await db.collection('test').insertOne({
      name: 'Test Document',
      createdAt: new Date()
    })
    console.error('Test document created:', testDoc)

    const count = await db.collection('test').countDocuments()
    console.error('Total test documents:', count)

    await client.close()
    console.error('Disconnected from database')
    process.exit(0)
  } catch (error: any) {
    console.error('MongoDB test failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testMongo() 