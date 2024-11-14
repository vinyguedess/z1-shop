import User from '#models/user'
import { inject } from '@adonisjs/core'

@inject()
export default class UsersRepository {
  async create(data: Record<string, any>): Promise<User> {
    return User.create(data)
  }

  async getById(userId: number): Promise<User | null> {
    return User.find(userId)
  }

  async getByEmail(email: string): Promise<User | null> {
    return User.findBy('email', email)
  }
}
