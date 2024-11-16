import Cart from '#models/cart'
import CartProduct from '#models/cart_product'
import Order from '#models/order'
import Product from '#models/product'
import CartsRepository from '#repositories/carts_repository'
import OrdersRepository from '#repositories/orders_repository'
import ProductsRepository from '#repositories/products_repository'
import OrdersService from '#services/orders_service'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import sinon from 'sinon'

test.group('create', () => {
  test('ok', async ({ assert }) => {
    const txn = await db.transaction()
    await txn.rollback()
    const stubTrx = sinon.stub(txn)

    const stubDBTrx = sinon.stub(db, 'transaction')
    stubDBTrx.resolves(stubTrx)

    const product = new Product()
    product.id = 321
    product.amount = 100
    product.price = 10.99

    const stubCartProduct = sinon.createStubInstance(CartProduct)
    stubCartProduct.productId = 321
    stubCartProduct.amount = 1
    stubCartProduct.product = product

    const stubCart = sinon.createStubInstance(Cart)
    stubCart.products = [stubCartProduct]

    const stubCartGetByDeviceId = sinon.stub(CartsRepository.prototype, 'getByDeviceId')
    stubCartGetByDeviceId.resolves(stubCart)

    const order = new Order()
    order.id = 99

    const stubOrderCreate = sinon.stub(OrdersRepository.prototype, 'create')
    stubOrderCreate.resolves(order)

    const stubOrderCreateOrderItem = sinon.stub(OrdersRepository.prototype, 'createOrderItem')
    stubOrderCreateOrderItem.resolves()

    const stubProductUpdate = sinon.stub(ProductsRepository.prototype, 'update')
    stubProductUpdate.resolves()

    const ordersService = await app.container.make(OrdersService)
    const response = await ordersService.create(1, 'device-id-123')

    assert.instanceOf(response, Order)
    sinon.assert.calledWith(stubDBTrx)
    sinon.assert.calledWith(stubCartGetByDeviceId, 'device-id-123')
    sinon.assert.calledWith(stubOrderCreate, stubTrx, { userId: 1 })
    sinon.assert.calledWith(stubOrderCreateOrderItem, stubTrx, {
      orderId: 99,
      productId: 321,
      price: 10.99,
      amount: 1,
    })
    sinon.assert.calledWith(stubProductUpdate, stubTrx, 321, { amount: 99 })
    sinon.assert.calledWith(stubCartProduct.delete)
    sinon.assert.calledWith(stubCart.delete)
    sinon.assert.calledWith(stubTrx.commit)

    sinon.restore()
  })
})
