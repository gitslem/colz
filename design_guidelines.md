# COLZ Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from creative professional platforms like Behance (portfolio showcase), LinkedIn (professional networking), and Upwork (opportunity marketplace). The design emphasizes visual content while maintaining professional credibility for creative collaboration.

**Core Principle**: Elevate artist work as the hero element while enabling seamless discovery and connection.

---

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - all UI elements, body text
- Display: Space Grotesk (Google Fonts) - headings, artist names, opportunity titles

**Hierarchy**:
- Hero/Profile Names: text-4xl md:text-5xl font-bold (Space Grotesk)
- Section Headers: text-2xl md:text-3xl font-semibold (Space Grotesk)
- Opportunity/Project Titles: text-xl font-semibold (Space Grotesk)
- Body Text: text-base leading-relaxed (Inter)
- Card Metadata: text-sm font-medium (Inter)
- Helper Text: text-xs (Inter)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 consistently
- Component padding: p-4 to p-6
- Section spacing: py-12 md:py-16
- Card gaps: gap-6 md:gap-8
- Element margins: mb-4, mb-6, mb-8

**Grid System**:
- Max container: max-w-7xl mx-auto px-4
- Opportunity/Artist Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Profile Content: Single column max-w-4xl for readability
- Search Results: grid-cols-1 lg:grid-cols-2 gap-8

---

## Component Library

### Navigation
**Top Navigation Bar**: Sticky header with logo left, search center, user avatar/notifications right. Height: h-16. Include quick role indicator (Artist/Label badge).

**Bottom Tab Bar** (Mobile): Fixed bottom navigation with 5 tabs - Home, Discover, Create, Messages, Profile. Icons from Heroicons, active state with icon fill and subtle indicator.

### Cards

**Artist Profile Card**: 
- Aspect ratio card with profile image background (overlay gradient)
- Avatar positioned bottom-left with online status indicator
- Name, primary genre, location overlay on image
- Skill tags below image
- Stats row: projects, collaborations, rating
- CTA: "View Profile" + "Message" buttons

**Opportunity Card**:
- Header: Label logo + name + verified badge
- Title (bold, prominent)
- Compensation + deadline badges
- 2-3 line description preview
- Required skills as tags (max 4 visible)
- Footer: applicant count + posted date
- CTA: "View Details" prominent button

**Project Showcase Card**:
- Large media preview (audio/video thumbnail with play icon overlay)
- Project title + artist name
- Collaboration count + genre tags
- Engagement stats: plays, likes, shares

### Forms

**Input Fields**: 
- Border-2 with rounded-lg
- Floating labels that animate on focus
- Clear visual feedback states (focus ring, error border)
- Icon prefix for search/email fields (Heroicons)
- Helper text below in muted styling

**Multi-Select Tags**: Pill-style with x-close, max-w-fit inline-flex, animated add/remove

**File Upload**: 
- Drag-and-drop zone with dashed border
- Preview thumbnails for uploaded media
- Progress indicators for uploads

### Profile Sections

**Artist Profile**:
- Hero: Full-width cover image (16:9 aspect) with gradient overlay
- Floating avatar (large, border-4 solid with offset from cover)
- Bio section: max-w-3xl centered
- Portfolio Grid: Masonry-style media gallery (audio/video players)
- Skills & Genres: Tag cloud layout
- Social Links: Icon buttons row
- Stats Dashboard: 4-column grid on desktop

**Label Profile**:
- Professional header with logo prominent
- About section with company info
- Active Opportunities grid
- Featured Artists carousel
- Contact information card

### Discovery & Search

**Search Interface**:
- Prominent search bar with filters dropdown
- Filter sidebar (desktop) / bottom sheet (mobile)
- Faceted filters: Genre, Location, Skill Level, Availability
- Applied filters shown as removable pills
- Sort options: Relevance, Recent, Rating

**Feed Layout**:
- Mixed content: opportunities, artist highlights, projects
- Infinite scroll with loading states
- "Recommended for you" section header
- Clear visual separation between content types

### Messaging

**Chat List**:
- Avatar + name + last message preview
- Timestamp right-aligned
- Unread count badge
- Online status indicator
- Search/filter at top

**Chat Interface**:
- Header: contact info + options menu
- Message bubbles: sender right, receiver left, rounded-2xl
- Timestamp groups
- Media message previews
- Input bar: text field + attachment + send icons
- Typing indicator animation

### Modals & Overlays

**Opportunity Details Modal**: 
- Full-screen on mobile, centered lg:max-w-3xl on desktop
- Scrollable content area
- Sticky header with close button
- Sticky footer with primary CTA

**Application Form Modal**: 
- Multi-step if needed with progress indicator
- Form sections with clear headers
- File attachment area
- Submit button prominent at bottom

**Filters Panel**: 
- Slide-in from right (desktop) / bottom (mobile)
- Section headers for filter groups
- Checkbox/radio groups
- Range sliders for numerical filters
- Apply/Reset buttons sticky at bottom

---

## Animations

**Micro-interactions Only**:
- Card hover: subtle scale (1.02) + shadow elevation
- Button press: scale(0.98) feedback
- Tab switching: smooth cross-fade
- Modal enter/exit: slide + fade
- Loading states: skeleton screens (shimmer effect)

**No** scroll-triggered animations, parallax, or decorative motion.

---

## Images

**Hero Sections**: No traditional hero. Lead with content.

**Profile Images Required**:
- Artist cover images: 1600x900px minimum, dramatic/creative
- Artist avatars: 400x400px, circular crop
- Label logos: 200x200px, square/circular
- Project thumbnails: 800x800px for audio, 16:9 for video

**Opportunity Imagery**: Label logo + optional cover image for premium opportunities

**Placeholder Strategy**: Use gradient backgrounds + initials for missing avatars, abstract patterns for missing covers.

---

## Key Screens Layout

**Home/Feed**: Full-width feed layout, opportunity cards + artist spotlights mixed, filters sticky on desktop sidebar

**Discover Artists**: Grid layout, filter sidebar, prominent search

**Discover Opportunities**: List/grid toggle, rich filtering, sort options

**Create Opportunity/Project**: Form-focused single column, max-w-2xl, clear section breaks

**Profile View**: Cover + avatar hero, tabbed content (About, Portfolio, Stats, Reviews)

**Messages**: Split view on desktop (list + conversation), stacked on mobile

---

**Mobile-First Mandate**: All layouts stack to single column below md: breakpoint. Touch targets minimum 44px. Bottom navigation on mobile replaces top nav secondary items.