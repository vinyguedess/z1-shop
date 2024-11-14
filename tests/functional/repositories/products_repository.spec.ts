import Product from '#models/product'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { test } from '@japa/runner'
import sinon, { SinonStubbedInstance } from 'sinon'
import ProductsRepository from '#repositories/products_repository'
import app from '@adonisjs/core/services/app'

test('create', async ({ assert }) => {
  const stubCreate = sinon.stub(Product, 'create')
  stubCreate.resolves(new Product())

  const productRepository = await app.container.make(ProductsRepository)
  const response = await productRepository.create({
    name: 'product-name',
  })

  assert.instanceOf(response, Product)
  assert.isTrue(stubCreate.calledOnce)
  assert.isTrue(
    stubCreate.calledWith({
      name: 'product-name',
    })
  )

  sinon.restore()
})

test('getList', async ({ assert }) => {
  const stubQueryBuilder = sinon.createStubInstance(ModelQueryBuilder)
  stubQueryBuilder.limit.returnsThis()
  stubQueryBuilder.offset.resolves([])
  stubQueryBuilder.count.resolves([{ $extras: { total_results: 0 } }])

  const stubModel = sinon.stub(Product) as SinonStubbedInstance<typeof Product>
  stubModel.query.returns(stubQueryBuilder)

  const productsRepository = new ProductsRepository()
  const response = await productsRepository.getList(10, 0)

  assert.deepEqual(response, [[], 0])
  assert.isTrue(stubModel.query.calledOnce)
  assert.isTrue(stubQueryBuilder.limit.calledWith(10))
  assert.isTrue(stubQueryBuilder.offset.calledWith(0))
  assert.isTrue(stubQueryBuilder.count.calledWith('id', 'total_results'))

  sinon.restore()
})
