import {
  createRouter,
  createRootRoute,
  createRoute,
} from '@tanstack/react-router';
import type { DashboardSearch } from '@/types/filter';
import { Layout } from '@/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { sanitizeCsv, sanitizeDate } from '@/lib';
import { NotFound } from '@/pages/NotFound.tsx';

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFound,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
  validateSearch: (s: Partial<DashboardSearch>): DashboardSearch => ({
    start: sanitizeDate(s.start),
    end: sanitizeDate(s.end),
    publisher: sanitizeCsv(s.publisher),
    genre: sanitizeCsv(s.genre),
    status: sanitizeCsv(s.status),
    category: sanitizeCsv(s.category),
    tags: sanitizeCsv(s.tags),
  }),
});

const routeTree = rootRoute.addChildren([dashboardRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
