import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.engine('InnoDB')
      table.increments('id')
      table.string('name', 150).notNullable()
      table.string('description', 250).nullable()
      table.decimal('price', 10, 2).notNullable()
      table.integer('amount').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
