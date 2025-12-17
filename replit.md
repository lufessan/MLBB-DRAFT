# Mobile Legends Draft Assistant

## Overview

A gaming utility application for Mobile Legends players that provides AI-powered hero counter suggestions and coaching advice. The app features an Arabic RTL interface with a modern glassmorphism gaming aesthetic, including animated snow effects and neon color accents. Users can select enemy heroes and their preferred lane to receive strategic counter-picks powered by Google's Gemini AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **Styling**: Tailwind CSS with custom gaming-themed design system
  - Glassmorphism effects with backdrop blur
  - Neon accent colors (cyan, magenta, green, orange)
  - CSS variables for theming
- **UI Components**: Radix UI primitives wrapped with shadcn/ui components
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful endpoints under `/api/`
  - `GET /api/heroes` - Fetch hero data
  - `POST /api/counter` - Get AI counter suggestions
  - `POST /api/coach` - AI coaching chat

### AI Integration
- **Provider**: Google Gemini AI via `@google/genai` SDK
- **Purpose**: Generate hero counter suggestions with reasons, combat tips, and builds
- **Fallback**: Static fallback suggestions when AI fails

### Data Layer
- **Hero Data**: Static JSON file at `client/public/data/champions.json`
- **Schema Validation**: Zod schemas in `shared/schema.ts`
- **Database**: Drizzle ORM configured for PostgreSQL (schema ready, storage currently in-memory)

### Build System
- **Development**: Vite dev server with HMR, Express backend via tsx
- **Production**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Scripts**: `npm run dev` for development, `npm run build` for production

### Key Design Decisions

**Monorepo Structure**: Single repository with `client/`, `server/`, and `shared/` directories enables code sharing (schemas, types) while keeping concerns separated.

**Static Hero Data**: Hero information stored as JSON rather than in database for simplicity and fast reads. Data includes Arabic translations for full RTL support.

**shadcn/ui Components**: Pre-built accessible components with Radix primitives reduce development time while maintaining customization flexibility through Tailwind.

**RTL-First Design**: Application built with Arabic as primary language using `dir="rtl"` and Cairo font family throughout.

## External Dependencies

### AI Services
- **Google Gemini API**: Requires `GEMINI_API_KEY` environment variable for AI-powered suggestions

### Database
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable (Drizzle ORM)
- **Current State**: In-memory storage (`MemStorage` class) used as fallback

### Frontend Libraries
- **@tanstack/react-query**: Data fetching and caching
- **Radix UI**: Accessible UI primitives (dialog, dropdown, tooltip, etc.)
- **Embla Carousel**: Carousel functionality
- **date-fns**: Date formatting utilities

### Development Tools
- **Vite plugins**: Runtime error overlay, Replit-specific dev tools
- **Drizzle Kit**: Database migrations via `npm run db:push`