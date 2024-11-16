import Order from '#models/order'
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
