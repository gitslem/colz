# COLZ - Creative Collaboration Platform

## Overview

COLZ is a mobile-first web application that connects artists and record labels for creative collaboration. Artists can showcase their portfolios, discover collaboration opportunities posted by labels, and apply to projects. Labels can post opportunities, browse artist profiles, and manage applications. The platform emphasizes visual presentation of creative work with a clean, modern interface inspired by Behance, LinkedIn, and Upwork.

**Core User Flows:**
- Artists: Create profiles with portfolios, discover and apply to opportunities, showcase projects
- Labels: Create company profiles, post collaboration opportunities, review applications
- Both roles: Search and filter content, manage profiles with media uploads

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (replaces heavier React Router)
- TanStack Query (React Query) for server state management, caching, and automatic refetching

**UI Component Library:**
- shadcn/ui components built on Radix UI primitives (40+ pre-built accessible components)
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows "new-york" style variant with neutral color palette
- Typography: Inter (UI/body) and Space Grotesk (headings/display) from Google Fonts
- Custom CSS variables for theming with light/dark mode support

**State Management Strategy:**
- Server state managed entirely through React Query with query invalidation patterns
- Local UI state kept in component-level useState/useReducer
- No global state management library (Redux/Zustand) - server state suffices for this application
- Authentication state derived from `/api/auth/user` query

**File Upload Handling:**
- Dual upload system: Uppy.js with AWS S3 integration for complex multi-file uploads
- SimpleUploader component for single-file uploads (profile images)
- Google Cloud Storage backend via Replit's sidecar service

### Backend Architecture

**Server Framework:**
- Express.js REST API with TypeScript
- Session-based authentication using Replit Auth (OpenID Connect)
- express-session with PostgreSQL session store for persistent sessions
- Custom middleware for request logging and error handling

**API Design Pattern:**
- RESTful endpoints organized by resource type (users, profiles, opportunities, projects, applications)
- Authentication middleware (`isAuthenticated`) protecting all non-public routes
- Consistent error responses with HTTP status codes
- Request/response logging with JSON body capture for debugging

**Database Layer:**
- Drizzle ORM for type-safe database operations with PostgreSQL
- Neon serverless PostgreSQL via WebSocket connection
- Schema-first approach with Zod validation for runtime type checking
- Relations defined between users, profiles, opportunities, and applications

**Database Schema Design:**
```
users (id, email, firstName, lastName, profileImageUrl, role)
  ├── artistProfiles (userId FK, bio, location, genres[], skills[], socialLinks)
  ├── labelProfiles (userId FK, companyName, bio, website, logoUrl)
  ├── projects (artistId FK, title, description, genres[], mediaUrls[])
  ├── opportunities (labelId FK, title, description, genres[], skills[], compensation, deadline)
  └── applications (opportunityId FK, artistId FK, coverLetter, status)
sessions (sid PK, sess JSONB, expire) - for Replit Auth
```

**Authentication Flow:**
- Replit Auth handles OAuth flow with session creation
- Sessions stored in PostgreSQL with 7-day TTL
- User object attached to request via Passport.js strategy
- Role-based access control via user.role field (artist/label)

**Object Storage Architecture:**
- Google Cloud Storage integration via Replit sidecar service
- Custom ACL (Access Control List) system for object permissions
- Public/private visibility with owner-based access control
- Presigned upload URLs for direct client-to-storage uploads

### External Dependencies

**Third-Party Services:**
- **Replit Auth**: OpenID Connect authentication provider for user login/signup
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections
- **Google Cloud Storage**: Object storage for media files (images, audio, video) via Replit's sidecar
- **Google Fonts**: CDN delivery of Inter and Space Grotesk typefaces

**NPM Package Ecosystem:**
- **UI Components**: @radix-ui/* primitives (20+ packages for accessible components)
- **Forms**: react-hook-form with @hookform/resolvers for Zod schema validation
- **File Uploads**: Uppy ecosystem (@uppy/core, @uppy/aws-s3, @uppy/dashboard, @uppy/react)
- **Database**: drizzle-orm, @neondatabase/serverless, drizzle-zod for schema validation
- **Authentication**: openid-client, passport, express-session, connect-pg-simple
- **Styling**: tailwindcss, autoprefixer, class-variance-authority, clsx, tailwind-merge

**Development Tools:**
- TypeScript compiler with path aliases (@/, @shared/, @assets/)
- Vite plugins: @vitejs/plugin-react, Replit-specific plugins for error overlay and dev banner
- esbuild for backend bundling in production builds

**Build & Deployment:**
- Development: Vite dev server with Express API proxy
- Production: Static frontend built to dist/public, backend bundled with esbuild
- Environment variables: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS, ISSUER_URL, PUBLIC_OBJECT_SEARCH_PATHS