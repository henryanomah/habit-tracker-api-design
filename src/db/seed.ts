import { db } from './connection.ts'
import { users, habits, tags, entries, habitTags } from './schema.ts'
import { fileURLToPath } from 'node:url'

export const seed = async () => {
  console.log('Starting database seed...')

  try {
    console.log('Clearing existing data...')

    await db.delete(entries)
    await db.delete(habitTags)
    await db.delete(habits)
    await db.delete(tags)
    await db.delete(users)

    console.log('Creating a demo user...')
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@gmail.com',
        password: 'password',
        firstName: 'demo',
        lastName: 'person',
        username: 'demo',
      })
      .returning()

    console.log('Creating tags...')
    const [healthTag] = await db
      .insert(tags)
      .values({
        name: 'Health',
        color: '#f4f3f4',
      })
      .returning()

    const [productivityTag] = await db
      .insert(tags)
      .values({ name: 'Productivity', color: '#3B82F6' })
      .returning()

    console.log('Creating a habit...')
    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: demoUser.id,
        name: 'Exercise',
        description: 'Daily workout',
        frequency: 'daily',
        targetCount: 1,
      })
      .returning()

    console.log('Creating a linked habit and tag...')
    await db.insert(habitTags).values({
      habitId: exerciseHabit.id,
      tagId: healthTag.id,
    })
    console.log('Adding completion entries...')
    const today = new Date()
    today.setHours(12, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date,
      })
    }
    console.log('Database seeded successfully!')
    console.log('user credentials:')
    console.log(`email: ${demoUser.email}`)
    console.log(`username: ${demoUser.username}`)
    console.log(`password: ${demoUser.password}`)
  } catch (e) {
    console.error('seed failed', e)
    process.exit(1)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed execution failed:', error)
      process.exit(1)
    })
}

export default seed
