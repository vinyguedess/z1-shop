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
})
