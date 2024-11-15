import ProductsController from '#controllers/products_controller'
import Product from '#models/product'
import ProductsService from '#services/products_service'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

test('index', async ({ assert }) => {
  const stubGetList = sinon.stub(ProductsService.prototype, 'getList')
  stubGetList.resolves([[], 0])

  const productsController = await app.container.make(ProductsController)
  const response = await productsController.index(await testUtils.createHttpContext())

  assert.deepEqual(response, [])
  assert.isTrue(stubGetList.calledOnce)
  assert.isTrue(stubGetList.calledWith(10, 1))

  sinon.restore()
})

test('create', async ({ assert }) => {
  const product = new Product()
  product.id = 1

  const stubCreate = sinon.stub(ProductsService.prototype, 'create')
  stubCreate.resolves(product)

  const ctx = await testUtils.createHttpContext()

  const productsController = await app.container.make(ProductsController)
  await productsController.create(ctx)

  assert.strictEqual(ctx.response.getStatus(), 201)
  assert.strictEqual(ctx.response.getHeader('ETag'), '1')
  sinon.assert
})
