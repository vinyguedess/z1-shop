import { InvalidEmailAndOrPassword, UserAlreadyExists } from '#exceptions/users_exceptions'
import UsersService from '#services/users_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class AuthController {
  constructor(protected usersService: UsersService) {}

  /**
   * @signUp
   * @tag Auth
   * @description Allow client to sign up as a user
   * @requestBody <User>.exclude(id, is_admin, created_at, updated_at).append("password": "password")
   * @responseBody 200 - {type: string, access_token: string, expires_in: number}
   */
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

  /**
   * @signIn
   * @tag Auth
   * @description Allow client to sign in as a user
   * @requestBody <User>.only(email).append("password": "password")
   * @responseBody 200 - {type: string, access_token: string, expires_in: number}
   */
  async signIn(ctx: HttpContext) {
    try {
      const user = await this.usersService.signIn(ctx.request.all())

      return ctx.auth.use('jwt').generate(user)
    } catch (error) {
      if (error instanceof InvalidEmailAndOrPassword)
        return ctx.response.unauthorized({
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
