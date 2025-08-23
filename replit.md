# WhatsApp Bot Dashboard

## Overview

This is a full-stack web application for deploying and managing a WhatsApp AI assistant bot. The system provides a dashboard interface for configuring bot settings, monitoring activity logs, and tracking performance statistics. The bot is designed to detect promotional messages in WhatsApp groups and respond with AI-generated content using OpenRouter API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connection for live log streaming and status updates

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support for real-time features
- **File Structure**: Monorepo structure with shared schema definitions
- **Development**: Hot reload with Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless connection
- **Fallback Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **User Management**: Simple username/password authentication system
- **Security**: Basic authentication without complex role-based access control

### WhatsApp Integration
- **Library**: whatsapp-web.js for WhatsApp Web API integration
- **Authentication**: QR code scanning for WhatsApp authentication
- **Message Processing**: Real-time message monitoring and promotional content detection
- **OCR Support**: Tesseract.js for image text recognition in promotional images

### AI Integration
- **API Provider**: OpenRouter for accessing various AI models
- **Use Cases**: Promotional message detection and AI-powered response generation
- **Context Management**: Conversation history tracking with time-based context windows

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection for Neon Database
- **drizzle-orm** & **drizzle-kit**: Type-safe ORM and schema management
- **whatsapp-web.js**: WhatsApp Web API integration
- **express**: Web server framework
- **ws**: WebSocket server for real-time updates

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router
- **react-hook-form**: Form state management

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

### Third-Party Services
- **OpenRouter API**: AI model access for content generation
- **Neon Database**: Serverless PostgreSQL hosting
- **Tesseract.js**: Client-side OCR for image text extraction
- **QR Code generation**: For WhatsApp authentication

### Utility Libraries
- **qrcode**: QR code generation for WhatsApp authentication
- **node-fetch**: HTTP client for API requests
- **date-fns**: Date manipulation utilities
- **clsx** & **tailwind-merge**: CSS class name utilities