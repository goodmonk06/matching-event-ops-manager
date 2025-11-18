import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import Stripe from 'stripe';
import { NotFoundError, ConflictError, CapacityError } from '@/lib/errors';
import { canAcceptApplications } from '@/lib/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export const applicationRouter = router({
  create: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        participant: z.object({
          name: z.string(),
          email: z.string().email(),
          gender: z.enum(['male', 'female', 'other']),
          note: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Find or create participant
      let participant = await ctx.prisma.participant.findUnique({
        where: { email: input.participant.email },
      });

      if (!participant) {
        participant = await ctx.prisma.participant.create({
          data: input.participant,
        });
      }

      // Get event details
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      });

      if (!event) {
        throw new NotFoundError('Event', input.eventId);
      }

      // Check if event can accept applications
      if (!canAcceptApplications(event.status, event._count.applications, event.capacity)) {
        if (event.status !== 'published') {
          throw new ConflictError('このイベントは現在申し込みを受け付けていません');
        }
        throw new CapacityError(event.title);
      }

      // Check if already applied
      const existingApplication = await ctx.prisma.application.findUnique({
        where: {
          eventId_participantId: {
            eventId: input.eventId,
            participantId: participant.id,
          },
        },
      });

      if (existingApplication) {
        throw new ConflictError('既にこのイベントに申し込み済みです');
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: {
                name: event.title,
                description: `${event.location} - ${new Date(event.date).toLocaleDateString('ja-JP')}`,
              },
              unit_amount: event.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/public/events?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/public/events/${input.eventId}?canceled=true`,
        metadata: {
          eventId: input.eventId,
          participantId: participant.id,
        },
      });

      // Create application
      const application = await ctx.prisma.application.create({
        data: {
          eventId: input.eventId,
          participantId: participant.id,
          stripeSessionId: session.id,
        },
      });

      return {
        application,
        checkoutUrl: session.url,
      };
    }),

  updatePaymentStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        paymentStatus: z.enum(['pending', 'paid', 'cancelled', 'refunded']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const application = await ctx.prisma.application.findUnique({
        where: { id: input.id },
      });

      if (!application) {
        throw new NotFoundError('Application', input.id);
      }

      return ctx.prisma.application.update({
        where: { id: input.id },
        data: { paymentStatus: input.paymentStatus },
      });
    }),
});
