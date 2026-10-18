import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, habitTags, entries, tags, users } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body
    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user!.id,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning()
      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await tx.insert(habitTags).values(habitTagValues)
      }
      return newHabit
    })
    return res.status(201).json({ message: 'habit created', habit: result })
  } catch (e) {
    console.error('Create habit error', e)
    return res.status(500).json({ error: 'Failed to create a habit' })
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user!.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })
    const habitWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }))

    res.json({ habits: habitWithTags })
  } catch (e) {
    console.error('Get habit error', e)
    return res.status(500).json({ error: 'Failed to fetch habit' })
  }
}

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, id), eq(habits.userId, userId)),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
        entries: {
          orderBy: [desc(entries.completionDate)],
          limit: 10,
        },
      },
    })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    const habitWithTag = {
      ...habit,
      tag: habit?.habitTags.map((ht) => ht.tag),
    }
    res.json({
      habit: habitWithTag,
    })
  } catch (e) {
    console.error('Get habit by id error', e)
    return res.status(500).json({ error: 'Failed to fetch habit' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id
    const { tagIds, ...updates } = req.body
    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx
        .update(habits)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(habits.id, id), eq(habits.userId, req.user!.id)))
        .returning()

      if (!updatedHabit) {
        return res.status(401).end()
      }

      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: string) => ({
            habitId: id,
            tagId,
          }))

          await tx.insert(habitTags).values(habitTagValues)
        }
      }
      return updatedHabit
    })
    return res.json({
      message: 'Habit was updated',
      habit: result,
    })
  } catch (e) {
    console.error('Update habit error', e)
    return res.status(500).json({ error: 'Failed to update habit' })
  }
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const [deletedHabit] = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning()
    if (!deletedHabit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    return res.json({ message: 'Habit deleted successfully' })
  } catch (e) {
    console.error('Delete habit error:', e)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
}

export const completeHabit = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const { note } = req.body

    const [habit] = await db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    if (!habit.isActive) {
      return res
        .status(400)
        .json({ error: 'Cannot complete an inactive habit' })
    }

    const [newEntry] = await db
      .insert(entries)
      .values({
        habitId: id,
        completionDate: new Date(),
        note,
      })
      .returning()

    res.status(201).json({
      message: 'Habit completed successfully',
      entry: newEntry,
    })
  } catch (error) {
    console.error('Complete habit error:', error)
    res.status(500).json({ error: 'Failed to complete habit' })
  }
}
