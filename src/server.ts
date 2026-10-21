import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import userRoutres from './routes/userRoutes.ts'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { isTest } from '../env.ts'
import { errorHandler } from './middleware/errorHandler.ts'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('dev', {
    skip: () => isTest(),
  }),
)

app.get('/health', (req, res) => {
  res.send('<button>Click<button/>')
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutres)
app.use('/api/habits', habitRoutes)

app.use(errorHandler)
export { app }
