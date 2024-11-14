import Product from '#models/product'

export default class ProductsRepository {
  async create(data: Record<string, any>): Promise<Product> {
    return Product.create(data)
  }

  async getList(limit: number, offset: number): Promise<[Product[], number]> {
    const query = Product.query()

    const countResults = await query.count('id', 'total_results')
    return [await query.limit(limit).offset(offset), countResults[0].$extras.total_results]
  }
}
