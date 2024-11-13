import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations';
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import CartProduct from '#models/cart_product';

export default class Cart extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasMany(() => CartProduct)
  declare products: HasMany<typeof CartProduct>

  @column()
  declare deviceId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true })
  declare updatedAt: DateTime | null
}