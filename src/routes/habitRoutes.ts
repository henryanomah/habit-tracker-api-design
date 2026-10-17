import { Router } from 'express'
import z from 'zod'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { authenticateToken } from '../middleware/auth.ts'

const createHabitSchema = z.object({
  name: z.string(),
})

const completeParamsSchema = z.object({
  id: z.string(),
})

const router = Router()

router.use(authenticateToken)

router.get('/', (req, res) => {
  res.status(200).json({ message: 'habits' })
})
router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'got one habit' })
})

router.post('/', (req, res) => {
  res.status(201).json({ message: 'created habit' })
})
router.delete('/:id', (req, res) => {
  res.status(204).json({ message: 'deleted habit' })
})

router.post(
  '/:id/complete',
  validateParams(completeParamsSchema),
  validateBody(createHabitSchema),
  (req, res) => {
    res.status(201).json({ message: 'completed habit' })
  },
)

export default router
