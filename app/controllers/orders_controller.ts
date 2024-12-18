import { CartNotFound } from '#exceptions/carts_exceptions'
import { NotEnoughItemsInStock } from '#exceptions/orders_exceptions'
import OrdersService from '#services/orders_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class OrdersController {
  constructor(protected ordersService: OrdersService) {}

  /**
   * @create
   * @tag Orders
   * @summary Create an order from a given cart
   * @description If validation is fine then an order is created and cart deleted
   * @responseBody 201 - -
   * @responseHeader 201 - ETag - ID of newly created cart
   * @responseHeader 201 - Location - URL of newly created cart
   * @responseBody 400 - {"code": "CART_NOT_FOUND/NOT_ENOUGH_ITEMS_IN_STOCK"}
   */
  async create(ctx: HttpContext) {
    try {
      const user = ctx.auth.use('jwt').getUserOrFail()
      const payload = ctx.request.only(['device_id'])

      const order = await this.ordersService.create(user.id, payload.device_id)

      ctx.response.created(null)
      ctx.response.header('ETag', order.id)
      ctx.response.header('Location', `/orders/${order.id}`)
    } catch (error) {
      if (error instanceof CartNotFound)
        return ctx.response.badRequest({
          code: error.name,
          message: error.message,
        })

      if (error instanceof NotEnoughItemsInStock)
        return ctx.response.badRequest({
          code: error.name,
          message: error.message,
          details: [error.cause],
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
   * @getList
   * @tag Orders
   * @description Get list of orders from authenticated user
   * @paramQuery limit - Limit number of orders to be returned - @type(number)
   * @paramQuery page - Page number of orders to be returned - @type(number)
   * @responseBody 200 - <Product[]>
   * @responseHeader 200 - X-Total-Count - Total number of orders
   */
  async getList(ctx: HttpContext) {
    const user = ctx.auth.use('jwt').getUserOrFail()

    const [results, totalResults] = await this.ordersService.getListByUser(
      user,
      ctx.request.qs().limit || 10,
      ctx.request.qs().page || 1
    )

    ctx.response.header('X-Total-Count', totalResults)
    return results
  }
}
