import { connectToDatabase } from './db'
import { User } from '@/models/User'
import { Artwork } from '@/models/Artwork'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    await connectToDatabase()

    // Clear existing data
    await User.deleteMany({})
    await Artwork.deleteMany({})

    // Create users
    const users = await User.create([
      {
        name: 'John Artist',
        email: 'john@artist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ARTIST',
      },
      {
        name: 'Sarah Artist',
        email: 'sarah@artist.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ARTIST',
      },
      {
        name: 'Bob Collector',
        email: 'bob@collector.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
      },
      {
        name: 'Admin User',
        email: 'admin@admin.com',
        password: await bcrypt.hash('password123', 10),
        role: 'ADMIN',
      },
    ])

    // Create artworks
    const artworks = await Artwork.create([
      {
        title: 'Sunset at Lake Nakuru',
        description: 'A stunning capture of flamingos at Lake Nakuru during sunset, showcasing the vibrant colors of Kenya\'s natural beauty.',
        startingPrice: 35000,
        currentPrice: 35000,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        imageUrl: '/images/artworks/sunset-nakuru.jpg',
        artist: users[0]._id, // John Artist
        status: 'ACTIVE',
      },
      {
        title: 'Maasai Market Day',
        description: 'A vibrant depiction of the bustling Maasai market, capturing the rich culture and traditions of the Maasai people.',
        startingPrice: 45000,
        currentPrice: 45000,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        imageUrl: '/images/artworks/maasai-market.jpg',
        artist: users[1]._id, // Sarah Artist
        status: 'ACTIVE',
      },
      {
        title: 'Urban Life in Nairobi',
        description: 'A contemporary perspective of modern life in Nairobi, showcasing the city\'s dynamic energy and urban culture.',
        startingPrice: 55000,
        currentPrice: 55000,
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        imageUrl: '/images/artworks/nairobi-life.jpg',
        artist: users[0]._id, // John Artist
        status: 'ACTIVE',
      },
      {
        title: 'Wildlife at Dusk',
        description: 'A mesmerizing portrayal of African wildlife during the golden hour, featuring elephants and acacia trees.',
        startingPrice: 65000,
        currentPrice: 65000,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        imageUrl: '/images/artworks/wildlife-dusk.jpg',
        artist: users[1]._id, // Sarah Artist
        status: 'ACTIVE',
      },
    ])

    console.log('Database seeded successfully!')
    console.log('Created users:', users.length)
    console.log('Created artworks:', artworks.length)
    
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed() 