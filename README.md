# UniShare Web Application

A modern React-based web application for the UniShare marketplace, enabling Principia College students to buy, sell, and trade items within their campus community.

## 🚀 Features

- **Modern React Stack**: React 18 + TypeScript + Vite for optimal performance
- **Material-UI Components**: Beautiful, responsive UI with consistent design system
- **Real-time Messaging**: SignalR integration for instant buyer-seller communication
- **Image Management**: Upload and display multiple images per item with optimization
- **Responsive Design**: Mobile-first design that works on all device sizes
- **Advanced Search**: Filter by category, condition, price range, and text search
- **User Authentication**: Secure JWT-based authentication with @principia.edu validation
- **State Management**: Redux Toolkit for predictable state management
- **Type Safety**: Full TypeScript integration with strict typing

---

## 📋 Prerequisites

- **Node.js** 18.0 or later
- **npm** 9.0 or later (or **yarn** 1.22+)
- **Git** for version control
- **Backend API** running (see backend README for setup)

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/c-luhanga/Project-Software_Dev_Client.git
cd Project-Software_Dev_Client/unishare-web
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5100/api
VITE_API_BASE_URL_SIGNALR=http://localhost:5100

# Upload Configuration
VITE_MAX_FILE_SIZE_MB=5
VITE_MAX_IMAGES_PER_ITEM=4

# Environment
VITE_ENVIRONMENT=development

# Optional: Enable debug logging
VITE_DEBUG_API=true
```

### 4. Backend API Connection

Ensure the backend API is running before starting the frontend:

```bash
# The frontend expects the API to be available at:
# HTTP:  http://localhost:5100/api
# HTTPS: https://localhost:5101/api
# SignalR Hub: http://localhost:5100/messageHub
```

### 5. Start Development Server
```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will start at:
- **HTTP**: `http://localhost:5173`
- **Alternative**: `http://localhost:5174` (if 5173 is in use)

---

## 🏗️ Build and Deployment

### Development Build
```bash
# Start development server with hot reload
npm run dev

# Check TypeScript errors
npm run type-check

# Run linting
npm run lint

# Fix auto-fixable linting issues
npm run lint:fix
```

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Check build size analysis
npm run build -- --mode analyze
```

### Build Output
- Build files are generated in `dist/` directory
- Static assets are optimized and minified
- Source maps are included for debugging

---

## 🔧 Configuration

### API Configuration (`src/infrastructure/api/apiClient.ts`)
```typescript
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5100/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### SignalR Configuration (`src/infrastructure/signalr/signalRService.ts`)
```typescript
const SIGNALR_CONFIG = {
  hubUrl: `${import.meta.env.VITE_API_BASE_URL_SIGNALR}/messageHub`,
  automaticReconnect: true,
  reconnectIntervals: [0, 2000, 10000, 30000],
};
```

### File Upload Configuration
```typescript
const UPLOAD_CONFIG = {
  maxFileSizeMB: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 5,
  maxImagesPerItem: Number(import.meta.env.VITE_MAX_IMAGES_PER_ITEM) || 4,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
};
```

---

## 🏛️ Project Structure

```
src/
├── components/              # Reusable React components
│   ├── common/             # Generic UI components
│   ├── forms/              # Form-specific components
│   ├── items/              # Item-related components
│   ├── messaging/          # Chat and messaging components
│   └── layout/             # Layout and navigation components
│
├── pages/                  # Page components (route components)
│   ├── auth/              # Authentication pages
│   ├── items/             # Item-related pages
│   ├── profile/           # User profile pages
│   └── messaging/         # Messaging pages
│
├── infrastructure/         # External service integrations
│   ├── api/               # HTTP API client and configurations
│   ├── auth/              # Authentication service
│   ├── items/             # Items repository and API
│   ├── users/             # Users repository and API
│   ├── messaging/         # Messaging API integration
│   └── signalr/           # SignalR real-time communication
│
├── store/                 # Redux store configuration
│   ├── slices/            # Redux Toolkit slices
│   ├── middleware/        # Custom middleware
│   └── types/             # Store type definitions
│
├── domain/                # Domain models and business logic
│   ├── models/            # TypeScript interfaces and types
│   ├── enums/             # Enumerations
│   └── validators/        # Validation schemas
│
├── utils/                 # Utility functions
│   ├── formatters/        # Data formatting functions
│   ├── validators/        # Validation helpers
│   └── constants/         # Application constants
│
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hook
│   ├── useItems.ts        # Items management hook
│   └── useMessaging.ts    # Messaging hook
│
└── styles/               # Global styles and themes
    ├── theme.ts          # Material-UI theme configuration
    └── globals.css       # Global CSS styles
```

---

## 🔌 API Integration

### Authentication Flow
```typescript
// 1. Register/Login
const loginResponse = await authRepository.login({
  email: 'user@principia.edu',
  password: 'password123'
});

// 2. Store JWT token
const token = loginResponse.token;
localStorage.setItem('authToken', token);

// 3. API calls automatically include token
const items = await itemsRepository.getMyItems();
```

### Items Management
```typescript
// Create item
const newItem = await itemsRepository.create({
  title: 'Textbook',
  description: 'Math textbook in excellent condition',
  price: 50.00,
  categoryId: 1,
  conditionId: 1
});

// Upload images
await itemsRepository.uploadImages(newItem.id, imageFiles);

// Search items
const searchResults = await itemsRepository.search({
  categoryId: 1,
  maxPrice: 100,
  query: 'textbook',
  page: 1,
  pageSize: 20
});
```

### Real-time Messaging
```typescript
// Connect to SignalR hub
await signalRService.connect(token);

// Join conversation
await signalRService.joinConversation(conversationId);

// Send message
await signalRService.sendMessage({
  conversationId,
  content: 'Is this item still available?'
});

// Listen for new messages
signalRService.onMessageReceived((message) => {
  dispatch(addMessage(message));
});
```

---

## 🧪 Development & Testing

### Code Quality Tools
```bash
# TypeScript type checking
npm run type-check

# ESLint for code quality
npm run lint
npm run lint:fix

# Prettier for code formatting
npm run format

# Check all (types, lint, format)
npm run check-all
```

### Browser DevTools
- **Redux DevTools**: Inspect state changes and actions
- **React DevTools**: Component tree and props inspection
- **Network Tab**: Monitor API requests and responses
- **Console**: Application logs and error messages

### Testing API Endpoints
Use the browser's Network tab or external tools:
- **Thunder Client** (VS Code extension)
- **Postman** for API testing
- **curl** commands for quick tests

---

## 🚀 Deployment Options

### Static Hosting (Recommended)
```bash
# Build for production
npm run build

# Deploy to hosting service
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod --dir=dist
# - GitHub Pages: gh-pages -d dist
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod --dir=dist
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 Environment Variables

### Development (.env.local)
```bash
VITE_API_BASE_URL=http://localhost:5100/api
VITE_API_BASE_URL_SIGNALR=http://localhost:5100
VITE_ENVIRONMENT=development
VITE_DEBUG_API=true
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_API_BASE_URL_SIGNALR=https://your-api-domain.com
VITE_ENVIRONMENT=production
VITE_DEBUG_API=false
```

### Testing (.env.test)
```bash
VITE_API_BASE_URL=http://localhost:5100/api
VITE_API_BASE_URL_SIGNALR=http://localhost:5100
VITE_ENVIRONMENT=test
VITE_DEBUG_API=true
```

---

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   ```bash
   # Check if backend is running
   curl http://localhost:5100/api/health
   
   # Verify environment variables
   echo $VITE_API_BASE_URL
   ```

2. **CORS Errors**
   - Ensure backend CORS policy includes frontend URL
   - Check browser console for specific CORS error details

3. **Authentication Issues**
   ```typescript
   // Clear stored tokens
   localStorage.removeItem('authToken');
   
   // Check token expiration
   const token = localStorage.getItem('authToken');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token expires:', new Date(payload.exp * 1000));
   ```

4. **Image Upload Issues**
   - Check file size limits (5MB default)
   - Verify file type (JPG, PNG, GIF only)
   - Ensure backend upload endpoint is configured

5. **SignalR Connection Issues**
   ```typescript
   // Check connection status
   console.log('SignalR State:', signalRService.getConnectionState());
   
   // Manual reconnection
   await signalRService.disconnect();
   await signalRService.connect(token);
   ```

### Performance Optimization

1. **Slow Loading**
   - Enable React.StrictMode for development warnings
   - Use React DevTools Profiler to identify bottlenecks
   - Implement code splitting with React.lazy()

2. **Large Bundle Size**
   ```bash
   # Analyze bundle
   npm run build -- --mode analyze
   
   # Use dynamic imports for large dependencies
   const Component = React.lazy(() => import('./Component'));
   ```

---

## 📱 Mobile Considerations

### Responsive Design
- Mobile-first approach with Material-UI breakpoints
- Touch-friendly button sizes (minimum 44px)
- Optimized image loading and compression

### Progressive Web App (PWA)
- Service worker for offline functionality
- App manifest for "Add to Home Screen"
- Push notifications for new messages

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes with proper TypeScript types
3. Test changes locally: `npm run dev`
4. Check code quality: `npm run check-all`
5. Commit with descriptive message
6. Push and create Pull Request

### Code Style Guidelines
- Use TypeScript for all new code
- Follow Material-UI design system
- Implement proper error handling
- Add JSDoc comments for complex functions
- Use semantic commit messages

---

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Components](https://mui.com/components/)
- [Redux Toolkit Guide](https://redux-toolkit.js.org/)
- [Vite Configuration](https://vitejs.dev/config/)

### Backend Integration
- See `../Project Solution/README.md` for backend setup
- API documentation at `http://localhost:5100/swagger`
- SignalR documentation for real-time features

---

## 📄 License

MIT License - see LICENSE file for details

---

**Ready to start developing? Run `npm run dev` and visit http://localhost:5173**
