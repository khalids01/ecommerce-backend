import express from 'express'
import productsRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import errorMiddleware from './middlewares/errors.js'
import orderRoutes from './routes/orderRoutes.js'

const app = express()

import cookieParser from 'cookie-parser'
// middleware for error handling
app.use(errorMiddleware)

app.use(express.json())
app.use(cookieParser())

// import all routs
app.use('/api/v1', authRoutes)
app.use('/api/v1', productsRoutes)
app.use('/api/v1', orderRoutes)


export default app