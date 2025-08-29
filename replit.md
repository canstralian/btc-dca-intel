# DCAlytics - Cryptocurrency Dashboard & DCA Simulation Tool

## Overview

DCAlytics is a comprehensive cryptocurrency investment platform focused on Dollar-Cost Averaging (DCA) strategies and risk-managed trading. The application provides real-time market data, portfolio analytics, strategy simulation, and automated DCA execution for Bitcoin investments. It combines modern web technologies with sophisticated financial analysis tools to help investors implement disciplined investment strategies while managing risk through various hedging mechanisms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React with TypeScript and modern tooling:
- **UI Framework**: React 18 with TypeScript, using Vite for development and building
- **Styling**: Tailwind CSS with a custom dark theme and design system based on shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Component Library**: Comprehensive set of Radix UI primitives with custom styling
- **Charts**: Recharts for financial data visualization and analytics
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
The server follows a RESTful API design with Express.js:
- **Runtime**: Node.js with TypeScript using ESM modules
- **Web Framework**: Express.js with custom middleware for logging and error handling
- **API Design**: RESTful endpoints with proper HTTP status codes and JSON responses
- **Data Storage**: Abstracted storage layer supporting both in-memory and database implementations
- **External APIs**: Integration with CoinGecko for real-time cryptocurrency market data

### Database Design
Uses Drizzle ORM with PostgreSQL for data persistence:
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Database**: PostgreSQL with Neon serverless database support
- **Tables**: Users, DCA strategies, transactions, portfolios, and market data
- **Data Types**: Proper decimal handling for financial calculations with appropriate precision

### Data Architecture
- **Market Data**: Real-time price feeds from CoinGecko API with caching
- **Portfolio Tracking**: Aggregated holdings, performance metrics, and transaction history
- **Strategy Engine**: DCA calculation engine with backtesting capabilities
- **Analytics**: Risk metrics, performance analytics, and Monte Carlo simulations

### Development Tooling
- **Build System**: Vite with hot module replacement and TypeScript compilation
- **Development Server**: Custom Express server with Vite middleware integration
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Styling**: PostCSS with Tailwind CSS and CSS custom properties for theming

## External Dependencies

### Third-Party APIs
- **CoinGecko API**: Real-time cryptocurrency market data, price history, and market metrics
- **Fear & Greed Index**: Market sentiment indicators for trading signals

### Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database queries and schema management

### UI Libraries
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, and form controls
- **Recharts**: Chart library for financial data visualization and analytics
- **Lucide Icons**: Modern icon library for consistent visual design

### Development Tools
- **Replit Integration**: Development environment integration with runtime error handling
- **Vite Plugins**: Hot reload, error overlay, and development tooling
- **TypeScript**: Full type safety across frontend and backend with shared schemas