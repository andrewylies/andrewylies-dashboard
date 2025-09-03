import {
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router';
import type { DashboardSearch } from '@/types/filter.ts';
import { Layout } from '@/Layout.tsx';
import { Dashboard } from './pages/Dashboard';

const rootRoute = createRootRoute({
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
  validateSearch: (s: Record<string, unknown>): DashboardSearch => ({
    start: (s.start as string) ?? undefined,
    end: (s.end as string) ?? undefined,
    publisher: (s.publisher as string) ?? 'all',
    genre: (s.genre as string) ?? 'all',
    status: (s.status as string) ?? 'all',
    author: (s.author as string) ?? 'all',
    channel: (s.channel as 'all' | 'app' | 'web') ?? 'all',
  }),
});

const routeTree = rootRoute.addChildren([dashboardRoute]);
export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
