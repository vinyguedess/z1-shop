import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('cart_products', (table) => {
      table.integer('amount').notNullable().after('product_id')
    })
  }

  async down() {
    this.schema.alterTable('cart_products', (table) => {
      table.dropColumn('amount')
    })
  }
}
