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
- **Add to Cart** - Add products with quantity selection from both list and modal views
- **Cart Management** - View, update quantities, and remove items
- **Real-time Updates** - Instant API synchronization for all cart operations
- **Quantity Picker** - Smooth quantity adjustment with min/max validation
- **Visual Feedback** - Loading states and success indicators

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
- **Custom Hooks** - Modular API integration with dedicated hooks:
  - `useLogin` / `useRegister` - Authentication
  - `useProducts` / `useCategories` - Product data
  - `useCart` / `useAddToCart` / `useUpdateCart` / `useRemoveFromCart` - Cart management
  - `useMakeOrder` - Order processing
- **TypeScript** - Full type safety throughout the application
- **Component Modularity** - Well-organized component structure
- **API Integration** - RESTful API communication with error handling

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom glass morphism effects
- **Animations**: Framer Motion & Motion library
- **Icons**: React Icons (Material Design) & Tabler Icons
- **HTTP Client**: Fetch API with custom hooks
- **State Management**: React hooks and context

## 📁 Project Structure

```
src/
├── components/
│   ├── authentication/     # Login/Register components
│   ├── cart/              # Cart and CartModal components
│   ├── navbar/            # Navigation components
│   └── product/           # Product display and modal components
├── hooks/                 # Custom hooks for API integration
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
export const API_BASE_URL = "http://your-api-url:port";
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

### Cart Management
- **Real-time Synchronization**: Every quantity change or item removal immediately syncs with the backend
- **Optimistic Updates**: UI updates instantly while API calls happen in background
- **Error Handling**: Failed operations revert UI state and show appropriate messages
- **Loading States**: Visual indicators during API operations

### Order Processing
- **Multi-step Checkout**: Payment method selection → Order confirmation
- **User Address Integration**: Automatically fetches user's shipping address
- **Success Flow**: Cart clears and shows confirmation message after successful order

### Responsive Design
- **Mobile-first Approach**: Optimized for mobile devices with desktop enhancements
- **Adaptive Layouts**: Grid systems that adjust based on screen size
- **Touch-friendly Interface**: Appropriate button sizes and gesture support

## 🚧 Future Enhancements

- Order history and tracking
- Product search functionality
- Wishlist/favorites
- User profile management
- Product reviews and ratings
- Advanced filtering and sorting options

## 📝 License

This project is part of an e-biznes course assignment.

---

**Backend API**: [go-ecommerce-api](https://github.com/AdrianDajakaj/go-ecommerce-api.git)
