import { AuthenticatorClient } from '@adonisjs/auth'
import { test } from '@japa/runner'
import sinon from 'sinon'
import { JwtGuard } from '../../../app/auth/guards/jwt_guard.js'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import OrdersService from '#services/orders_service'
import Order from '#models/order'
import app from '@adonisjs/core/services/app'
import OrdersController from '#controllers/orders_controller'
import { CartNotFound } from '#exceptions/carts_exceptions'

test.group('create', () => {
  test('ok', async ({ assert }) => {
    const stubCreate = sinon.stub(OrdersService.prototype, 'create')
    stubCreate.resolves(new Order().fill({ id: 1 }))

    const stubJwtGuard = sinon.createStubInstance(JwtGuard)
    stubJwtGuard.getUserOrFail.returns(new User().fill({ id: 1000 }))

    const authClient = new AuthenticatorClient({
      default: 'jwt',
      guards: {
        jwt: () => stubJwtGuard,
      },
    })

    const ctx = await testUtils.createHttpContext()
    ctx.request.updateBody({ device_id: 'device-id-123' })
    ctx.auth = authClient

    const ordersController = await app.container.make(OrdersController)
    await ordersController.create(ctx)

    assert.strictEqual(ctx.response.getStatus(), 201)
    assert.strictEqual(ctx.response.getHeader('ETag'), '1')
    sinon.assert.calledWith(stubJwtGuard.getUserOrFail)
    sinon.assert.calledWith(stubCreate, 1000, 'device-id-123')

    sinon.restore()
  })

  test('cart not found', async ({ assert }) => {
    const stubCreate = sinon.stub(OrdersService.prototype, 'create')
    stubCreate.rejects(new CartNotFound('Cart not found'))

    const stubJwtGuard = sinon.createStubInstance(JwtGuard)
    stubJwtGuard.getUserOrFail.returns(new User().fill({ id: 1000 }))

    const authClient = new AuthenticatorClient({
      default: 'jwt',
      guards: {
        jwt: () => stubJwtGuard,
      },
    })

    const ctx = await testUtils.createHttpContext()
    ctx.request.updateBody({ device_id: 'device-id-123' })
    ctx.auth = authClient

    const ordersController = await app.container.make(OrdersController)
    await ordersController.create(ctx)

    assert.strictEqual(ctx.response.getStatus(), 400)
    assert.deepEqual(ctx.response.getBody(), { code: 'CART_NOT_FOUND', message: 'Cart not found' })
    sinon.assert.calledWith(stubJwtGuard.getUserOrFail)
    sinon.assert.calledWith(stubCreate, 1000, 'device-id-123')

    sinon.restore()
  })
})
