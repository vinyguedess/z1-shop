import ProductsService from '#services/products_service'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Product from '#models/product'

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
  async index(ctx: HttpContext): Promise<Array<Product>> {
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
   * @summary Create new product into stock
   * @description Create new product in case user signed in has permission to do so.
   * @responseHeader 201 - ETag - ID of newly created
   * @responseBody 403 - {"code": "YOU_DONT_HAVE_PERMISSION"} - You don't have permission to create a product
   * @responseHeader 403 - Content
   */
  async create(ctx: HttpContext): Promise<void> {
    const user = ctx.auth.use('jwt').getUserOrFail()
    if (!user.isAdmin)
      return ctx.response.forbidden({
        code: 'YOU_DONT_HAVE_PERMISSION',
        message: "You don't have permission to create a product",
      })

    const product = await this.productService.create(ctx.request.body())
    ctx.response.header('ETag', product.id)
    ctx.response.status(201)
  }
}
