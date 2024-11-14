import Cart from '#models/cart'

export default class CartsRepository {
  async create(data: Record<string, any>): Promise<Cart> {
    return Cart.create(data)
  }

  async update(cart: Cart, data: Record<string, any>): Promise<Cart> {
    cart.merge(data)
    return cart.save()
  }

  async getByDeviceId(deviceId: string): Promise<Cart | null> {
    return Cart.findBy('device_id', deviceId)
  }
}
