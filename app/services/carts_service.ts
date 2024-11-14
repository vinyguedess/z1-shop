import Cart from '#models/cart'
import CartsRepository from '#repositories/carts_repository'
import { inject } from '@adonisjs/core'

@inject()
export default class CartsService {
  constructor(protected cartsRepository: CartsRepository) {}

  create(deviceId: string, userId: number | null): Promise<Cart> {
    return this.cartsRepository.create({ deviceId, userId })
  }
}
