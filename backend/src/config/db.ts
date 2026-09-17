import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('⚠️ MONGODB_URI is not defined in environment variables.');
    console.warn('⚠️ Please add MONGODB_URI to your .env file to enable MongoDB functionality.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30s — allows Atlas free tier to wake up
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    // Also set Mongoose's global buffer timeout so queries wait longer during wake-up
    mongoose.set('bufferTimeoutMS', 30000);
    console.log(`🍃 MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Warning/Error: ${error.message || error}`);
    console.warn('⚠️ Ensure MongoDB is running locally or configure MONGODB_URI with a valid MongoDB Atlas connection string.');
    return false;
  }
};
