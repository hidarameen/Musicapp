# Overview

MusicHub is a modern Arabic-focused music streaming platform built with React, Express, and PostgreSQL. The application provides a comprehensive music experience with features for discovering, streaming, and managing music collections. It supports user authentication, artist profiles, album management, playlist creation, video content, and admin functionality for content management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Library**: shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: OpenID Connect integration with Replit Auth for secure user authentication
- **Session Management**: Express sessions stored in PostgreSQL with connect-pg-simple
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Build System**: ESBuild for server bundling and production builds

## Data Storage
- **Primary Database**: PostgreSQL hosted on Neon Database (serverless)
- **ORM**: Drizzle ORM with Zod schema validation for type safety
- **Session Storage**: PostgreSQL sessions table for persistent user sessions
- **Schema Design**: 
  - Users table for authentication and profile data
  - Artists, Albums, Songs, Videos for content management
  - Playlists and PlaylistSongs for user-created collections
  - UserFavorites for user preferences

## Authentication & Authorization
- **Provider**: OpenID Connect with Replit's authentication system
- **Session Management**: Server-side sessions with PostgreSQL storage
- **Authorization**: Role-based access control with admin privileges
- **Security**: HTTPS-only cookies, CSRF protection, and secure session handling

# External Dependencies

- **Database**: Neon Database (PostgreSQL serverless) via `@neondatabase/serverless`
- **Authentication**: Replit OpenID Connect for user authentication
- **UI Components**: Radix UI primitives for accessible component foundations
- **Font Service**: Google Fonts for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development Tools**: 
  - Replit-specific plugins for development environment integration
  - Vite runtime error overlay for debugging
  - TypeScript for type safety across the full stack
- **Build & Deployment**: Replit platform with automatic deployment and environment management