import Cart from '#models/cart'
import CartsRepository from '#repositories/carts_repository'
import CartsService from '#services/carts_service'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'
import sinon from 'sinon'

test('create', async ({ assert }) => {
  const stubCreate = sinon.stub(CartsRepository.prototype, 'create')
  stubCreate.resolves(new Cart())

  const cartsService = await app.container.make(CartsService)
  const response = await cartsService.create('device-id-123', null)

  assert.instanceOf(response, Cart)
  sinon.assert.calledWith(stubCreate, { deviceId: 'device-id-123', userId: null })

  sinon.restore()
})

test.group('getByDeviceId', () => {
  test('ok', async ({ assert }) => {
    const stubGetByDeviceId = sinon.stub(CartsRepository.prototype, 'getByDeviceId')
    stubGetByDeviceId.resolves(new Cart())

    const cartsService = await app.container.make(CartsService)
    const response = await cartsService.getByDeviceId('device-id-123')

    assert.instanceOf(response, Cart)
    sinon.assert.calledWith(stubGetByDeviceId, 'device-id-123')

    sinon.restore()
  })

  test('cart not found', async ({ assert }) => {
    const stubGetByDeviceId = sinon.stub(CartsRepository.prototype, 'getByDeviceId')
    stubGetByDeviceId.resolves(null)

    const cartsService = await app.container.make(CartsService)

    assert.rejects(() => cartsService.getByDeviceId('device-id-123'))
    sinon.assert.calledWith(stubGetByDeviceId, 'device-id-123')

    sinon.restore()
  })
})

test.group('addProductToCart', () => {
  test('ok', async () => {
    const cart = new Cart()

    const stubGetByDeviceId = sinon.stub(CartsRepository.prototype, 'getByDeviceId')
    stubGetByDeviceId.resolves(cart)

    const stubAddProductToCart = sinon.stub(CartsRepository.prototype, 'addProductToCart')

    const cartsService = await app.container.make(CartsService)
    await cartsService.addProductToCart('device-id-123', 1)

    sinon.assert.calledWith(stubGetByDeviceId, 'device-id-123')
    sinon.assert.calledWith(stubAddProductToCart, cart, 1)

    sinon.restore()
  })

  test('error if cart not found', async ({ assert }) => {
    const stubGetByDeviceId = sinon.stub(CartsRepository.prototype, 'getByDeviceId')
    stubGetByDeviceId.resolves(null)

    const stubAddProductToCart = sinon.stub(CartsRepository.prototype, 'addProductToCart')

    const cartsService = await app.container.make(CartsService)

    assert.rejects(() => cartsService.addProductToCart('device-id-123', 1))
    sinon.assert.calledWith(stubGetByDeviceId, 'device-id-123')
    sinon.assert.notCalled(stubAddProductToCart)

    sinon.restore()
  })
})
