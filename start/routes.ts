/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

router.post('/auth/sign_in', '#controllers/auth_controller.signIn')
router.post('/auth/sign_up', '#controllers/auth_controller.signUp')

router.post('/carts', '#controllers/carts_controller.create')
router.get('/carts/:deviceId', '#controllers/carts_controller.getCart')
router.patch('/carts/:deviceId/add_product', '#controllers/carts_controller.addProduct')

router.get('/products', '#controllers/products_controller.index')
router.post('/products', '#controllers/products_controller.create').use(middleware.auth())
