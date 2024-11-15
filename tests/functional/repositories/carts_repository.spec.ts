import Cart from '#models/cart'
import CartProduct from '#models/cart_product'
import CartsRepository from '#repositories/carts_repository'
import app from '@adonisjs/core/services/app'
import { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { HasManyQueryClient } from '@adonisjs/lucid/orm/relations'
import { test } from '@japa/runner'
import sinon from 'sinon'

test('create', async ({ assert }) => {
  const stubCreate = sinon.stub(Cart, 'create')
  stubCreate.resolves(new Cart())

  const cartsRepository = await app.container.make(CartsRepository)
  const response = await cartsRepository.create({ deviceId: 'device-id-123' })

  assert.instanceOf(response, Cart)
  sinon.assert.calledWith(stubCreate, { deviceId: 'device-id-123' })

  sinon.restore()
})

test('update', async ({ assert }) => {
  const stubSave = sinon.stub(Cart.prototype, 'save')
  stubSave.resolves(new Cart())

  const cartsRepository = await app.container.make(CartsRepository)
  const response = await cartsRepository.update(new Cart(), { deviceId: 'new-device-id' })

  assert.instanceOf(response, Cart)
  sinon.assert.calledOnce(stubSave)

  sinon.restore()
})

test('getByDeviceId', async ({ assert }) => {
  const stubFindBy = sinon.stub(Cart, 'findBy')
  stubFindBy.resolves(new Cart())

  const cartsRepository = await app.container.make(CartsRepository)
  const response = await cartsRepository.getByDeviceId('device-id-123')

  assert.instanceOf(response, Cart)
  sinon.assert.calledWith(stubFindBy, 'device_id', 'device-id-123')

  sinon.restore()
})

test.group('addProductToCart', () => {
  test('creating cart product', async ({ assert }) => {
    const stubQueryBuilder = sinon.createStubInstance(ModelQueryBuilder)
    stubQueryBuilder.where.returnsThis()
    stubQueryBuilder.first.resolves(null)

    const stubHasManyRelation = sinon.createStubInstance(HasManyQueryClient)
    stubHasManyRelation.query.returns(stubQueryBuilder)
    stubHasManyRelation.create.resolves(new CartProduct())

    const stubCart = sinon.createStubInstance(Cart)
    stubCart.related.returns(stubHasManyRelation as never)

    const cartsRepository = await app.container.make(CartsRepository)
    const response = await cartsRepository.addProductToCart(stubCart, 1)

    assert.instanceOf(response, CartProduct)
    sinon.assert.calledWith(stubCart.related, 'products')
    sinon.assert.calledWith(stubHasManyRelation.query)
    sinon.assert.calledWith(stubQueryBuilder.where, 'product_id', 1)
    sinon.assert.calledWith(stubQueryBuilder.first)
    sinon.assert.calledWith(stubHasManyRelation.create, { productId: 1, amount: 1 })

    sinon.restore()
  })

  test('adding more in the amount', async ({ assert }) => {
    const stubCartProduct = sinon.createStubInstance(CartProduct)
    stubCartProduct.amount = 1

    const stubQueryBuilder = sinon.createStubInstance(ModelQueryBuilder)
    stubQueryBuilder.where.returnsThis()
    stubQueryBuilder.first.resolves(stubCartProduct)

    const stubHasManyRelation = sinon.createStubInstance(HasManyQueryClient)
    stubHasManyRelation.query.returns(stubQueryBuilder)
    stubHasManyRelation.create.resolves(new CartProduct())

    const stubCart = sinon.createStubInstance(Cart)
    stubCart.related.returns(stubHasManyRelation as never)

    const cartsRepository = await app.container.make(CartsRepository)
    const response = await cartsRepository.addProductToCart(stubCart, 1)

    assert.instanceOf(response, CartProduct)
    assert.equal(stubCartProduct.amount, 2)
    sinon.assert.calledWith(stubCart.related, 'products')
    sinon.assert.calledWith(stubHasManyRelation.query)
    sinon.assert.calledWith(stubQueryBuilder.where, 'product_id', 1)
    sinon.assert.calledWith(stubQueryBuilder.first)
    sinon.assert.calledWith(stubCartProduct.save)
    sinon.assert.notCalled(stubHasManyRelation.create)

    sinon.restore()
  })
})

test.group('removeProductFromCart', () => {
  test('if cart product not found', async () => {
    const stubQueryBuilder = sinon.createStubInstance(ModelQueryBuilder)
    stubQueryBuilder.where.returnsThis()
    stubQueryBuilder.first.resolves(null)

    const stubQuery = sinon.stub(CartProduct, 'query')
    stubQuery.returns(stubQueryBuilder)

    const cartsRepository = await app.container.make(CartsRepository)
    await cartsRepository.removeProductFromCart(1, 2)

    sinon.assert.calledOnce(stubQuery)
    sinon.assert.calledWith(stubQueryBuilder.where.firstCall, 'cart_id', 1)
    sinon.assert.calledWith(stubQueryBuilder.where.secondCall, 'product_id', 2)

    sinon.restore()
    sinon.reset()
  })

  test('deleting cart product', async () => {
    const stubCartProduct = sinon.createStubInstance(CartProduct)
    stubCartProduct.amount = 1

    const stubQueryBuilder = sinon.createStubInstance(ModelQueryBuilder)
    stubQueryBuilder.where.returnsThis()
    stubQueryBuilder.first.resolves(stubCartProduct)

    const stubQuery = sinon.stub(CartProduct, 'query')
    stubQuery.returns(stubQueryBuilder)

    const cartsRepository = await app.container.make(CartsRepository)
    await cartsRepository.removeProductFromCart(1, 2)

    sinon.assert.calledOnce(stubQuery)
    sinon.assert.calledWith(stubQueryBuilder.where.firstCall, 'cart_id', 1)
    sinon.assert.calledWith(stubQueryBuilder.where.secondCall, 'product_id', 2)
    sinon.assert.calledWith(stubCartProduct.delete)

    sinon.restore()
    sinon.reset()
  })

  test('decreasing amount of cart product', async ({ assert }) => {
    const stubCartProduct = sinon.createStubInstance(CartProduct)
    stubCartProduct.amount = 2

    const stubQueryBuilder = sinon.createStubInstance(ModelQueryBuilder)
    stubQueryBuilder.where.returnsThis()
    stubQueryBuilder.first.resolves(stubCartProduct)

    const stubQuery = sinon.stub(CartProduct, 'query')
    stubQuery.returns(stubQueryBuilder)

    const cartsRepository = await app.container.make(CartsRepository)
    await cartsRepository.removeProductFromCart(1, 2)

    assert.equal(stubCartProduct.amount, 1)
    sinon.assert.calledOnce(stubQuery)
    sinon.assert.calledWith(stubQueryBuilder.where.firstCall, 'cart_id', 1)
    sinon.assert.calledWith(stubQueryBuilder.where.secondCall, 'product_id', 2)
    sinon.assert.calledWith(stubCartProduct.save)

    sinon.restore()
    sinon.reset()
  })
})
