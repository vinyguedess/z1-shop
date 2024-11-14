import User from '#models/user'
import UsersService from '#services/users_service'
import { test } from '@japa/runner'
import sinon from 'sinon'
import { JwtGuard } from '../../../app/auth/guards/jwt_guard.js'
import app from '@adonisjs/core/services/app'
import AuthController from '#controllers/auth_controller'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserAlreadyExists } from '#exceptions/users_exceptions'
import { AuthenticatorClient } from '@adonisjs/auth'

test('signUp', async ({ assert }) => {
  const stubSignUp = sinon.stub(UsersService.prototype, 'signUp')
  stubSignUp.resolves(new User())

  const stubJwtGuard = sinon.createStubInstance(JwtGuard)
  stubJwtGuard.generate.resolves({
    type: 'Bearer',
    access_token: 'ACCESS_TOKEN',
    expires_in: 3600,
  })

  const authClient = new AuthenticatorClient({
    default: 'jwt',
    guards: {
      jwt: () => stubJwtGuard,
    },
  })

  const ctx = await testUtils.createHttpContext()
  ctx.auth = authClient

  const authController = await app.container.make(AuthController)
  const response = await authController.signUp(ctx)

  assert.deepEqual(response, { access_token: 'ACCESS_TOKEN', type: 'Bearer', expires_in: 3600 })

  sinon.restore()
})

test('signUp user already exists', async ({ assert }) => {
  const stubSignUp = sinon.stub(UsersService.prototype, 'signUp')
  stubSignUp.rejects(new UserAlreadyExists('E-mail already registered'))

  const stubJwtGuard = sinon.createStubInstance(JwtGuard)

  const authClient = new AuthenticatorClient({
    default: 'jwt',
    guards: {
      jwt: () => stubJwtGuard,
    },
  })

  const ctx = await testUtils.createHttpContext()
  ctx.auth = authClient

  const authController = await app.container.make(AuthController)
  const response = await authController.signUp(ctx)

  assert.deepEqual(ctx.response.getBody(), {
    code: 'USER_ALREADY_EXISTS',
    message: 'E-mail already registered',
  })
  assert.equal(ctx.response.getStatus(), 409)

  sinon.restore()
})

test('signUp unexpected error', async ({ assert }) => {
  const stubSignUp = sinon.stub(UsersService.prototype, 'signUp')
  stubSignUp.rejects(new Error('Something happened'))

  const stubJwtGuard = sinon.createStubInstance(JwtGuard)

  const authClient = new AuthenticatorClient({
    default: 'jwt',
    guards: {
      jwt: () => stubJwtGuard,
    },
  })

  const ctx = await testUtils.createHttpContext()
  ctx.auth = authClient

  const authController = await app.container.make(AuthController)
  const response = await authController.signUp(ctx)

  assert.deepEqual(ctx.response.getBody(), { code: 'Error', message: 'Something happened' })
  assert.equal(ctx.response.getStatus(), 500)

  sinon.restore()
})
