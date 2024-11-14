import type { HttpContext } from '@adonisjs/core/http'

import ProductsService from '#services/products_service'
import { inject } from '@adonisjs/core'

@inject()
export default class ProductsController {
  constructor(protected productService: ProductsService) {}

  async index(ctx: HttpContext) {
    const [results, totalResults] = await this.productService.getList(
      ctx.request.qs().limit || 10,
      ctx.request.qs().page || 1
    )

    ctx.response.header('X-Total-Count', totalResults)
    return results
  }
}
