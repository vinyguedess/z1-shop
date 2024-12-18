import { CartNotFound } from '#exceptions/carts_exceptions'
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

  /**
   * @getCart
   * @tag Cart
   * @description Get cart by device id
   * @paramPath deviceId - Device id associated with the cart - @type(string) @required
   * @responseBody 200 - <Cart>
   * @responseBody 404 - {"code": "CART_NOT_FOUND", "message": "Cart not found"}
   */
  async getCart(ctx: HttpContext) {
    try {
      return await this.cartsService.getByDeviceId(ctx.params.deviceId)
    } catch (error) {
      if (error instanceof CartNotFound)
        return ctx.response.notFound({
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
   * @addProduct
   * @tag Cart
   * @description Add product to cart
   * @paramPath deviceId - Device id associated with the cart - @type(string) @required
   * @requestBody <CartProduct>.only(product_id)
   * @responseBody 204 - -
   * @responseBody 404 - {"code": "CART_NOT_FOUND", "message": "Cart not found"}
   */
  async addProduct(ctx: HttpContext) {
    const payload = ctx.request.only(['product_id'])
    try {
      await this.cartsService.addProductToCart(ctx.params.deviceId, payload['product_id'])

      ctx.response.status(204)
    } catch (error) {
      if (error instanceof CartNotFound)
        return ctx.response.notFound({
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
   * @removeProduct
   * @tag Cart
   * @description Decrease amount of product in cart or remove it
   * @paramPath deviceId - Device id associated with the cart - @type(string) @required
   * @requestBody <CartProduct>.only(product_id)
   * @responseBody 204 - -
   * @responseBody 404 - {"code": "CART_NOT_FOUND", "message": "Cart not found"}
   */
  async removeProduct(ctx: HttpContext) {
    const payload = ctx.request.only(['product_id'])
    try {
      await this.cartsService.removeProductFromCart(ctx.params.deviceId, payload['product_id'])

      ctx.response.status(204)
    } catch (error) {
      if (error instanceof CartNotFound)
        return ctx.response.notFound({
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

  private async getUserIdFromContext(ctx: HttpContext): Promise<number | null> {
    try {
      const user = await ctx.auth.use('jwt').authenticate()
      return user.id
    } catch (error) {
      return null
    }
  }
}
