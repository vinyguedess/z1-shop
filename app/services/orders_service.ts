import { CartNotFound } from '#exceptions/carts_exceptions'
import { NotEnoughItemsInStock } from '#exceptions/orders_exceptions'
import Order from '#models/order'
import User from '#models/user'
import CartsRepository from '#repositories/carts_repository'
import OrdersRepository from '#repositories/orders_repository'
import ProductsRepository from '#repositories/products_repository'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class OrdersService {
  constructor(
    protected cartsRepository: CartsRepository,
    protected ordersRepository: OrdersRepository,
    protected productsRepository: ProductsRepository
  ) {}

  async create(userId: number, cartDeviceId: string): Promise<Order> {
    const trx = await db.transaction()
    try {
      // 1. Get cart by device id
      const cart = await this.cartsRepository.getByDeviceId(cartDeviceId)
      if (!cart) throw new CartNotFound(cartDeviceId)
      // 2. Create order associating user
      const order = await this.ordersRepository.create(trx, { userId: userId })

      // 3. For each cart product
      // 3.1. Create an order item
      for (const cartProduct of cart.products) {
        if (cartProduct.amount > cartProduct.product.amount)
          throw new NotEnoughItemsInStock('Not enough items in stock', {
            cause: {
              productId: cartProduct.productId,
              selected_amount: cartProduct.amount,
              in_stock_amount: cartProduct.product.amount,
            },
          })

        await this.ordersRepository.createOrderItem(trx, {
          orderId: order.id,
          productId: cartProduct.productId,
          price: cartProduct.product.price,
          amount: cartProduct.amount,
        })

        // 3.2. Decrease amount of products from stock
        this.productsRepository.update(trx, cartProduct.productId, {
          amount: cartProduct.product.amount - cartProduct.amount,
        })

        // 3.3 Delete cart product
        cartProduct.delete()
      }

      // 4. Delete cart
      cart.delete()

      await trx.commit()
      return order
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async getListByUser(user: User, limit: number, page: number): Promise<[Order[], number]> {
    const offset = (page - 1) * limit
    return this.ordersRepository.getListByUserId(user.id, limit, offset)
  }
}
