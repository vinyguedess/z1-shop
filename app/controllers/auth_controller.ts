import { UserAlreadyExists } from '#exceptions/users_exceptions'
import UsersService from '#services/users_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AuthController {
  constructor(protected usersService: UsersService) {}

  async signUp(ctx: HttpContext) {
    try {
      const user = await this.usersService.signUp(ctx.request.all())

      return ctx.auth.use('jwt').generate(user)
    } catch (error) {
      if (error instanceof UserAlreadyExists)
        return ctx.response.conflict({
          code: error.name,
          message: error.message,
        })

      console.log({
        type: 'SYS',
        level: 'ERROR',
        message: error.message,
        stack_trace: error.stack,
      })
      return ctx.response.internalServerError({ code: error.name, message: error.message })
    }
  }
}
