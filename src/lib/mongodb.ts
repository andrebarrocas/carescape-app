import mongoose, { Mongoose } from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// After this point, cached is always defined

async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn;
  }
  if (!cached!.promise) {
    const opts = { bufferCommands: false };
    cached!.promise = mongoose.connect(MONGODB_URI!, opts); // non-null assertion
  }
  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }
  return cached!.conn;
}

export default dbConnect; 