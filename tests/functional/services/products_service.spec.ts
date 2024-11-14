import ProductsRepository from '#repositories/products_repository'
import ProductsService from '#services/products_service'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import sinon from "sinon";

test('get list', async ({ assert }) => {
  const stubGetList = sinon.stub(ProductsRepository.prototype, "getList")
  stubGetList.resolves([[], 0])

  const productsService = await app.container.make(ProductsService)
  const response = await productsService.getList(10, 1)

  assert.deepEqual(response, [[], 0])
  assert.isTrue(stubGetList.calledWith(10, 0))

  sinon.restore();
})
