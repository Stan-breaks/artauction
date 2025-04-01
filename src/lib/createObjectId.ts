// Use type-only import for ObjectId to avoid including MongoDB code in client bundles
import type { ObjectId } from 'mongodb';

// Type for our mock ObjectId implementation
type MockObjectId = {
  _bsontype: string;
  id: string;
  toHexString: () => string;
  toString: () => string;
  toJSON: () => string;
  equals: (otherId: any) => boolean;
  getTimestamp: () => Date;
};

/**
 * Creates a mock ObjectId for development and client-side rendering
 * This allows us to use the same type system without requiring MongoDB in client components
 */
export function createObjectId(id?: string): ObjectId {
  // For client-side or development, return a mock ObjectId
  // that implements the necessary methods
  const objectId: MockObjectId = {
    _bsontype: 'ObjectID',
    id: id || Math.random().toString(36).substring(2, 15),
    toHexString: function() { return this.id; },
    toString: function() { return this.id; },
    toJSON: function() { return this.id; },
    equals: function(otherId: any) { 
      return otherId && otherId.toString() === this.toString();
    },
    getTimestamp: function() { return new Date(); }
  };

  return objectId as unknown as ObjectId;
} 