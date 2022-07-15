import User from "../models/user.js";
import ErrorHandle from '../utils/errorHandler.js'
import catchAsyncError from '../middlewares/catchAsyncError.js'
import sendToken from "../utils/jwtToken.js";
import sendEmail from '../utils/sendEmail.js'
import crypto from 'crypto';
import dotenv from 'dotenv';
import { send } from "process";

dotenv.config({ path: `${process.env.PWD}/config/config.env` })

// Register a user => /api/v1/register

export const registerUser = catchAsyncError(async (req, res, next) => {
    const { email, password, name } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'logo_xwfxew',
            url: 'https://res.cloudinary.com/dgk2v0v6r/image/upload/v1656241457/logo_xwfxew.png'
        }
    });

    sendToken(user, 200, res);
})


// Login a user => /api/v1/login
export const loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    // check if email and password are valid
    if (!email || !password) {
        return next(new ErrorHandle('Please provide valid email and password', 400));
    }

    // find user in database
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(ErrorHandle('Invalid Email or Password', 401));
    }

    // check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandle('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res);
})

// Forgot Password => /api/v1/password/forgot
export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandle('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow: \n\n${resetUrl}\n\nif you did not request this, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Your ${process.env.PROJECT_NAME} password reset token (valid for 30 minutes)`,
            message
        })

        res.status(200).json({
            success: true,
            massage: `Email has been sent to ${user.email}`
        })
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandle(err.massage, 500));
    }
})

// Reset Password => /api/v1/password/reset/:token
export const resetPassword = catchAsyncError(async (req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpires: { $gt: Date.now() }
    })
    if (!user) {
        return next(new ErrorHandle('Password reset token is invalid or has been expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandle('Password do not match', 400));
    }

    // setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    sendToken(user, 200, res);
})

// Get currently logged in user details => /api/v1/me
export const getMe = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

// Update  / Change password => /api/v1/password/update
export const updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // check previous password of the user
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return next(new ErrorHandle('Invalid old password', 401));
    }

    user.password = req.body.password;
    await user.save()

    sendToken(user, 200, res);


})

// Update user profile => /api/v1/me/update
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar: TODO


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        massage: "User profile updated successfully",
        updatedFields: newUserData,
    })
})

// Update user profile by ADMIN => /api/v1/admin/user/:id
export const updateUserByAdmin = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    console.log({ user });

    res.status(200).json({
        success: true,
        massage: "User profile updated successfully",
        updatedFields: newUserData,
        user
    })
})

// Logout a user => /api/v1/logout
export const logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logout Successful'
    })

})

// Get all users => /api/v1/admin/users
export const allUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find({});

    res.status(200).json({
        success: true,
        count: users.length,
        users
    })
})

// Get user details => /api/v1/admin/users/:id
export const getUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandle(`User not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user
    })
})

// Delete user => /api/v1/admin/users/:id
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandle(`User not found with id ${req.params.id}`, 404));
    }

    // Remove avatar from cloud - TODO

    await user.remove();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    })
})