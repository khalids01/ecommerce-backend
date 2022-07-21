import express from 'express'
import cors from 'cors'
import productsRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import errorMiddleware from './middlewares/errors.js'
import orderRoutes from './routes/orderRoutes.js'

const app = express()

import cookieParser from 'cookie-parser'

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

// middleware for error handling
app.use(errorMiddleware)


app.use(express.json())
app.use(cookieParser())

// for proxy
// app.set("trust proxy", 1)

// import all routs
app.use('/api/v1', authRoutes)
app.use('/api/v1', productsRoutes)
app.use('/api/v1', orderRoutes)


export default app