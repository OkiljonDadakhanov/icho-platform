# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js frontend dashboard for the 57th International Chemistry Olympiad 2026 (Uzbekistan) registration system.

**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix primitives)

## Commands

```bash
npm run dev     # Start dev server (http://localhost:3000)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

## Architecture

### Directory Structure

```
app/
├── page.tsx                    # Root redirect
├── login/page.tsx              # Public login page
└── (authenticated)/            # Protected route group
    ├── dashboard/
    ├── team/
    ├── documents/
    ├── travel/
    ├── invitations/
    ├── payment/
    ├── pre-registration/
    ├── coordinators/
    ├── information/
    ├── profile-photos/
    └── updating/

components/
├── ui/                         # shadcn/ui components
├── sidebar.tsx                 # Main navigation
└── theme-provider.tsx

lib/
├── api.ts                      # ApiClient singleton with JWT handling
├── types.ts                    # TypeScript interfaces
├── services/                   # API service modules
├── error-utils.ts              # Error handling utilities
└── utils.ts                    # General utilities (cn helper)

contexts/                       # React contexts
hooks/                          # Custom React hooks
middleware.ts                   # Auth middleware (cookie-based token check)
```

### API Client (`lib/api.ts`)

Singleton `ApiClient` handles:
- JWT token storage (localStorage + cookies for middleware)
- Automatic token refresh on 401
- File uploads via `FormData`
- File downloads as `Blob`

```typescript
import { api } from '@/lib/api';

// Usage
await api.get<T>('/v1/participants/');
await api.post<T>('/v1/participants/', data);
await api.upload<T>('/v1/documents/upload/', formData);
await api.download('/v1/documents/1/download/');
```

### Authentication Flow

1. Login posts to `/api/auth/token/`
2. Tokens stored in localStorage and cookies
3. `middleware.ts` checks `accessToken` cookie for protected routes
4. `ApiClient` auto-refreshes expired tokens

### Environment Variables

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Code Style

- TypeScript strict mode
- Route folders: kebab-case (`pre-registration/`)
- Component files: lowercase (`button.tsx`)
- Use shadcn/ui components from `components/ui/`
- Tailwind CSS for styling

## Key Dependencies

- `react-hook-form` + `zod` - Form handling and validation
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `date-fns` - Date utilities
- `recharts` - Charts
