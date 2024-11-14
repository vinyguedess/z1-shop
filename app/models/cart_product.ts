import Product from '#models/product'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class CartProduct extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @column()
  declare cartId: number

  @column()
  declare productId: number

  @column()
  declare amount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null
}
