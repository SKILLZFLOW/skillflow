import {
  Payment,
  Product,
  WebhookResponse,
  Subscription,
} from '../payment.type'

export type ProviderCreatePaymentLinkOptions = {
  customerId: string
  productId: string
  metadata?: Record<string, string>
  urlRedirection?: string
}

export interface Provider {
  createCustomer(customer: { email: string; name: string }): Promise<string>
  createPaymentLink(options: ProviderCreatePaymentLinkOptions): Promise<string>
  findManySubscriptions(customerId: string): Promise<Subscription[]>
  findManyPayments(customerId: string): Promise<Payment[]>
  findManyProducts(): Promise<Product[]>
  onPayment(body: Buffer, sig: string): Promise<WebhookResponse>
  isActive(): boolean
  validateBankAccount(bankAccount: {
    accountNumber: string
    bankCode: string
  }): Promise<{ accountNumber: string; bankCode: string; accountName?: string }>
  saveBankAccount(
    customerId: string,
    bankAccount: { accountNumber: string; bankCode: string },
  ): Promise<void>
  withdrawFromWallet(options: {
    customerId: string
    amount: string
    bankAccount: { accountNumber: string; bankCode: string }
  }): Promise<boolean>
  getWalletBalance(customerId: string): Promise<{ balance: string }>
  depositToWallet(options: {
    customerId: string
    amount: string
  }): Promise<boolean>
}
