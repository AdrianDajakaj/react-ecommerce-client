# React E-Commerce App - Apple Premium Reseller

Modern, responsive e-commerce application built with React, TypeScript, and Vite, designed as a premium Apple products reseller client.

## 🚀 Features

### 🔐 Authentication System

- **User Registration** - Complete sign-up flow with form validation
- **User Login** - Secure authentication with JWT tokens
- **Session Management** - Automatic token handling and user state persistence

### 🛍️ Product Management

- **Product Catalog** - Browse products with dynamic grid layout
- **Category Filtering** - Filter products by categories (fetched from API)
- **Product Details Modal** - Detailed product view with image carousel
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### 🛒 Shopping Cart System

- **Route-based Navigation** - Dedicated cart routes for structured navigation:
  - `/cart` - Main cart view with all items
  - `/cart/product/:id` - Individual product detail view within cart context
  - `/cart/checkout` - Payment method selection and order confirmation
  - `/cart/success` - Order success confirmation page
- **Authentication Guard** - Cart routes are protected; unauthenticated users are redirected to homepage
- **Context-based State Management** - Real-time cart state synchronization across all views using React Context
- **Add to Cart** - Add products with quantity selection from both list and modal views
- **Cart Management** - View, update quantities, and remove items with instant UI feedback
- **Real-time Updates** - Instant API synchronization for all cart operations
- **Quantity Picker** - Smooth quantity adjustment with min/max validation
- **Visual Feedback** - Loading states and success indicators
- **Auto-logout Protection** - Logging out from cart automatically redirects to homepage

### 💳 Order Management

- **Payment Method Selection** - Support for multiple payment methods:
  - Credit/Debit Card
  - BLIK
  - PayPal
  - PayPo
  - Google Pay
  - Apple Pay
  - Online Transfer
- **Order Placement** - Complete checkout flow with API integration
- **Success Notifications** - User-friendly order confirmation messages
- **Cart Auto-refresh** - Cart automatically clears after successful order

### 🎨 UI/UX Features

- **Modern Glass Morphism Design** - Beautiful frosted glass effects
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Dark/Light Mode Support** - Responsive theme switching
- **3D Card Effects** - Interactive product cards with hover animations
- **Modal System** - Smooth modal transitions for product details and cart
- **Responsive Navigation** - Adaptive navbar with mobile-friendly design

### 🏗️ Technical Architecture

- **Route-based Cart System** - Dedicated cart routing with React Router for structured navigation
- **Authentication Guards** - Protected routes that ensure cart access only for authenticated users
- **Context-driven State** - Cart state managed through React Context for real-time synchronization
- **Custom Hooks** - Modular API integration with dedicated hooks:
  - `useLogin` / `useRegister` - Authentication
  - `useProducts` / `useCategories` - Product data
  - `useCart` / `useAddToCart` / `useUpdateCart` / `useRemoveFromCart` - Cart management
  - `useMakeOrder` - Order processing
  - `useCartContext` - Cart state management and synchronization
- **TypeScript** - Full type safety throughout the application
- **Component Modularity** - Well-organized component structure with route-based organization
- **API Integration** - RESTful API communication with error handling and optimistic updates

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router with protected routes and authentication guards
- **Styling**: Tailwind CSS with custom glass morphism effects
- **Animations**: Framer Motion & Motion library
- **Icons**: React Icons (Material Design) & Tabler Icons
- **HTTP Client**: Fetch API with custom hooks
- **State Management**: React hooks and Context API

## 🚦 Routing System

The application uses React Router for client-side navigation with protected routes and authentication guards.

### Available Routes

#### Public Routes

- `/` - Homepage with product catalog and authentication
- `/login` - User login (redirect if already authenticated)
- `/register` - User registration (redirect if already authenticated)

#### Protected Cart Routes (Requires Authentication)

- `/cart` - Main cart view displaying all cart items
- `/cart/product/:id` - Individual product detail view within cart context
- `/cart/checkout` - Payment method selection and order confirmation
- `/cart/success` - Order success confirmation page

### Authentication Protection

- **AuthGuard Component**: Automatically protects all `/cart/*` routes
- **Automatic Redirects**: Unauthenticated users attempting to access cart routes are redirected to `/`
- **Logout Protection**: Users logging out from any cart route are automatically redirected to homepage
- **Session Validation**: Routes check for valid JWT token in sessionStorage

### Navigation Features

- **Deep Linking**: All cart routes support direct URL access (with authentication check)
- **Browser History**: Full support for browser back/forward navigation
- **Route State Persistence**: Cart state maintained when navigating between cart routes
- **Clean URLs**: Semantic URL structure for better user experience and SEO

## 📁 Project Structure

```
src/
├── components/
│   ├── authentication/     # Login/Register components
│   ├── cart/              # Cart, CartModal, and CartRoutes components
│   ├── navbar/            # Navigation components
│   └── product/           # Product display and modal components
├── contexts/              # React Context providers (CartContext)
├── hooks/                 # Custom hooks for API integration and state management
├── routes/               # Route components and navigation logic
├── lib/                   # Utility functions
├── assets/               # Static assets
└── config.ts            # API configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Running instance of [go-ecommerce-api](https://github.com/AdrianDajakaj/go-ecommerce-api.git)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd react-ecommerce-app
```

2. Install dependencies:

```bash
npm install
```

3. Configure API endpoint in `src/config.ts`:

```typescript
export const API_BASE_URL = 'http://your-api-url:port';
```

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## 🔌 API Integration

This application integrates with a Go-based e-commerce API that provides:

### Authentication Endpoints

- `POST /users/register` - User registration
- `POST /users/login` - User authentication
- `GET /users/{id}` - User profile data

### Product Endpoints

- `GET /products` - List all products
- `GET /products/{id}` - Get product details
- `GET /categories` - List all categories

### Cart Endpoints

- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/item/{id}` - Update cart item quantity
- `DELETE /cart/item/{id}` - Remove item from cart

### Order Endpoints

- `POST /orders` - Place new order

## 🎯 Key Features Implementation

### Route-based Cart Navigation

- **Structured Navigation**: Dedicated routes (`/cart`, `/cart/product/:id`, `/cart/checkout`, `/cart/success`) for clean URL structure
- **Authentication Protection**: `AuthGuard` component protects all cart routes from unauthenticated access
- **Automatic Redirects**: Unauthorized users are redirected to homepage; logout from cart also redirects to homepage
- **Context Synchronization**: Cart state maintained across all routes using React Context for seamless user experience

### Cart Management

- **Real-time Synchronization**: Every quantity change or item removal immediately syncs with the backend
- **Cross-route State Persistence**: Cart state maintained when navigating between cart routes
- **Optimistic Updates**: UI updates instantly while API calls happen in background
- **Error Handling**: Failed operations revert UI state and show appropriate messages
- **Loading States**: Visual indicators during API operations

### Order Processing

- **Multi-step Checkout**: Payment method selection → Order confirmation
- **Route-based Flow**: Each checkout step has its own route for better navigation
- **User Address Integration**: Automatically fetches user's shipping address
- **Success Flow**: Cart clears and shows confirmation message after successful order

### Responsive Design

- **Mobile-first Approach**: Optimized for mobile devices with desktop enhancements
- **Adaptive Layouts**: Grid systems that adjust based on screen size
- **Touch-friendly Interface**: Appropriate button sizes and gesture support

## 🚧 Future Enhancements

- Cart persistence across browser sessions
- Order history and tracking with dedicated routes
- Product search functionality
- Wishlist/favorites with route-based management
- User profile management with protected routes
- Product reviews and ratings
- Advanced filtering and sorting options
- Cart sharing and collaboration features

## 📝 License

This project is part of an e-biznes course assignment.

---

**Backend API**: [go-ecommerce-api](https://github.com/AdrianDajakaj/go-ecommerce-api.git)
