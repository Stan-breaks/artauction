import mongoose from 'mongoose'

export interface IBid {
  artwork: mongoose.Types.ObjectId
  bidder: mongoose.Types.ObjectId
  amount: number
  createdAt: Date
  updatedAt: Date
}

const bidSchema = new mongoose.Schema<IBid>(
  {
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

export const Bid = mongoose.models.Bid || mongoose.model<IBid>('Bid', bidSchema) 