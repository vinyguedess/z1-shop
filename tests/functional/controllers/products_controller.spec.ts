import ProductsController from '#controllers/products_controller'
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
