import mongoose from 'mongoose'
import { User } from '@/models/User'
import { Artwork } from '@/models/Artwork'
import { Bid } from '@/models/Bid'
import bcrypt from 'bcryptjs'
import path from 'path'
import fs from 'fs/promises'
import { loadEnv } from './env'

async function copyDefaultImages() {
  const sourceDir = path.join(process.cwd(), 'public/images/defaults')
  const targetDir = path.join(process.cwd(), 'public/images/artworks')

  try {
    // Create target directory if it doesn't exist
    await fs.mkdir(targetDir, { recursive: true })

    // Copy default images
    const defaultImages = [
      'sunset-nakuru.jpg',
      'maasai-market.jpg',
      'nairobi-life.jpg',
      'wildlife-dusk.jpg'
    ]

    for (const image of defaultImages) {
      const sourcePath = path.join(sourceDir, image)
      const targetPath = path.join(targetDir, image)
      try {
        await fs.copyFile(sourcePath, targetPath)
        console.log(`Copied ${image} successfully`)
      } catch (error: any) {
        console.warn(`Warning: Could not copy ${image}: ${error.message}`)
      }
    }
  } catch (error: any) {
    console.warn('Warning: Error copying default images:', error.message)
  }
}

async function seed() {
  let connection: typeof mongoose | undefined

  try {
    console.log('Loading environment variables...')
    const env = loadEnv()
    console.log('Environment loaded successfully')

    console.log('Starting database seeding process...')
    console.log('MongoDB URI:', env.MONGODB_URI)

    // Connect to MongoDB
    connection = await mongoose.connect(env.MONGODB_URI)
    console.log('Connected to database successfully!')

    // Clear existing data
    console.log('Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Artwork.deleteMany({}),
      Bid.deleteMany({})
    ])
    console.log('Existing data cleared.')

    // Create users
    console.log('Creating users...')
    const users = await Promise.all([
      User.create({
        name: 'John Artist',
        email: 'john@artist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ARTIST',
      }),
      User.create({
        name: 'Sarah Artist',
        email: 'sarah@artist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ARTIST',
      }),
      User.create({
        name: 'Bob Collector',
        email: 'bob@collector.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      }),
      User.create({
        name: 'Alice Collector',
        email: 'alice@collector.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      }),
      User.create({
        name: 'Admin User',
        email: 'admin@admin.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN',
      })
    ])
    console.log('Users created:', users.length)
    console.log('User IDs:', users.map(user => ({ id: user._id, name: user.name, role: user.role })))

    // Copy default images
    console.log('Copying default images...')
    await copyDefaultImages()
    console.log('Default images copied.')

    // Create artworks
    console.log('Creating artworks...')
    const artworks = await Promise.all([
      Artwork.create({
        title: 'Sunset at Lake Nakuru',
        description: 'A stunning capture of flamingos at Lake Nakuru during sunset, showcasing the vibrant colors of Kenya\'s natural beauty.',
        startingPrice: 35000,
        currentPrice: 42000,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/artworks/sunset-nakuru.jpg',
        artist: users[0]._id,
        status: 'ACTIVE',
      }),
      Artwork.create({
        title: 'Maasai Market Day',
        description: 'A vibrant depiction of the bustling Maasai market, capturing the rich culture and traditions of the Maasai people.',
        startingPrice: 45000,
        currentPrice: 55000,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/artworks/maasai-market.jpg',
        artist: users[1]._id,
        status: 'ACTIVE',
      }),
      Artwork.create({
        title: 'Urban Life in Nairobi',
        description: 'A contemporary perspective of modern life in Nairobi, showcasing the city\'s dynamic energy and urban culture.',
        startingPrice: 55000,
        currentPrice: 65000,
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/artworks/nairobi-life.jpg',
        artist: users[0]._id,
        status: 'ACTIVE',
      }),
      Artwork.create({
        title: 'Wildlife at Dusk',
        description: 'A mesmerizing portrayal of African wildlife during the golden hour, featuring elephants and acacia trees.',
        startingPrice: 65000,
        currentPrice: 75000,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        imageUrl: '/images/artworks/wildlife-dusk.jpg',
        artist: users[1]._id,
        status: 'ACTIVE',
      })
    ])
    console.log('Artworks created:', artworks.length)
    console.log('Artwork IDs:', artworks.map(artwork => ({ id: artwork._id, title: artwork.title })))

    // Create bids
    console.log('Creating bids...')
    const bids = await Promise.all([
      // Bids for Sunset at Lake Nakuru
      Bid.create({
        artwork: artworks[0]._id,
        bidder: users[2]._id,
        amount: 38000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }),
      Bid.create({
        artwork: artworks[0]._id,
        bidder: users[3]._id,
        amount: 42000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }),
      // Bids for Maasai Market Day
      Bid.create({
        artwork: artworks[1]._id,
        bidder: users[3]._id,
        amount: 50000,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }),
      Bid.create({
        artwork: artworks[1]._id,
        bidder: users[2]._id,
        amount: 55000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }),
      // Bids for Urban Life in Nairobi
      Bid.create({
        artwork: artworks[2]._id,
        bidder: users[2]._id,
        amount: 60000,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      }),
      Bid.create({
        artwork: artworks[2]._id,
        bidder: users[3]._id,
        amount: 65000,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }),
      // Bids for Wildlife at Dusk
      Bid.create({
        artwork: artworks[3]._id,
        bidder: users[3]._id,
        amount: 70000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      }),
      Bid.create({
        artwork: artworks[3]._id,
        bidder: users[2]._id,
        amount: 75000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      })
    ])
    console.log('Bids created:', bids.length)
    console.log('Bid IDs:', bids.map(bid => ({ id: bid._id, artwork: bid.artwork, amount: bid.amount })))

    console.log('Database seeded successfully!')
    
    // Close the database connection
    await connection.disconnect()
    console.log('Database connection closed.')
    process.exit(0)
  } catch (error: any) {
    console.error('Error seeding database:', error.message)
    console.error(error.stack)
    if (connection) {
      await connection.disconnect()
      console.log('Database connection closed.')
    }
    process.exit(1)
  }
}

seed() 