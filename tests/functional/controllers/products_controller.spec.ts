import ProductsController from '#controllers/products_controller'
import Product from '#models/product'
import ProductsService from '#services/products_service'
import { AuthenticatorClient } from '@adonisjs/auth'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'
import { JwtGuard } from '../../../app/auth/guards/jwt_guard.js'
import User from '#models/user'

test('index', async ({ assert }) => {
  const stubGetList = sinon.stub(ProductsService.prototype, 'getList')
  stubGetList.resolves([[], 0])

  const productsController = await app.container.make(ProductsController)
  const response = await productsController.index(await testUtils.createHttpContext())

  assert.deepEqual(response, [])
  assert.isTrue(stubGetList.calledOnce)
  assert.isTrue(stubGetList.calledWith(10, 1))

  sinon.restore()
})

test.group('create', () => {
  test('ok', async ({ assert }) => {
    const product = new Product()
    product.id = 1

    const stubCreate = sinon.stub(ProductsService.prototype, 'create')
    stubCreate.resolves(product)

    const user = new User()
    user.isAdmin = true

    const stubJwtGuard = sinon.createStubInstance(JwtGuard)
    stubJwtGuard.getUserOrFail.returns(user)

    const authClient = new AuthenticatorClient({
      default: 'jwt',
      guards: {
        jwt: () => stubJwtGuard,
      },
    })

    const ctx = await testUtils.createHttpContext()
    ctx.auth = authClient

    const productsController = await app.container.make(ProductsController)
    await productsController.create(ctx)

    assert.strictEqual(ctx.response.getStatus(), 201)
    assert.strictEqual(ctx.response.getHeader('ETag'), '1')
    sinon.assert.calledWith(stubJwtGuard.getUserOrFail)

    sinon.restore()
  })

  test('if user is not admin', async ({ assert }) => {
    const product = new Product()
    product.id = 1

    const stubCreate = sinon.stub(ProductsService.prototype, 'create')
    stubCreate.resolves(product)

    const user = new User()
    user.isAdmin = false

    const stubJwtGuard = sinon.createStubInstance(JwtGuard)
    stubJwtGuard.getUserOrFail.returns(user)

    const authClient = new AuthenticatorClient({
      default: 'jwt',
      guards: {
        jwt: () => stubJwtGuard,
      },
    })

    const ctx = await testUtils.createHttpContext()
    ctx.auth = authClient

    const productsController = await app.container.make(ProductsController)
    await productsController.create(ctx)

    assert.strictEqual(ctx.response.getStatus(), 403)
    assert.deepEqual(ctx.response.getBody(), {
      code: 'YOU_DONT_HAVE_PERMISSION',
      message: "You don't have permission to create a product",
    })
    sinon.assert.calledWith(stubJwtGuard.getUserOrFail)
    sinon.assert.notCalled(stubCreate)

    sinon.restore()
  })
})
