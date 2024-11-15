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
