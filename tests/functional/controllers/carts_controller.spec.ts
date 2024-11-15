import { AuthenticatorClient, errors } from '@adonisjs/auth'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'
import { JwtGuard } from '../../../app/auth/guards/jwt_guard.js'
import User from '#models/user'
import Cart from '#models/cart'
import CartsService from '#services/carts_service'
import CartsController from '#controllers/carts_controller'
import { CartNotFound } from '#exceptions/carts_exceptions'

test.group('create', () => {
  test('ok with user', async ({ assert }) => {
    const cart = new Cart()
    cart.id = 1
    cart.deviceId = 'device-id-123'

    const stubCreate = sinon.stub(CartsService.prototype, 'create')
    stubCreate.resolves(cart)

    const user = new User()
    user.id = 1000

    const stubJwtGuard = sinon.createStubInstance(JwtGuard)
    stubJwtGuard.authenticate.resolves(user)

    const authClient = new AuthenticatorClient({
      default: 'jwt',
      guards: {
        jwt: () => stubJwtGuard,
      },
    })

    const ctx = await testUtils.createHttpContext()
    ctx.request.updateBody({ device_id: 'device-id-123' })
    ctx.auth = authClient

    const cartsController = await app.container.make(CartsController)
    await cartsController.create(ctx)

    assert.strictEqual(ctx.response.getStatus(), 201)
    assert.strictEqual(ctx.response.getHeader('ETag'), '1')
    assert.strictEqual(ctx.response.getHeader('Location'), '/carts/device-id-123')
    sinon.assert.calledWith(stubJwtGuard.authenticate)
    sinon.assert.calledWith(stubCreate, 'device-id-123', 1000)

    sinon.restore()
  })

  test('ok without user', async ({ assert }) => {
    const cart = new Cart()
    cart.id = 1
    cart.deviceId = 'device-id-123'

    const stubCreate = sinon.stub(CartsService.prototype, 'create')
    stubCreate.resolves(cart)

    const user = new User()
    user.id = 1000

    const stubJwtGuard = sinon.createStubInstance(JwtGuard)
    stubJwtGuard.authenticate.rejects(new Error('Something happened'))

    const authClient = new AuthenticatorClient({
      default: 'jwt',
      guards: {
        jwt: () => stubJwtGuard,
      },
    })

    const ctx = await testUtils.createHttpContext()
    ctx.request.updateBody({ device_id: 'device-id-123' })
    ctx.auth = authClient

    const cartsController = await app.container.make(CartsController)
    await cartsController.create(ctx)

    assert.strictEqual(ctx.response.getStatus(), 201)
    assert.strictEqual(ctx.response.getHeader('ETag'), '1')
    assert.strictEqual(ctx.response.getHeader('Location'), '/carts/device-id-123')
    sinon.assert.calledWith(stubJwtGuard.authenticate)
    sinon.assert.calledWith(stubCreate, 'device-id-123', null)

    sinon.restore()
  })
})

test.group('getCart', () => {
  test('ok', async ({ assert }) => {
    const stubCreate = sinon.stub(CartsService.prototype, 'getByDeviceId')
    stubCreate.resolves(new Cart())

    const ctx = await testUtils.createHttpContext()
    ctx.params.deviceId = 'device-id-123'

    const cartsController = await app.container.make(CartsController)
    const response = await cartsController.getCart(ctx)

    assert.instanceOf(response, Cart)
    sinon.assert.calledWith(stubCreate, 'device-id-123')

    sinon.restore()
  })

  test('not found', async ({ assert }) => {
    const stubCreate = sinon.stub(CartsService.prototype, 'getByDeviceId')
    stubCreate.rejects(new CartNotFound('device-id-123'))

    const ctx = await testUtils.createHttpContext()
    ctx.params.deviceId = 'device-id-123'

    const cartsController = await app.container.make(CartsController)
    await cartsController.getCart(ctx)

    assert.strictEqual(ctx.response.getStatus(), 404)
    assert.deepEqual(ctx.response.getBody(), { code: 'CART_NOT_FOUND', message: 'device-id-123' })
    sinon.assert.calledWith(stubCreate, 'device-id-123')

    sinon.restore()
  })
})

test.group('addProduct', () => {
  test('ok', async ({ assert }) => {
    const stubAddProductToCart = sinon.stub(CartsService.prototype, 'addProductToCart')
    stubAddProductToCart.resolves()

    const ctx = await testUtils.createHttpContext()
    ctx.params.deviceId = 'device-id-123'
    ctx.request.updateBody({ product_id: 321 })

    const cartsController = await app.container.make(CartsController)
    await cartsController.addProduct(ctx)

    assert.strictEqual(ctx.response.getStatus(), 204)
    sinon.assert.calledWith(stubAddProductToCart, 'device-id-123', 321)

    sinon.restore()
  })

  test('not found', async ({ assert }) => {
    const stubAddProductToCart = sinon.stub(CartsService.prototype, 'addProductToCart')
    stubAddProductToCart.rejects(new CartNotFound('device-id-123'))

    const ctx = await testUtils.createHttpContext()
    ctx.params.deviceId = 'device-id-123'
    ctx.request.updateBody({ product_id: 321 })

    const cartsController = await app.container.make(CartsController)
    await cartsController.addProduct(ctx)

    assert.strictEqual(ctx.response.getStatus(), 404)
    assert.deepEqual(ctx.response.getBody(), { code: 'CART_NOT_FOUND', message: 'device-id-123' })
    sinon.assert.calledWith(stubAddProductToCart, 'device-id-123', 321)

    sinon.restore()
  })
})

test.group('removeProduct', () => {
  test('ok', async ({ assert }) => {
    const stubRemoveProductToCart = sinon.stub(CartsService.prototype, 'removeProductFromCart')
    stubRemoveProductToCart.resolves()

    const ctx = await testUtils.createHttpContext()
    ctx.params.deviceId = 'device-id-123'
    ctx.request.updateBody({ product_id: 321 })

    const cartsController = await app.container.make(CartsController)
    await cartsController.removeProduct(ctx)

    assert.strictEqual(ctx.response.getStatus(), 204)
    sinon.assert.calledWith(stubRemoveProductToCart, 'device-id-123', 321)

    sinon.restore()
  })

  test('not found', async ({ assert }) => {
    const stubRemoveProductToCart = sinon.stub(CartsService.prototype, 'removeProductFromCart')
    stubRemoveProductToCart.rejects(new CartNotFound('device-id-123'))

    const ctx = await testUtils.createHttpContext()
    ctx.params.deviceId = 'device-id-123'
    ctx.request.updateBody({ product_id: 321 })

    const cartsController = await app.container.make(CartsController)
    await cartsController.removeProduct(ctx)

    assert.strictEqual(ctx.response.getStatus(), 404)
    assert.deepEqual(ctx.response.getBody(), { code: 'CART_NOT_FOUND', message: 'device-id-123' })
    sinon.assert.calledWith(stubRemoveProductToCart, 'device-id-123', 321)

    sinon.restore()
  })
})
