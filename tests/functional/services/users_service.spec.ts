import { UserAlreadyExists } from '#exceptions/users_exceptions'
import User from '#models/user'
import UsersRepository from '#repositories/users_repository'
import UsersService from '#services/users_service'
import app from '@adonisjs/core/services/app'
import hash from '@adonisjs/core/services/hash'
import { test } from '@japa/runner'
import sinon from 'sinon'

test('signUp', async ({ assert }) => {
  hash.fake()

  const stubGetByEmail = sinon.stub(UsersRepository.prototype, 'getByEmail')
  stubGetByEmail.resolves(null)

  const stubCreate = sinon.stub(UsersRepository.prototype, 'create')
  stubCreate.resolves(new User())

  const usersService = await app.container.make(UsersService)
  const response = await usersService.signUp({
    first_name: 'My First',
    last_name: 'My Last',
    email: 'hello@email.com',
    password: 'myz1p4ssw0rd',
  })

  assert.instanceOf(response, User)
  assert.isTrue(stubGetByEmail.calledOnce)
  sinon.assert.calledWith(stubGetByEmail, 'hello@email.com')
  assert.isTrue(stubCreate.calledOnce)
  sinon.assert.calledWith(stubCreate, {
    first_name: 'My First',
    last_name: 'My Last',
    email: 'hello@email.com',
    password: 'myz1p4ssw0rd',
    is_admin: false,
  })

  hash.restore()
  sinon.restore()
})

test('signUp error if user already exists', async ({ assert }) => {
  const stubGetByEmail = sinon.stub(UsersRepository.prototype, 'getByEmail')
  stubGetByEmail.resolves(new User())

  const stubCreate = sinon.stub(UsersRepository.prototype, 'create')
  stubCreate.resolves(new User())

  const usersService = await app.container.make(UsersService)
  assert.rejects(() =>
    usersService.signUp({
      first_name: 'My First',
      last_name: 'My Last',
      email: 'hello@email.com',
      password: 'myz1p4ssw0rd',
    })
  )

  assert.isTrue(stubGetByEmail.calledOnce)
  sinon.assert.calledWith(stubGetByEmail, 'hello@email.com')
  assert.isTrue(stubCreate.notCalled)

  sinon.restore()
})
