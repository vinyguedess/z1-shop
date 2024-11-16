import Product from '#models/product'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { test } from '@japa/runner'
import sinon, { SinonStubbedInstance } from 'sinon'
import ProductsRepository from '#repositories/products_repository'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

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

test('update', async ({ assert }) => {
  const trx = await db.transaction()
  await trx.rollback()

  const stubTrx = sinon.stub(trx)

  const stubQueryBuilder = sinon.createStubInstance(ModelQueryBuilder)
  stubQueryBuilder.where.returnsThis()
  stubQueryBuilder.update.resolves()

  const stubQuery = sinon.stub(Product, 'query')
  stubQuery.returns(stubQueryBuilder)

  const productsRepository = await app.container.make(ProductsRepository)
  await productsRepository.update(stubTrx, 1, { amount: 2 })

  sinon.assert.calledWith(stubQuery, { client: stubTrx })
  sinon.assert.calledWith(stubQueryBuilder.where, 'id', 1)
  sinon.assert.calledWith(stubQueryBuilder.update, { amount: 2 })

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
