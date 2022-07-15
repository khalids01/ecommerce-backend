import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncError from "./catchAsyncError.js";
dotenv.config({ path: `${process.env.PWD}/config/config.env` })

// checks if user is authenticated
export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Login first to access this route", 403));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next()

})


// handling Users ROLE
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed access this route`, 403))
        }
        next()
    }
}

