import { TRPCError } from '@trpc/server'
import Flutterwave from 'flutterwave-node-v3'
import { Payment, Product, Subscription } from '../payment.type'
import { Provider, ProviderCreatePaymentLinkOptions } from './provider'

export const COMMISSION_PERCENTAGE = 0.5
export interface BankAccount {
  accountNumber: string
  bankCode: string
  accountName?: string
}

export class FlutterwaveProvider implements Provider {
  private flw: Flutterwave

  constructor() {
    const publicKey = process.env.FLW_PUBLIC_KEY
    const secretKey = process.env.FLW_SECRET_KEY

    this.flw = new Flutterwave(publicKey, secretKey)
  }

  isActive(): boolean {
    return true
  }

  async createCustomer(customer: {
    email: string
    name: string
  }): Promise<string> {
    // Flutterwave doesn't have explicit customer creation
    // Use email as customer ID
    return customer.email
  }

  async createPaymentLink(
    options: ProviderCreatePaymentLinkOptions,
  ): Promise<string> {
    const payload = {
      tx_ref: `tx-${Date.now()}`,
      amount: '100', // Get from product
      currency: 'NGN',
      redirect_url: options.urlRedirection || 'https://example.com',
      customer: {
        email: options.customerId,
      },
      meta: options.metadata,
      customizations: {
        title: 'Payment',
        description: 'Payment for product',
      },
    }

    const response = await this.flw.Charge.create(payload)
    return response.data.link
  }

  async findManySubscriptions(customerId: string): Promise<Subscription[]> {
    // Flutterwave doesn't have built-in subscription management
    return []
  }

  async findManyPayments(customerId: string): Promise<Payment[]> {
    const transactions = await this.flw.Transaction.fetch({
      customer_email: customerId,
    })

    return transactions.data.map(tx => ({
      id: tx.id.toString(),
      amount: tx.amount.toString(),
      currency: tx.currency,
      status: tx.status,
      created: new Date(tx.created_at).toISOString(),
    }))
  }

  async findManyProducts(): Promise<Product[]> {
    // Implement product management in your application
    return []
  }

  async onPayment(body: Buffer, sig: string): Promise<any> {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH
    const payload = JSON.parse(body.toString())

    const isValid = this.flw.Webhook.verifyWebhook(sig, secretHash)

    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    return {
      userId: payload.data.meta?.userId,
      customerId: payload.data.customer.email,
      transactionRef: payload.data.tx_ref,
      amount: payload.data.amount,
    }
  }

  async getReferralCommission(amount: string): Promise<string> {
    const commission = parseFloat(amount) * COMMISSION_PERCENTAGE
    return commission.toString()
  }

  async validateBankAccount(bankAccount: BankAccount): Promise<BankAccount> {
    try {
      const response = await this.flw.Bank.validate({
        account_number: bankAccount.accountNumber,
        account_bank: bankAccount.bankCode,
      })

      if (!response.status || response.status !== 'success') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid bank account details',
        })
      }

      return {
        ...bankAccount,
        accountName: response.data.account_name,
      }
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message || 'Failed to validate bank account',
      })
    }
  }

  async saveBankAccount(
    customerId: string,
    bankAccount: BankAccount,
  ): Promise<void> {
    try {
      const validatedAccount = await this.validateBankAccount(bankAccount)
      await this.flw.Bank.create({
        account_bank: validatedAccount.bankCode,
        account_number: validatedAccount.accountNumber,
        email: customerId,
      })
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to save bank account',
      })
    }
  }

  async withdrawFromWallet(options: {
    customerId: string
    amount: string
    bankAccount: BankAccount
  }): Promise<boolean> {
    try {
      const validatedAccount = await this.validateBankAccount(
        options.bankAccount,
      )

      const transfer = await this.flw.Transfer.create({
        account_bank: validatedAccount.bankCode,
        account_number: validatedAccount.accountNumber,
        amount: options.amount,
        currency: 'NGN',
        reference: `transfer-${Date.now()}`,
        callback_url: process.env.FLUTTERWAVE_WEBHOOK_URL,
        debit_currency: 'NGN',
      })

      if (!transfer.status || transfer.status !== 'success') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Withdrawal failed',
        })
      }

      return true
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to process withdrawal',
      })
    }
  }

  async getWalletBalance(customerId: string): Promise<{ balance: string }> {
    // Flutterwave doesn't have direct wallet balance endpoint
    return { balance: '0' }
  }

  async depositToWallet(options: {
    customerId: string
    amount: string
  }): Promise<boolean> {
    // Use existing Charge.create for deposits
    const payload = {
      tx_ref: `deposit-${Date.now()}`,
      amount: options.amount,
      currency: 'NGN',
      customer: { email: options.customerId },
    }
    await this.flw.Charge.create(payload)
    return true
  }
}
