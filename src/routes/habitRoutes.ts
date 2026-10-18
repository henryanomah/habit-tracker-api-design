import { Router } from 'express'
import z from 'zod'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { authenticateToken } from '../middleware/auth.ts'
import {
  completeHabit,
  createHabit,
  deleteHabit,
  getHabitById,
  getUserHabits,
  updateHabit,
} from '../controllers/habitController.ts'

const createHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.number(),
  tagIds: z.array(z.string()).optional(),
})

const completeParamsSchema = z.object({
  id: z.string(),
})

const router = Router()

router.use(authenticateToken)

router.get('/', getUserHabits)
router.get('/:id', getHabitById)

router.patch('/:id', updateHabit)

router.post('/', validateBody(createHabitSchema), createHabit)

router.post(
  '/:id/complete',
  validateParams(completeParamsSchema),
  validateBody(createHabitSchema),
  completeHabit,
)

router.delete('/:id', deleteHabit)

export default router
