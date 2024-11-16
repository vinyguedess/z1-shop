import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('carts', (table) => {
      table.integer('user_id').unsigned().nullable().after('id').references('users.id')
      table.string('device_id', 100).notNullable().alter()
    })
  }

  async down() {
    this.schema.alterTable('carts', (table) => {
      table.dropForeign(['user_id'])
      table.dropColumn('user_id')
      table.string('device_id', 100).nullable().alter()
    })
  }
}
