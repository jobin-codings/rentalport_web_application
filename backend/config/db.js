const mongoose = require('mongoose');
const dns = require('dns');

// Fix DNS resolution order for Node 17+ on Windows to resolve MongoDB Atlas SRV records
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS servers fail
}

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri || uri.includes('username:password')) {
    console.log('ℹ️ MongoDB URI placeholder detected or missing. Application will run with in-memory database fallback.');
    return false;
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      family: 4
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    isConnectedToMongo = true;
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas connection error: ${error.message}`);
    console.log('🔄 Operating with fast in-memory persistence fallback.');
    return false;
  }
};

const getMongoStatus = () => isConnectedToMongo;

module.exports = { connectDB, getMongoStatus };
