import { config } from 'dotenv'
import path from 'path'

export function loadEnv() {
  const result = config({
    path: path.resolve(process.cwd(), '.env')
  })

  if (result.error) {
    throw new Error('Failed to load environment variables')
  }

  const { MONGODB_URI } = process.env
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  return {
    MONGODB_URI
  }
} 