import Product from '#models/product'
import ProductsRepository from '#repositories/products_repository'
import { inject } from '@adonisjs/core'

@inject()
export default class ProductsService {
  constructor(protected productsRepository: ProductsRepository) {}

  async getList(limit: number, page: number): Promise<[Product[], number]> {
    const offset = (page - 1) * limit
    return this.productsRepository.getList(limit, offset)
  }
}
