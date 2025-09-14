# Mobile App API Integration

This document describes how the React Native mobile app integrates with the Node.js Express.js backend API.

## 🚀 **What's Been Implemented**

### **1. API Service Layer (`src/services/apiService.ts`)**

- **Centralized API calls** for all backend endpoints
- **Authentication handling** with JWT tokens
- **Error handling** and response formatting
- **TypeScript interfaces** for type safety
- **Request/response interceptors**

### **2. Redux Integration**

- **Updated Redux slices** to use API calls instead of mock data
- **Async thunks** for handling API calls
- **Loading states** and error handling
- **Real-time data updates** from backend

### **3. Screen Updates**

- **LoginScreen**: Real authentication with backend
- **RegisterScreen**: User registration with backend
- **DepositScreen**: Submit deposit requests with image upload
- **WithdrawScreen**: Submit withdrawal requests
- **WalletScreen**: Display real balance and transactions
- **ProfileScreen**: Show real user data and logout

## 📱 **API Endpoints Used**

### **Authentication**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification

### **User Management**

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/profile-image` - Upload profile image

### **Wallet & Transactions**

- `GET /api/wallet` - Get wallet balance
- `GET /api/wallet/transactions` - Get all transactions
- `GET /api/wallet/transactions/deposits` - Get deposit transactions
- `GET /api/wallet/transactions/withdrawals` - Get withdrawal transactions
- `GET /api/wallet/transactions/profits` - Get profit transactions

### **Deposits**

- `POST /api/deposit/request` - Submit deposit request
- `GET /api/deposit/history` - Get deposit history

### **Withdrawals**

- `POST /api/withdraw/request` - Submit withdrawal request
- `GET /api/withdraw/history` - Get withdrawal history

### **Notifications**

- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

## 🔧 **Configuration**

### **API Base URL**

Update `src/config/api.ts` to point to your backend:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api', // Development
  // BASE_URL: 'https://your-backend-domain.com/api', // Production
};
```

### **Environment Variables**

For production, you can use environment variables:

```typescript
const API_BASE_URL =
  process.env.REACT_NATIVE_API_URL || 'http://localhost:3000/api';
```

## 🚀 **How to Test**

### **1. Start the Backend**

```bash
cd Backend
npm run dev
```

### **2. Start the Mobile App**

```bash
cd MobileApp
npm start
# or
npx react-native run-ios
npx react-native run-android
```

### **3. Test the Integration**

1. **Register a new user** in the app
2. **Login** with the credentials
3. **Check wallet balance** (should be 0 initially)
4. **Submit a deposit request** with an image
5. **Submit a withdrawal request**
6. **View transaction history**

## 📊 **Data Flow**

### **1. Authentication Flow**

```
User Input → Redux Action → API Service → Backend → Response → Redux Store → UI Update
```

### **2. Transaction Flow**

```
User Action → Redux Thunk → API Call → Backend Processing → Database Update → Response → UI Update
```

### **3. Real-time Updates**

```
Backend Cron Job → Database Update → API Response → Redux Store → UI Re-render
```

## 🔒 **Security Features**

### **JWT Authentication**

- **Automatic token storage** in AsyncStorage
- **Token verification** on app startup
- **Automatic logout** on token expiration
- **Secure API calls** with Bearer token

### **Error Handling**

- **Network error handling**
- **API error responses**
- **User-friendly error messages**
- **Retry mechanisms** for failed requests

## 📱 **Mobile App Features**

### **Real-time Data**

- **Live wallet balance** from backend
- **Transaction history** with pagination
- **Notification system** with unread counts
- **Profile management** with image upload

### **User Experience**

- **Loading states** during API calls
- **Error messages** for failed operations
- **Success feedback** for completed actions
- **Offline handling** (basic)

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. API Connection Failed**

- Check if backend is running on correct port
- Verify API_BASE_URL in config
- Check network connectivity

#### **2. Authentication Errors**

- Verify JWT secret in backend
- Check token storage in AsyncStorage
- Clear app data and re-login

#### **3. Image Upload Issues**

- Check AWS S3 configuration
- Verify image permissions
- Check file size limits

### **Debug Steps**

1. **Check console logs** for API errors
2. **Verify backend logs** for incoming requests
3. **Test API endpoints** with Postman
4. **Check Redux DevTools** for state updates

## 🚀 **Next Steps**

### **Immediate**

1. **Test all API endpoints** with the mobile app
2. **Fix any integration issues**
3. **Add proper error handling** for edge cases
4. **Test image upload** functionality

### **Future Enhancements**

1. **Push notifications** for real-time updates
2. **Offline support** with data caching
3. **Biometric authentication** for security
4. **Dark mode** support
5. **Multi-language** support

## 📝 **Notes**

- **All API calls** are now integrated with the backend
- **Mock data** has been replaced with real API calls
- **Redux state** is properly managed with async thunks
- **Error handling** is implemented throughout the app
- **TypeScript** provides type safety for all API responses

The mobile app is now fully integrated with the backend API and ready for testing! 🎉
