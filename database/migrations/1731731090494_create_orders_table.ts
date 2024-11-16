import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema
      .createTable(this.tableName, (table) => {
        table.increments('id')
        table.integer('user_id').unsigned().notNullable().references('users.id')
        table.timestamp('created_at')
        table.timestamp('updated_at')
      })
      .createTable('order_items', (table) => {
        table.increments('id')
        table.integer('order_id').unsigned().notNullable().references('orders.id')
        table.integer('product_id').unsigned().notNullable().references('products.id')
        table.decimal('price', 10, 2).notNullable()
        table.integer('amount').notNullable()
        table.timestamp('created_at')
        table.timestamp('updated_at')
      })
  }

  async down() {
    this.schema.dropTable('order_items')
    this.schema.dropTable(this.tableName)
  }
}
