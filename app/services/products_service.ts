import Product from '#models/product'

export default class ProductsService {
  async getList(limit: number, page: number): Promise<[Product[], number]> {
    const query = Product.query()

    const offset = (page - 1) * limit

    const countResults = await query.count('id', 'total_results')
    return [await query.limit(limit).offset(offset), countResults[0].$extras.total_results]
  }
}
