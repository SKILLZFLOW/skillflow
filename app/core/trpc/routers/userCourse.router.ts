import { Trpc } from '@/core/trpc/base'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const UserCourseRouter = Trpc.createRouter({
  delete: Trpc.procedure
    .input(
      z.object({
        where: z.object({
          courseId: z.string(),
          userId: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if the enrollment exists
      const enrollment = await ctx.database.userCourse.findFirst({
        where: {
          courseId: input.where.courseId,
          userId: input.where.userId,
        },
      })

      if (!enrollment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course enrollment not found',
        })
      }

      // Check if course exists
      const course = await ctx.database.course.findUnique({
        where: { id: input.where.courseId },
      })

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        })
      }

      await ctx.database.userCourse.deleteMany({
        where: {
          courseId: input.where.courseId,
          userId: input.where.userId,
        },
      })

      return {
        success: true,
        message: 'Course enrollment successfully deleted',
      }
    }),
})
