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
    const relatedProducts = cart.related('products')

    const cartProduct = await relatedProducts.query().where('product_id', productId).first()
    if (cartProduct instanceof CartProduct) {
      cartProduct.amount += 1
      await cartProduct.save()
      return cartProduct as CartProduct
    }

    return relatedProducts.create({ productId: productId, amount: 1 })
  }

  async removeProductFromCart(cartId: number, productId: number): Promise<void> {
    const cartProduct = await CartProduct.query()
      .where('cart_id', cartId)
      .where('product_id', productId)
      .first()
    if (!(cartProduct instanceof CartProduct)) return

    if (cartProduct.amount <= 1) return cartProduct.delete()

    cartProduct.amount -= 1
    await cartProduct.save()
    return
  }
}
