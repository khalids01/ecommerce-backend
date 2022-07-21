import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: `${process.env.PWD}/config/config.env` })


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter your name'],
        maxlength: [30, "Name can't be more than 30 characters"],
        minlength: [3, "Name can't be less than 3 characters"]
    },
    email: {
        type: String,
        required: [true, 'Please Enter your email'],
        unique: [true, 'This email is already registered'],
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please Enter your password'],
        minlength: [6, "Password can't be less than 6 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: [true, 'Please upload an avatar']
        },
        url: {
            type: String,
            required: [true, 'Please provide the url of avatar']
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
})


// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

// compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expire time
    this.resetPasswordExpires = Date.now() + 30 * 60 * 1000;


    return resetToken;
}

export default mongoose.model('User', userSchema);