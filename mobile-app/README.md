# SharonCraft Mobile App

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- React Native development environment

### Installation
```bash
cd mobile-app
npm install
```

### Running the App
```bash
# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
```

## 📱 Features Implemented

### ✅ Core Features
- **🏠 Home Screen**: Featured products, categories, hero section
- **🛍️ Shop Screen**: Product browsing, search, filtering
- **📦 Product Screen**: Product details, image gallery, add to cart
- **🛒 Cart Screen**: Shopping cart management, checkout
- **👤 Login Screen**: User authentication
- **👤 Profile Screen**: User account management

### 🔧 Technical Stack
- **React Native** with Expo
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **Expo Linear Gradient** for beautiful UI
- **Async Storage** for data persistence

### 🎨 Design System
- **Brand Colors**: Coral (#ff6f61), Teal (#1abc9c), Ochre (#f2c94c)
- **Typography**: Clean, modern fonts
- **Components**: Reusable ProductCard, CategoryCard
- **Responsive**: Optimized for all screen sizes

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── components/
│   │   ├── ProductCard.js
│   │   └── CategoryCard.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── ShopScreen.js
│   │   ├── ProductScreen.js
│   │   ├── CartScreen.js
│   │   ├── LoginScreen.js
│   │   └── ProfileScreen.js
│   └── store/
│       ├── store.js
│       └── slices/
│           ├── authSlice.js
│           ├── cartSlice.js
│           ├── productSlice.js
│           └── orderSlice.js
├── App.js
├── package.json
└── README.md
```

## 🔐 Authentication Flow
1. User enters email/password
2. Validation and API call
3. JWT token storage
4. Navigation to main app
5. Protected routes check authentication

## 🛒 Shopping Flow
1. Browse products by category
2. View product details and images
3. Add items to cart with quantity control
4. Review cart and total
5. Checkout with M-Pesa integration

## 📱 Platform Support
- **iOS**: iPhone and iPad
- **Android**: Phones and tablets
- **Expo Go**: Web deployment ready

## 🔧 Development Commands
```bash
npm start          # Start development server
npm run android      # Run on Android
npm run ios         # Run on iOS
npm run build:android # Build for production
npm run build:ios    # Build for production
```

## 🚀 Next Steps

### Phase 1: Core Functionality ✅
- [x] Basic navigation
- [x] Product browsing
- [x] Shopping cart
- [x] User authentication

### Phase 2: Integration (Next)
- [ ] Supabase backend connection
- [ ] M-Pesa payment integration
- [ ] Real product data sync
- [ ] Push notifications

### Phase 3: Advanced Features (Future)
- [ ] Order tracking
- [ ] Wishlist functionality
- [ ] Product reviews
- [ ] Offline mode
- [ ] Admin panel

## 🐛 Known Issues

### JSX Linting
- ProductScreen.js has JSX syntax errors in original version
- Fixed version available as `ProductScreen-fixed.js`
- Replace original file with fixed version

### Mock Data
- All screens currently use mock data
- Replace with Supabase API calls in Phase 2

## 📞 Support

For development questions or issues:
- Check existing component structure
- Follow React Native best practices
- Test on both iOS and Android
- Use Expo documentation for reference

---

Built with ❤️ for SharonCraft Kenya
