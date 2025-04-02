import mongoose from 'mongoose'

export interface IArtwork {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  startingPrice: number
  currentPrice: number
  endDate: Date
  imageUrl: string
  artist: mongoose.Types.ObjectId
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD'
  createdAt: Date
  updatedAt: Date
}

const artworkSchema = new mongoose.Schema<IArtwork>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    endDate: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'ENDED', 'SOLD'],
      default: 'DRAFT',
    },
  },
  {
    timestamps: true,
  }
)

// Create the model only if it doesn't exist
const Artwork = mongoose.models?.Artwork || mongoose.model<IArtwork>('Artwork', artworkSchema)

export { Artwork } 