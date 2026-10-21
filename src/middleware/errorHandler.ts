import type { Request, Response, NextFunction } from 'express'
import { env } from '../../env.ts'

export class APIError extends Error {
  status: number

  constructor(message: string, name: string, status: number) {
    super(message)
    this.name = name
    this.status = status
  }
}
export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack)
  let status = err.status || 500
  let message = err.message || 'Internal server error'

  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation Error'
  }
  if (err.name === 'UnauthorizedError') {
    status = 401
    message = 'Unauthorized'
  }
  if (err.name === 'ForbiddenError') {
    status = 403
    message = 'Forbidden'
  }

  return res.status(status).json({
    error: message,
    ...(env.APP_STAGE === 'dev' && {
      stack: err.stack,
      details: err.message,
    }),
  })
}
