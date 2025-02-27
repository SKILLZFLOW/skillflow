import { Configuration } from '@/core/configuration'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { Trpc } from '~/core/trpc/base'
import { PaymentService } from './payment.service'
import { COMMISSION_PERCENTAGE, BankAccount } from './providers/flutterwave'

/**
 * @provider BillingApi
 * @description API for payment operations using Flutterwave
 * @function validateBankAccount - Validates bank account details
 * @function saveBankAccount - Saves validated bank account for future use
 * @function processWithdrawal - Processes withdrawal to saved bank account
 * @function getWalletBalance - Gets current wallet balance
 * @function initiateDeposit - Initiates deposit to wallet
 * @usage `const api = Api.billing`
 */

export const BillingRouter = Trpc.createRouter({
  getWalletBalance: Trpc.procedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const user = await ctx.database.user.findFirstOrThrow({
        where: { id: userId },
      })

      return PaymentService.getWalletBalance(user)
    }),

  initiateDeposit: Trpc.procedure
    .input(z.object({ amount: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const user = await ctx.database.user.findFirstOrThrow({
        where: { id: userId },
      })

      return PaymentService.depositToWallet(user, input.amount)
    }),

  validateBankAccount: Trpc.procedure
    .input(
      z.object({
        bankAccount: z.object({
          accountNumber: z
            .string()
            .regex(/^\d+$/, 'Account number must contain only digits')
            .min(1),
          bankCode: z
            .string()
            .regex(/^[A-Z0-9]+$/, 'Bank code must be alphanumeric')
            .min(1)
        }).strict()
      }).required()
    )
    .mutation(async ({ ctx, input }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const user = await ctx.database.user.findFirstOrThrow({
        where: { id: userId },
      })

      return PaymentService.validateBankAccount(user.id, input.bankAccount as BankAccount)
    }),

  saveBankAccount: Trpc.procedure
    .input(
      z.object({
        bankAccount: z.object({
          accountNumber: z
            .string()
            .regex(/^\d+$/, 'Account number must contain only digits')
            .min(1),
          bankCode: z
            .string()
            .regex(/^[A-Z0-9]+$/, 'Bank code must be alphanumeric')
            .min(1)
        }).strict()
      }).required()
    )
    .mutation(async ({ ctx, input }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const user = await ctx.database.user.findFirstOrThrow({
        where: { id: userId },
      })

      return PaymentService.saveBankAccount(user.id, input.bankAccount as BankAccount)
    }),

  processWithdrawal: Trpc.procedure
    .input(
      z.object({
        amount: z.string(),
        bankAccount: z.object({
          accountNumber: z
            .string()
            .regex(/^\d+$/, 'Account number must contain only digits')
            .min(1),
          bankCode: z
            .string()
            .regex(/^[A-Z0-9]+$/, 'Bank code must be alphanumeric')
            .min(1)
        }).strict().required()
      }).required()
    )
    .mutation(async ({ ctx, input }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      try {
        const userId = ctx.session?.user?.id
        const user = await ctx.database.user.findFirstOrThrow({
          where: { id: userId },
        })

        // Validate bank account before withdrawal
        await PaymentService.validateBankAccount(user.id, input.bankAccount as BankAccount)

        // Save validated bank account
        await PaymentService.saveBankAccount(user.id, input.bankAccount as BankAccount)

        // Process withdrawal
        return PaymentService.withdrawFromWallet({
          customerId: user.id,
          amount: input.amount,
          bankAccount: input.bankAccount as BankAccount,
        })
      } catch (error) {
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to process withdrawal',
        })
      }
    }),

  getReferralCommissions: Trpc.procedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const referrals = await ctx.database.referral.findMany({
        where: { referrerId: userId },
        include: {
          transactions: {
            select: {
              amount: true,
              id: true,
              type: true,
              status: true,
              referralId: true,
            },
          },
        },
      })

      return referrals
        .reduce((total, referral) => {
          const commission = referral.transactions.reduce((sum, tx) => {
            if (tx.type === 'REFERRAL' && tx.status === 'COMPLETED') {
              return sum + parseFloat(tx.amount || '0') * COMMISSION_PERCENTAGE
            }
            return sum
          }, 0)
          return total + commission
        }, 0)
        .toString()
    }),
  findManyProducts: Trpc.procedurePublic.input(z.object({})).query(async () => {
    if (!PaymentService.isActive()) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Payment provider not configured',
      })
    }
    return PaymentService.findManyProducts()
  }),

  findManyPayments: Trpc.procedure
    .input(z.object({}))
    .query(async ({ ctx, input }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const user = await ctx.database.user.findFirstOrThrow({
        where: { id: userId },
      })

      return PaymentService.findManyPayments(user)
    }),

  findManySubscriptions: Trpc.procedure
    .input(z.object({}))
    .query(async ({ ctx, input }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const user = await ctx.database.user.findFirstOrThrow({
        where: { id: userId },
      })

      return PaymentService.findManySubscriptions(user)
    }),

  createPaymentLink: Trpc.procedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!PaymentService.isActive()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment provider not configured',
        })
      }

      const userId = ctx.session?.user?.id
      const user = await ctx.database.user.findFirstOrThrow({
        where: { id: userId },
      })

      const urlRedirection = Configuration.getBaseUrl()

      const url = await PaymentService.createPaymentLink({
        user,
        productId: input.productId,
        metadata: {
          userId: user.id,
        },
        urlRedirection,
      })

      return { url }
    }),
})
