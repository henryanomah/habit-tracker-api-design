import { db } from '../../db/connection.ts'
import {
  users,
  habits,
  entries,
  type NewUser,
  type NewHabit,
  habitTags,
  tags,
} from '../../db/schema.ts'
import { generateToken } from '../../utils/jwt.ts'
import { hashPassword } from '../../utils/passwords.ts'

export const createTestUser = async (userData: Partial<NewUser> = {}) => {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@gmail.com`,
    username: `testuser-1${Date.now()}-${Math.random()}`,
    password: 'adminPass123',
    firstName: 'Test',
    lastName: 'User',
    ...userData,
  }
  const hashedPassword = await hashPassword(defaultData.password)
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning()

  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  })

  return { token, user, rawPassword: defaultData.password }
}

export const createTestHabit = async (
  userId: string,
  habitData: Partial<NewHabit> = {},
) => {
  const defaultHabit = {
    name: `Test habit-${Date.now()}`,
    description: 'A test habit',
    frequency: 'daily',
    targetCount: 1,
    ...habitData,
  }

  const [habit] = await db
    .insert(habits)
    .values({
      userId,
      ...defaultHabit,
    })
    .returning()

  return habit
}

export const cleanUpDatabase = async () => {
  await db.delete(entries)
  await db.delete(habits)
  await db.delete(users)
  await db.delete(habitTags)
  await db.delete(tags)
}
