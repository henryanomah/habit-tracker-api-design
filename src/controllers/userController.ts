import type { Response } from 'express'
import { db } from '../db/connection.ts'
import { users } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { comparePasswords, hashPassword } from '../utils/passwords.ts'

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.id
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.json({ user })
  } catch (e) {
    console.error('Get user profile error', e)
    return res.status(500).json({ error: 'Failed to get user profile' })
  }
}

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.id
    const { email, username, firstName, lastName } = req.body
    const [updatedUser] = await db
      .update(users)
      .set({
        email,
        username,
        firstName,
        lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        updatedAt: users.updatedAt,
      })
    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (e) {
    console.error('Update user profile error', e)
    return res.status(500).json({ error: 'Failed to update user profile' })
  }
}

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user!.id
    const { currentPassword, newPassword } = req.body

    const [user] = await db.select().from(users).where(eq(users.id, userId))
    if (!user) {
      return res.status(404).json({ error: 'Users does not exist' })
    }

    const isValidPassword = await comparePasswords(
      currentPassword,
      user.password,
    )
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password does not match' })
    }
    const hashedNewPassword = await hashPassword(newPassword)

    await db
      .update(users)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return res.json({
      message: 'Password changed successfully',
    })
  } catch (e) {
    console.error('Change password error', e)
    return res.status(500).json({ error: 'Failed to change password' })
  }
}
