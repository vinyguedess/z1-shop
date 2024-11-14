import type { HttpContext } from '@adonisjs/core/http'

import ProductsService from '#services/products_service'
import { inject } from '@adonisjs/core'

@inject()
export default class ProductsController {
  constructor(protected productService: ProductsService) {}

  /**
   * @index
   * @tag Product
   * @description Fetch a list of products paginated
   * @responseBody 200 - <Product[]>
   * @responseHeader 200 - X-Total-Count - Total of items registered - @example(10)
   */
  async index(ctx: HttpContext) {
    const [results, totalResults] = await this.productService.getList(
      ctx.request.qs().limit || 10,
      ctx.request.qs().page || 1
    )

    ctx.response.header('X-Total-Count', totalResults)
    return results
  }
}
