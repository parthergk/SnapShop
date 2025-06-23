import mongoose from "mongoose";

const DB_URI = process.env.MONGODB_URI!;

if (!DB_URI) {
  throw new Error("please check the db uri string");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDataBase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };
    cached.promise = mongoose
      .connect(DB_URI, opts)
      .then(() => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
  }
  return cached.conn;
}
