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
  ├── projects (artistId FK, title, description, genres[], mediaUrls[], mediaType, mediaDuration)
  ├── opportunities (labelId FK, title, description, genres[], skills[], compensation, deadline, status)
  ├── applications (opportunityId FK, artistId FK, coverLetter, status)
  ├── conversations (user1Id FK, user2Id FK, lastMessageAt)
  ├── messages (conversationId FK, senderId FK, content, read)
  ├── notifications (userId FK, type, title, message, link, read)
  └── userPreferences (userId FK, emailNotifications, applicationNotifications, messageNotifications, opportunityNotifications, profileVisibility)
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

## Recent Changes (October 2025)

### Completed Features

1. **Real-time Messaging System**
   - REST API for conversations and messages
   - Conversation list and message thread views
   - Real-time message delivery (no WebSocket - using REST polling)
   - Authorization: only conversation participants can access messages
   - Endpoints: GET/POST /api/conversations, GET/POST /api/messages, PATCH /api/messages/:id/read

2. **Notification Center**
   - NotificationBell component with dropdown UI
   - Unread count badge
   - Notification triggers for: application submissions, acceptances, rejections, new messages
   - Mark as read functionality (individual and bulk)
   - Endpoints: GET /api/notifications, POST /api/notifications/mark-read, POST /api/notifications/mark-all-read

3. **Advanced Portfolio Management**
   - Extended projects schema with mediaType (image/audio/video) and mediaDuration fields
   - MediaPlayer components for audio/video playback with controls
   - ProjectMediaDisplay for conditional rendering based on media type
   - Automatic media type detection on upload

4. **User Settings**
   - Settings page with three tabs: Account, Notifications, Privacy
   - Account tab: edit name, upload profile image
   - Notifications tab: toggle email/application/message/opportunity notifications
   - Privacy tab: set profile visibility (public/private/connections)
   - Endpoints: PATCH /api/auth/user, GET/POST /api/preferences

5. **Analytics Dashboard (Labels Only)**
   - Opportunity performance metrics with aggregated application counts
   - Application status breakdown (pending/accepted/rejected)
   - Acceptance rate calculations per opportunity
   - Data visualization using Recharts (bar charts, pie charts)
   - Detailed metrics table showing per-opportunity statistics
   - Endpoints: GET /api/analytics/opportunities, GET /api/analytics/application-breakdown
   - Navigation: Analytics link visible only to label users

### Bug Fixes (October 24, 2025)

1. **Discover Page Filter Bug**
   - Fixed SelectItem components with empty string values causing errors
   - Changed filter default values from "" to "all"
   - Updated filter logic to properly handle "all" as the reset value
   - Files: client/src/pages/discover.tsx

2. **Opportunity Creation Deadline Bug**
   - Added date string to Date object conversion in POST /api/opportunities route
   - Properly handles optional deadline field (converts to Date or null)
   - Prevents database insertion errors for date fields
   - Files: server/routes.ts

3. **Opportunity Creation Redirect Bug**
   - Fixed redirect after opportunity creation to navigate to detail page
   - Changed from redirecting to "/" (causing 404) to "/opportunities/:id"
   - Captures returned opportunity ID from API response
   - Fallback to /discover if ID is not returned
   - Files: client/src/pages/opportunity-form.tsx

4. **Deployment Server Initialization Bug**
   - Removed unsupported `reusePort: true` option from server.listen()
   - Added comprehensive try-catch error handling for server initialization
   - Changed to standard `listen(port, host, callback)` format for Cloud Run/Autoscale compatibility
   - Files: server/index.ts

5. **Missing Project Detail Page (404 Error)**
   - Created ProjectDetail component for displaying individual project pages
   - Added route `/projects/:id` to App.tsx router configuration
   - Displays project media, artist information, description, genres, and duration
   - Backend endpoint GET /api/projects/:id already existed
   - Files: client/src/pages/project-detail.tsx, client/src/App.tsx

6. **Home Page Content Duplication (October 24, 2025)**
   - Fixed routing issue where Landing component was rendering twice
   - Changed catch-all routes from `<Route component={Landing} />` to proper redirects
   - Unauthenticated users now redirect to landing page instead of seeing 404s
   - Files: client/src/App.tsx

7. **Missing Artist Detail Page (October 24, 2025)**
   - Created ArtistDetail component for viewing artist profiles
   - Added backend routes: GET /api/artists/:id and GET /api/artists/:id/projects
   - Added route `/artists/:id` to App.tsx router configuration
   - Displays artist bio, skills, genres, website, and all their projects
   - Users can now click on artist cards in Discover page to view full profiles
   - Files: client/src/pages/artist-detail.tsx, client/src/App.tsx, server/routes.ts

8. **Improved Signup Flow (October 24, 2025)**
   - Created new Signup component with two-step onboarding process
   - Step 1: Users enter their first name and last name
   - Step 2: Users select their role (artist or label)
   - Replaced RoleSelection with Signup in App.tsx routing
   - Better user experience with personalized greeting
   - Files: client/src/pages/signup.tsx, client/src/App.tsx