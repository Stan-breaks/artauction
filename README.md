# ArtAuction

A simple platform for buying and selling artwork through auctions.

## Features

- User authentication (signup/login)
- Artwork listing and viewing
- Bidding on artworks
- Artist artwork upload
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB with Prisma
- Tailwind CSS
- JWT Authentication
- Cloudinary for image storage

## Prerequisites

- Node.js 18 or later
- MongoDB
- Cloudinary account (for image storage)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/artauction.git
   cd artauction
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your credentials:
   - MongoDB connection string
   - JWT secret key
   - Cloudinary credentials

5. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── artworks/          # Artwork pages
├── components/            # React components
├── lib/                   # Utility functions
└── prisma/               # Database schema
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) 