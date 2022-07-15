import dotenv from 'dotenv'
import connectDatabase from '../config/database.js'
import app from './app.js'

// SETTING UP CONFIG FILE, (ENVIRONMENT VARIABLES)
dotenv.config({ path: `${process.env.PWD}/config/config.env` })
// Connect to database
connectDatabase()

const server = app.listen(process.env.PORT, () => {
    console.log(`Express Server on PORT : ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})

// handling Uncaught Exception
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log(`ERROR_STACK: ${err.stack}`);
    console.log('Shutting down the server due to Uncaught exception Promise rejection...');
    server.close(() => {
        process.exit(1);
    })
})


// handling unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log(`ERROR_STACK: ${err.stack}`);
    console.log('Shutting down the server due to Unhandled Promise rejection...');
    server.close(() => {
        process.exit(1);
    })
})

