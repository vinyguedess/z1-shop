import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        first_name: 'Z1 Shop',
        last_name: 'Admin',
        email: 'admin@z1shop.com',
        password: await hash.make('adminp4ssw0rd'),
      },
    ])
  }
}
