import { router } from '../trpc';
import { eventRouter } from './event';
import { applicationRouter } from './application';

export const appRouter = router({
  event: eventRouter,
  application: applicationRouter,
});

export type AppRouter = typeof appRouter;
