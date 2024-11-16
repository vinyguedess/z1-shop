import Product from '#models/product'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class ProductsRepository {
  async create(data: Record<string, any>): Promise<Product> {
    return Product.create(data)
  }

  async update(
    trx: TransactionClientContract,
    productId: number,
    data: Record<string, any>
  ): Promise<void> {
    await Product.query({ client: trx }).where('id', productId).update(data)
  }

  async getList(limit: number, offset: number): Promise<[Product[], number]> {
    const query = Product.query()

    const results = await query.limit(limit).offset(offset)

    const countResults = await query.count('id', 'total_results')
    return [results, countResults[0].$extras.total_results]
  }
}
