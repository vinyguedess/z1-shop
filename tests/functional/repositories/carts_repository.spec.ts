import Cart from '#models/cart'
import CartsRepository from '#repositories/carts_repository'
import app from '@adonisjs/core/services/app'
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
})
