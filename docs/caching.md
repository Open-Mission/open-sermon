# Performance & Caching

Open Sermon uses a multi-layered caching strategy to ensure fast performance and offline accessibility.

## Client-Side Caching (TanStack Query)

**React-Query** (via `@tanstack/react-query`) is used to manage server-side state on the client.
- **Provider**: `components/query-provider.tsx` wraps the application.
- **Hooks**: Custom hooks like `hooks/use-sermons.ts` and `hooks/use-bible.ts` wrap the React-Query `useQuery` and `useMutation` hooks.
- **Stale Time**: Defaults to 5 minutes for most data.
- **Cache Name**: Managed by React-Query's internal cache instance.

### Benefits
- **Optimistic Updates**: Immediate UI feedback on sermon saves/updates.
- **Deduplication**: Prevents multiple redundant network requests for the same data.
- **Background Refreshing**: Data stays fresh without manual reloads.

## Server-Side Caching (Upstash Redis)

**Upstash Redis** is used to cache external API responses and expensive database queries.
- **Client**: `lib/redis.ts`.
- **Primary Use Case**: API.Bible responses (Bible verses) and sermon listings.
- **TTL**: Verses are cached for 30 days since they rarely change.

### Implementation Pattern
The `app/api/bible/route.ts` first checks Redis for the requested passage. If not found, it fetches from API.Bible, saves to Redis, then returns to the user.

## Next.js Incremental Cache

Experimental caching features are enabled in `next.config.ts`:
- **PPR**: Partial Prerendering for hybrid static/dynamic page generation.
- **Dynamic IO**: Optimized data fetching and caching for server components.
