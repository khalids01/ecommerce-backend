import ErrorHandler from "../utils/errorHandler.js";

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.massage = err.message || "Internal Server wrong";

    if (process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMassage: err.message,
            stack: err,
            res
        })
    }

    if (process.env.NODE_ENV = 'PRODUCTION') {
        let error = { ...err }

        error.massage = err.message

        // wrong mongoose object ID Error
        if (err.name === 'CastError') {
            const massage = 'Resource not found. Invalid: ' + err.path
            error = new ErrorHandler(massage, 400)
        }

        // mongoose validation error
        if (err.name === 'ValidationError') {
            const massage = Object.values(err.errors).map(val => val.message)
            error = new ErrorHandler(massage, 400)
        }

        // Handling duplicate entry error
        if (err.code === 11000) {
            const massage = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(massage, 400)
        }

        // Handling wrong JWT error
        if (err.name === 'JsonWebTokenError') {
            const massage = 'Invalid Token, Try Again!!!'
            error = new ErrorHandler(massage, 401)
        }

        // Handling Expired JWT error
        if (err.name === 'TokenExpiredError') {
            const massage = 'Token Expired, Try Again!!!'
            error = new ErrorHandler(massage, 401)
        }

        res.status(res.statusCode).json({
            success: false,
            message: error.message || 'Internal Server wrong',
        });
    }

}

export default errorMiddleware;