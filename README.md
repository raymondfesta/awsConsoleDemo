# CloudScape React Application

A production-ready React application built with AWS CloudScape Design System, featuring modern state management, routing, and a complete demo implementation.

## Features

- ✅ **CloudScape Design System** - Complete UI built with AWS CloudScape components
- ✅ **React 18** - Modern React with functional components and hooks
- ✅ **TypeScript** - Full type safety throughout the application
- ✅ **Zustand** - Lightweight state management
- ✅ **React Router** - Client-side routing with 3 pages
- ✅ **Theme Support** - Light and dark mode toggle
- ✅ **CRUD Operations** - Full product management with demo data
- ✅ **Responsive Design** - CloudScape's built-in responsive grid system
- ✅ **Notifications** - Flashbar for user feedback
- ✅ **Data Tables** - Sorting, filtering, and pagination
- ✅ **Forms & Modals** - Complete form handling with validation

## Tech Stack

- **Framework**: React 18 + Vite
- **UI Library**: AWS CloudScape Design System
- **Language**: TypeScript
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: CloudScape Global Styles (no custom CSS needed)

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navigation.tsx
│   ├── ProductTable.tsx
│   └── ProductModal.tsx
├── pages/           # Page-level components
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   └── Settings.tsx
├── context/         # Zustand store
│   └── AppContext.tsx
├── data/            # Mock data
│   └── mockData.ts
├── types/           # TypeScript definitions
│   └── index.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Navigate to project directory
cd cloudscape-app

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:5173`

## CloudScape Integration

### Global Styles
CloudScape global styles are imported in `App.tsx`:
```typescript
import '@cloudscape-design/global-styles/index.css';
```

### Theme Support
Toggle between light and dark modes in Settings page. The theme is managed via Zustand store and applied using CloudScape's `awsui-dark-mode` class.

### Key Components Used

- **AppLayout** - Main application shell with navigation and content areas
- **TopNavigation** - Top navigation bar with branding
- **SideNavigation** - Left sidebar navigation
- **Table** - Data tables with filtering, sorting, and pagination
- **Modal** - Dialogs for forms
- **Container** - Content grouping with headers
- **Form Components** - Input, Select, Toggle, FormField
- **Flashbar** - Toast notifications
- **Button, Header, Box, SpaceBetween** - Layout and UI primitives

## Features Overview

### Dashboard
- Statistics cards showing product metrics
- Overview container with key information
- Loading states with CloudScape Spinner

### Products Page
- Full CRUD operations (Create, Read, Update, Delete)
- Data table with:
  - Multi-select rows
  - Text filtering
  - Pagination (5 items per page)
  - Sortable columns
- Modal form for adding/editing products
- Success notifications via Flashbar

### Settings Page
- Theme toggle (Light/Dark mode)
- Application information
- CloudScape Toggle component

## Demo Data

The application comes pre-populated with 8 AWS service products including:
- AWS Lambda Function
- Amazon S3 Bucket
- Amazon EC2 Instance
- Amazon RDS Database
- And more...

All data is stored in `src/data/mockData.ts` and managed via Zustand store.

## State Management

Using Zustand for global state:
- Products management (add, update, delete)
- Notifications queue
- Theme preference
- Loading states

## Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

## CloudScape Resources

- [Documentation](https://cloudscape.design/)
- [Component Gallery](https://cloudscape.design/components/)
- [GitHub Repository](https://github.com/cloudscape-design/components)
- [Design Guidelines](https://cloudscape.design/foundation/visual-foundation/)

## Browser Support

CloudScape supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
