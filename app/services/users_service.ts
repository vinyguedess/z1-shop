import User from '#models/user'
import UsersRepository from '#repositories/users_repository'
import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'

@inject()
export default class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async signUp(data: Record<string, any>): Promise<User> {
    data.password = await hash.make(data.password)
    return this.usersRepository.create(data)
  }
}
