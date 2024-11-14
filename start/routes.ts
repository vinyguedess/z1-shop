/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.post('/auth/sign_up', '#controllers/auth_controller.signUp')

router.get('/products', '#controllers/products_controller.index')
