import { test } from '@japa/runner'
import sinon from 'sinon'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import UsersRepository from '#repositories/users_repository'

test('create', async ({ assert }) => {
  const stubCreate = sinon.stub(User, 'create')
  stubCreate.resolves(new User())

  const usersRepository = await app.container.make(UsersRepository)
  const response = await usersRepository.create({
    first_name: 'my first name',
  })

  assert.instanceOf(response, User)
  assert.isTrue(stubCreate.calledOnce)
  assert.isTrue(
    stubCreate.calledWith({
      first_name: 'my first name',
    })
  )

  sinon.restore()
})

test('getById', async ({ assert }) => {
  const stubFind = sinon.stub(User, 'find')
  stubFind.resolves(new User())

  const usersRepository = await app.container.make(UsersRepository)
  const response = await usersRepository.getById(1)

  assert.instanceOf(response, User)
  assert.isTrue(stubFind.calledOnce)
  assert.isTrue(stubFind.calledWith(1))

  sinon.restore()
})
