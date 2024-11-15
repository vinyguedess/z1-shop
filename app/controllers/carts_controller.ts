import CartsService from '#services/carts_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class CartsController {
  constructor(protected cartsService: CartsService) {}

  /**
   * @create
   * @tag Cart
   * @description Create new cart for device and user
   * @requestBody <Cart>.only(device_id)
   * @responseHeader 201 - ETag - ID of newly created cart
   * @responseHeader 201 - Location - URL of newly created cart
   */
  async create(ctx: HttpContext) {
    const userId = await this.getUserIdFromContext(ctx)

    const data = ctx.request.only(['device_id'])
    const cart = await this.cartsService.create(data['device_id'], userId)

    ctx.response.status(201)
    ctx.response.header('ETag', cart.id)
    ctx.response.header('Location', `/carts/${cart.deviceId}`)
  }

  private async getUserIdFromContext(ctx: HttpContext): Promise<number | null> {
    try {
      const user = await ctx.auth.use('jwt').authenticate()
      return user.id
    } catch (error) {
      return null
    }
  }
}
