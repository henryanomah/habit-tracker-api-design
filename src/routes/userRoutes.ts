import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.status(200).json({ message: 'users' })
})
router.get('/:id', (req, res) => {
  res.status(200).json({ message: 'got user' })
})
router.put('/:id', (req, res) => {
  res.status(200).json({ message: 'user updated' })
})
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: 'user deleted' })
})

export default router
