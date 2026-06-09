import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import UserModel from './src/models/user.model.js';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const start = Date.now();
  console.log('Finding user...');
  const adminUsers = await UserModel.find({ role: 'admin' });
  if (adminUsers.length) {
      const user = await UserModel.findById(adminUsers[0]._id);
      console.log('User found:', user.email);
  }
  console.log('Took:', Date.now() - start, 'ms');
  process.exit(0);
}).catch(console.error);
