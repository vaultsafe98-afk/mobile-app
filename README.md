# 🔒 SafeVault - Secure Crypto Wallet App

A professional, secure, and user-friendly cryptocurrency wallet application built with React Native.

## ✨ Features

### 🔐 **Security First**
- **End-to-end encryption** for all sensitive data
- **Secure storage** with encrypted local database
- **Biometric authentication** support
- **Account lockout** protection against brute force attacks

### 💰 **Crypto Management**
- **USDT deposits** with proof upload to AWS S3
- **Multi-platform withdrawals** (Binance, Trust Wallet)
- **Real-time balance tracking** with deposit, profit, and total
- **Automatic profit calculation** (1% daily as configured)
- **Transaction history** organized by type

### 🎨 **Professional UI/UX**
- **Dark theme** with neon green, purple, and blue accents
- **Smooth animations** throughout the app
- **Responsive design** for all screen sizes
- **Real-time notifications** with auto-dismiss
- **Loading states** and comprehensive error handling

### 🚀 **Advanced Features**
- **Redux state management** for scalable architecture
- **AWS S3 integration** for secure file storage
- **Form validation** with real-time feedback
- **TypeScript** for type safety
- **Performance optimization** with memory management
- **Comprehensive testing** with unit tests

## 📱 **Screens**

1. **Splash Screen** - Animated logo with SafeVault branding
2. **Authentication** - Login and Register with validation
3. **Profile** - User management and settings
4. **Deposit** - USDT wallet with image upload
5. **Withdraw** - Multi-platform withdrawal system
6. **Wallet** - Balance display and transaction history

## 🛠 **Tech Stack**

- **React Native** 0.81.1
- **TypeScript** for type safety
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **AWS SDK** for file storage
- **React Native Image Picker** for image handling
- **React Native Vector Icons** for icons

## 🚀 **Getting Started**

### Prerequisites
- Node.js (>= 20)
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SafeVault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## ⚙️ **Configuration**

### AWS S3 Setup
1. Create an AWS S3 bucket
2. Update `src/config/aws.ts` with your credentials
3. Configure IAM permissions for S3 access

### Environment Variables
Create a `.env` file with:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
```

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 **Build**

### iOS
```bash
# Development build
npm run ios

# Production build
cd ios && xcodebuild -workspace SafeVault.xcworkspace -scheme SafeVault -configuration Release
```

### Android
```bash
# Development build
npm run android

# Production build
cd android && ./gradlew assembleRelease
```

## 🔒 **Security Features**

- **Data Encryption**: All sensitive data is encrypted using AES-256
- **Secure Storage**: Uses encrypted AsyncStorage for local data
- **Input Validation**: Comprehensive validation and sanitization
- **API Security**: Secure headers and request validation
- **Account Protection**: Login attempt limiting and lockout

## 📊 **Performance**

- **Memory Management**: Automatic garbage collection
- **Image Optimization**: Lazy loading and caching
- **Network Optimization**: Request caching and batching
- **Bundle Optimization**: Code splitting and lazy loading

## 🎯 **Architecture**

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens
├── navigation/         # Navigation configuration
├── store/             # Redux store and slices
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── services/          # External service integrations
├── theme/             # Design system and theming
└── __tests__/         # Test files
```

## 📝 **License**

This project is licensed under the MIT License.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 **Support**

For support and questions, please contact the development team.

---

**SafeVault** - Your secure gateway to the crypto world 🔒✨