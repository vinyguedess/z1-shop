import Cart from '#models/cart'
import CartProduct from '#models/cart_product'

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

  async addProductToCart(cart: Cart, productId: number): Promise<CartProduct> {
    return cart.related('products').create({ productId })
  }

  async removeProductFromCart(cartId: number, productId: number): Promise<void> {
    await CartProduct.query().where('cart_id', cartId).where('product_id', productId).delete()
  }
}
