import { User } from '@prisma/client'
import { Payment, Product, Subscription, WebhookResponse } from './payment.type'
import { Provider } from './providers/provider'

class PlaceholderProvider implements Provider {
  isActive(): boolean {
    return true
  }

  async createCustomer(): Promise<string> {
    throw new Error('Payment provider not implemented')
  }

  async createPaymentLink(): Promise<string> {
    throw new Error('Payment provider not implemented')
  }

  async findManySubscriptions(): Promise<Subscription[]> {
    return []
  }

  async findManyPayments(): Promise<Payment[]> {
    return []
  }

  async findManyProducts(): Promise<Product[]> {
    return []
  }

  async onPayment(): Promise<WebhookResponse> {
    throw new Error('Payment provider not implemented')
  }
}

class Service {
  private provider: Provider = new PlaceholderProvider()

  isActive(): boolean {
    if (this.provider) {
      return this.provider?.isActive()
    }

    return false
  }

  getCustomerId(user: User): string | null {
    return null
  }

  async findManyProducts(): Promise<Product[]> {
    return this.provider.findManyProducts()
  }

  async findManySubscriptions(customer: User): Promise<Subscription[]> {
    return this.provider.findManySubscriptions(this.getCustomerId(customer))
  }

  async findManyPayments(user: User): Promise<Payment[]> {
    return this.provider.findManyPayments(this.getCustomerId(user))
  }

  async createPaymentLink(options: {
    user: User

    productId: string
    metadata?: Record<string, string>
    urlRedirection?: string
  }): Promise<string> {
    const optionsPayment = {
      ...options,

      customerId: this.getCustomerId(options.user),
    }

    return this.provider.createPaymentLink(optionsPayment)
  }

  async onPayment(body: Buffer, sig: string): Promise<WebhookResponse> {
    return this.provider.onPayment(body, sig)
  }

  async createCustomer(customer: User): Promise<string> {
    return this.provider.createCustomer({
      name: customer.name ?? customer.email,

      email: customer.email,
    })
  }
}

class Singleton {
  static service = new Service()
}

export const PaymentService = Singleton.service
