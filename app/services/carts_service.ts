import { CartNotFound } from '#exceptions/carts_exceptions'
import Cart from '#models/cart'
import CartsRepository from '#repositories/carts_repository'
import { inject } from '@adonisjs/core'

@inject()
export default class CartsService {
  constructor(protected cartsRepository: CartsRepository) {}

  create(deviceId: string, userId: number | null): Promise<Cart> {
    return this.cartsRepository.create({ deviceId, userId })
  }

  async getByDeviceId(deviceId: string): Promise<Cart | null> {
    const cart = await this.cartsRepository.getByDeviceId(deviceId)
    if (!(cart instanceof Cart)) throw new CartNotFound(deviceId)

    return cart
  }

  async addProductToCart(cartDeviceId: string, productId: number): Promise<void> {
    const cart = await this.cartsRepository.getByDeviceId(cartDeviceId)
    if (!(cart instanceof Cart)) throw new CartNotFound(cartDeviceId)

    this.cartsRepository.addProductToCart(cart, productId)
  }

  async removeProductFromCart(cartDeviceId: string, productId: number): Promise<void> {
    const cart = await this.cartsRepository.getByDeviceId(cartDeviceId)
    if (!(cart instanceof Cart)) throw new CartNotFound(cartDeviceId)

    this.cartsRepository.removeProductFromCart(cart.id, productId)
  }
}
