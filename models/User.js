// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  password: { type: String, required: true },
  university: { type: String, required: true },
  major: { type: String },
  year: { type: Number, min: 1, max: 10 },
  profilePicture: { type: String },
  bio: { type: String, maxlength: 500 },
  reputationScore: { type: Number, default: 0 },
  questionsAsked: { type: Number, default: 0 },
  answersGiven: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: true }, // Set to true by default, no verification needed
  
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema); // Important for Next.js hot reload
export default User;