import { User } from '@prisma/client'
import { Payment, Product, Subscription } from './payment.type'
import { FlutterwaveProvider } from './providers/flutterwave'
import { Provider } from './providers/provider'

export interface BankAccount {
  accountNumber: string // Remove optional
  bankCode: string // Remove optional
  accountName?: string // Keep optional
}

interface PaymentService {
  getCustomerId(user: User): string
  validateBankAccount(
    customerId: string,
    bankAccount: BankAccount,
  ): Promise<void>
  saveBankAccount(customerId: string, bankAccount: BankAccount): Promise<void>
  withdrawFromWallet(options: {
    customerId: string
    amount: string
    bankAccount: BankAccount
  }): Promise<void>
}

class Service implements PaymentService {
  private provider: Provider = new FlutterwaveProvider()

  isActive(): boolean {
    if (this.provider) {
      return this.provider?.isActive()
    }

    return false
  }

  getCustomerId(user: User): string {
    return user.email
  }

  async getWalletBalance(user: User): Promise<string> {
    const wallet = await this.provider.getWalletBalance(
      this.getCustomerId(user),
    )
    return wallet.balance
  }

  async depositToWallet(user: User, amount: string): Promise<boolean> {
    return this.provider.depositToWallet({
      customerId: this.getCustomerId(user),
      amount,
    })
  }

  async withdrawFromWallet(options: {
    customerId: string
    amount: string
    bankAccount: BankAccount
  }): Promise<void> {
    await this.provider.withdrawFromWallet(options)
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

  async validateBankAccount(
    customerId: string,
    bankAccount: BankAccount,
  ): Promise<void> {
    await this.provider.validateBankAccount(bankAccount)
  }

  async saveBankAccount(
    customerId: string,
    bankAccount: BankAccount,
  ): Promise<void> {
    await this.provider.saveBankAccount(customerId, bankAccount)
  }
}

class Singleton {
  static service = new Service()
}

export const PaymentService = Singleton.service
