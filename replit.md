# Buffet Juniors Kids - Sistema de Gestão

## Overview

This is a comprehensive full-stack financial management system for Buffet Juniors Kids, designed specifically for children's party venues. The application provides advanced tools for managing clients, events, payments, expenses, inventory, and documents while offering real-time business insights through interactive dashboards. Built for Brazilian buffet businesses, it handles everything from event scheduling and guest management to complete financial control including expense tracking, cash flow management, profitability analysis, and inventory control.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety and component-based development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable interfaces
- **Styling**: Tailwind CSS with CSS variables for theming, supporting both light and dark modes
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Context-based auth system with protected routes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Passport.js with local strategy and express-session for user management
- **File Uploads**: Multer middleware for handling document and image uploads
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

### Database Design
- **Users**: Admin authentication and role management
- **Clients**: Customer information and contact details
- **Events**: Party bookings with child details, guest counts, and scheduling
- **Payments**: Transaction tracking with multiple payment methods
- **Documents**: File attachments related to events and clients
- **Relationships**: Proper foreign key relationships linking events to clients and payments to events

### Development Environment
- **Development Server**: Vite dev server with HMR and Express API integration
- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines
- **Type Safety**: Shared TypeScript schemas between client and server using Drizzle-Zod

### Key Features
- **Dashboard**: Real-time statistics, upcoming events, and recent payments overview
- **Event Management**: Complete party scheduling with guest counts and pricing
- **Client Management**: Customer database with contact information and event history
- **Payment Tracking**: Multiple payment methods with status tracking and reporting
- **Document Management**: File upload and storage for contracts and event materials
- **Responsive Design**: Mobile-first approach with sidebar navigation and adaptive layouts

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: TypeScript ORM for database operations and migrations
- **@tanstack/react-query**: Server state management and data fetching
- **express**: Web application framework for API endpoints
- **passport**: Authentication middleware with local strategy support

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography
- **class-variance-authority**: Utility for creating variant-based component APIs

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and schema management tool
- **esbuild**: Server-side bundling for production builds

### Session and Security
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store
- **multer**: File upload handling middleware

### Date and Validation
- **date-fns**: Date utility library with internationalization
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Form state management and validation