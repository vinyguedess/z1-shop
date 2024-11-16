import Order from '#models/order'
import OrderItem from '#models/order_item'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class OrdersRepository {
  create(trx: TransactionClientContract, data: Record<string, any>): Promise<Order> {
    return new Order().fill(data).useTransaction(trx).save()
  }

  createOrderItem(trx: TransactionClientContract, data: Record<string, any>): Promise<OrderItem> {
    return new OrderItem().fill(data).useTransaction(trx).save()
  }
}
