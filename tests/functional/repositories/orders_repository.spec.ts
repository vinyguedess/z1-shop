import Order from '#models/order'
import OrderItem from '#models/order_item'
import OrdersRepository from '#repositories/orders_repository'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import sinon from 'sinon'

test('create', async ({ assert }) => {
  const txn = await db.transaction()
  await txn.rollback()

  const stubTrx = sinon.stub(txn)

  const stubOrder = sinon.stub(Order.prototype)
  stubOrder.fill.returnsThis()
  stubOrder.useTransaction.returnsThis()
  stubOrder.save.returnsThis()

  const ordersRepository = await app.container.make(OrdersRepository)
  const response = await ordersRepository.create(stubTrx, {})

  assert.instanceOf(response, Order)
  sinon.assert.calledWith(stubOrder.fill, {})
  sinon.assert.calledWith(stubOrder.useTransaction, stubTrx)
  sinon.assert.calledWith(stubOrder.save)

  sinon.restore()
})

test('createOrderItem', async ({ assert }) => {
  const txn = await db.transaction()
  await txn.rollback()

  const stubTrx = sinon.stub(txn)

  const stubOrderItem = sinon.stub(OrderItem.prototype)
  stubOrderItem.fill.returnsThis()
  stubOrderItem.useTransaction.returnsThis()
  stubOrderItem.save.returnsThis()

  const ordersRepository = await app.container.make(OrdersRepository)
  const response = await ordersRepository.createOrderItem(stubTrx, {})

  assert.instanceOf(response, OrderItem)
  sinon.assert.calledWith(stubOrderItem.fill, {})
  sinon.assert.calledWith(stubOrderItem.useTransaction, stubTrx)
  sinon.assert.calledWith(stubOrderItem.save)

  sinon.restore()
})
