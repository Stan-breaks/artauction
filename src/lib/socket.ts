import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const initSocket = (res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected');

      // Join auction room
      socket.on('join-auction', (auctionId: string) => {
        socket.join(`auction-${auctionId}`);
        console.log(`Client joined auction: ${auctionId}`);
      });

      // Leave auction room
      socket.on('leave-auction', (auctionId: string) => {
        socket.leave(`auction-${auctionId}`);
        console.log(`Client left auction: ${auctionId}`);
      });

      // Handle new bid
      socket.on('new-bid', async (data: { auctionId: string; amount: number; userId: string }) => {
        try {
          const { auctionId, amount, userId } = data;
          const client = await clientPromise;
          const db = client.db();

          // Get auction details
          const auction = await db.collection('auctions').findOne({
            _id: new ObjectId(auctionId)
          });

          if (!auction) {
            socket.emit('bid-error', { message: 'Auction not found' });
            return;
          }

          // Validate bid
          if (amount < auction.currentPrice + auction.minBidIncrement) {
            socket.emit('bid-error', { 
              message: `Bid must be at least ${auction.currentPrice + auction.minBidIncrement}` 
            });
            return;
          }

          // Create bid
          const bid = {
            _id: new ObjectId(),
            auctionId: new ObjectId(auctionId),
            userId: new ObjectId(userId),
            amount,
            timestamp: new Date(),
          };

          await db.collection('bids').insertOne(bid);

          // Update auction current price
          await db.collection('auctions').updateOne(
            { _id: new ObjectId(auctionId) },
            { $set: { currentPrice: amount } }
          );

          // Get user details for the bid
          const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { name: 1 } }
          );

          // Create notification for previous highest bidder
          const previousBids = await db.collection('bids')
            .find({ auctionId: new ObjectId(auctionId) })
            .sort({ amount: -1 })
            .limit(2)
            .toArray();

          if (previousBids.length > 1) {
            const previousHighestBidder = previousBids[1];
            if (previousHighestBidder.userId.toString() !== userId) {
              await db.collection('notifications').insertOne({
                userId: previousHighestBidder.userId,
                title: 'You have been outbid',
                message: `Someone placed a higher bid of ${amount} KES on ${auction.artwork.title}`,
                type: 'OUTBID',
                relatedId: auctionId,
                read: false,
                createdAt: new Date(),
              });
            }
          }

          // Broadcast new bid to all users in the auction room
          io.to(`auction-${auctionId}`).emit('bid-update', {
            bid: {
              ...bid,
              user: { name: user?.name || 'Anonymous' }
            },
            currentPrice: amount,
          });

        } catch (error) {
          console.error('Error processing bid:', error);
          socket.emit('bid-error', { message: 'Failed to process bid' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  return res.socket.server.io;
}; 