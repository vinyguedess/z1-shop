import { InvalidEmailAndOrPassword, UserAlreadyExists } from '#exceptions/users_exceptions'
import User from '#models/user'
import UsersRepository from '#repositories/users_repository'
import { inject } from '@adonisjs/core'
import hash from '@adonisjs/core/services/hash'

@inject()
export default class UsersService {
  constructor(protected usersRepository: UsersRepository) {}

  async signUp(data: Record<string, any>): Promise<User> {
    const user = await this.usersRepository.getByEmail(data.email)
    if (user instanceof User) throw new UserAlreadyExists('E-mail already in use')

    return this.usersRepository.create({
      ...data,
      password: await hash.make(data.password),
      is_admin: false,
    })
  }

  async signIn(data: Record<string, any>): Promise<User> {
    const user = await this.usersRepository.getByEmail(data.email)
    if (!(user instanceof User))
      throw new InvalidEmailAndOrPassword('Invalid e-mail and/or password')

    if (!(await hash.verify(user.password, data.password)))
      throw new InvalidEmailAndOrPassword('Invalid e-mail and/or password')

    return user
  }
}
