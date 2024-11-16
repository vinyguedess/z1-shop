import Order from '#models/order'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class OrdersRepository {
  create(trx: TransactionClientContract, data: Record<string, any>): Promise<Order> {
    return new Order().fill(data).useTransaction(trx).save()
  }
}
