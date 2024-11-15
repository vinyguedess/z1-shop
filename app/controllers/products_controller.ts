import ProductsService from '#services/products_service'
import type { HttpContext } from '@adonisjs/core/http'
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

  /**
   * @create
   * @tag Product
   * @description Create new product into stock
   * @responseBody 201
   * @responseHeader 201 - ETag - ID of newly created product
   */
  async create(ctx: HttpContext) {
    const product = await this.productService.create(ctx.request.body())
    ctx.response.header('ETag', product.id)
    ctx.response.status(201)
  }
}
