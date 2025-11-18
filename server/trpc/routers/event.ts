import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const eventRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }),

  listPublished: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: { status: 'published' },
      orderBy: { date: 'asc' },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: {
          applications: {
            include: {
              participant: true,
            },
          },
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        date: z.string().transform((str) => new Date(str)),
        location: z.string(),
        capacity: z.number().int().positive(),
        price: z.number().int().min(0),
        status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.create({
        data: input,
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['draft', 'published', 'cancelled', 'completed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.event.delete({
        where: { id: input.id },
      });
    }),
});
