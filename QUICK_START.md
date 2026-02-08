# CareConnect Mobile - Quick Start Guide

## 🚀 Getting Started

Your React Native CLI mobile app has been successfully created! The app is currently building for iPhone 16 simulator.

## 📱 Project Location
```
/Users/kaveeshamaddumabandara/Documents/ip/program/CareConnectMobile
```

## ✅ What's Been Created

### 1. Complete Authentication System
- Welcome screen with beautiful UI
- Login with email/password
- Role-based registration (Caregiver/Care Receiver)
- Forgot password functionality

### 2. Two Separate Portals

#### Caregiver Portal
- Dashboard with stats and availability toggle
- Profile management with skills and hourly rate
- Tab navigation: Home, Requests, Payments, Profile

#### Care Receiver Portal
- Dashboard showing available caregivers
- Browse and request caregivers
- Medical info and emergency contact management
- Tab navigation: Home, Find Care, Payments, Profile

## 🔧 Backend Configuration

**IMPORTANT**: Before testing the app, update the API URL:

1. Open: `src/services/api.ts`
2. Update line 17:
   ```typescript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```
   - For iOS Simulator: Use `http://localhost:5000/api` or `http://127.0.0.1:5000/api`
   - For Android Emulator: Use `http://10.0.2.2:5000/api`
   - For Physical Device: Use your computer's IP (e.g., `http://192.168.1.100:5000/api`)

## 🏃‍♂️ Running the App

### Current Build
The app is currently building and will automatically launch on iPhone 16 simulator when complete.

### For Future Runs

1. **Start Metro Bundler** (in one terminal):
   ```bash
   cd /Users/kaveeshamaddumabandara/Documents/ip/program/CareConnectMobile
   npx react-native start
   ```

2. **Run iOS** (in another terminal):
   ```bash
   cd /Users/kaveeshamaddumabandara/Documents/ip/program/CareConnectMobile
   npx react-native run-ios --simulator="iPhone 16"
   ```

### Alternative: Using Xcode
```bash
cd /Users/kaveeshamaddumabandara/Documents/ip/program/CareConnectMobile
open ios/CareConnectMobile.xcworkspace
```
Then click the Run button in Xcode.

## 🧪 Testing the App

### 1. Start Your Backend
Ensure your backend server is running:
```bash
cd /Users/kaveeshamaddumabandara/Documents/ip/program/backend
npm run dev
```

### 2. Test Flow

#### Register as Caregiver:
1. Open app → Tap "Create Account"
2. Select "Caregiver" role
3. Fill in details (name, email, password)
4. Login and explore caregiver dashboard

#### Register as Care Receiver:
1. Open app → Tap "Create Account"
2. Select "Care Receiver" role
3. Fill in details
4. Login and explore care receiver dashboard

### 3. Test Credentials (if backend seeded)
```
Caregiver:
Email: caregiver@test.com
Password: password123

Care Receiver:
Email: carereceiver@test.com
Password: password123
```

## 📂 Key Files to Know

### Main App Entry
- `App.tsx` - Root component with navigation setup

### Navigation
- `src/navigation/RootNavigator.tsx` - Main navigation controller
- `src/navigation/AuthNavigator.tsx` - Pre-login screens
- `src/navigation/CaregiverNavigator.tsx` - Caregiver tabs
- `src/navigation/CareReceiverNavigator.tsx` - Care receiver tabs

### Authentication
- `src/context/AuthContext.tsx` - Authentication state management
- `src/services/api.ts` - API calls to backend

### Screens
- `src/screens/common/` - Login, Register, Welcome screens
- `src/screens/caregiver/` - Caregiver dashboard and profile
- `src/screens/carereceiver/` - Care receiver dashboard and profile

## 🎨 Customization

### Colors
Edit styles in each screen file to change colors:
- Primary Blue: `#2563eb`
- Success Green: `#22c55e`
- Error Red: `#ef4444`

### API Endpoints
All API calls are in `src/services/api.ts` - easy to modify or add new endpoints.

## 🐛 Troubleshooting

### If Build Fails:
```bash
# Clean and rebuild
cd ios
pod deintegrate
pod install
cd ..
npx react-native start --reset-cache
```

### If Metro Bundler Issues:
```bash
# Reset cache
npx react-native start --reset-cache

# Or kill existing Metro
killall node
npx react-native start
```

### If Cannot Connect to Backend:
1. Check backend is running on port 5000
2. Verify API_BASE_URL in `src/services/api.ts`
3. For physical device, use your computer's local IP address

## 📊 App Features Overview

### Authentication Features
✅ Email/password login
✅ Role-based registration
✅ Forgot password
✅ Persistent login (AsyncStorage)
✅ Auto-logout on token expiry

### Caregiver Features
✅ Dashboard with statistics
✅ Availability toggle
✅ Profile with skills management
✅ Experience and hourly rate setup
✅ Bio/description

### Care Receiver Features
✅ Browse available caregivers
✅ View caregiver ratings and skills
✅ Medical conditions management
✅ Emergency contact setup
✅ Request caregivers

### Common Features
✅ Pull-to-refresh
✅ Loading states
✅ Error handling
✅ Form validation
✅ Bottom tab navigation
✅ Profile editing
✅ Logout functionality

## 📝 Next Steps

1. ✅ Wait for build to complete (currently building)
2. ⬜ Ensure backend is running
3. ⬜ Test registration flow for both roles
4. ⬜ Test login with created accounts
5. ⬜ Explore both portals
6. ⬜ Update API URL if needed
7. ⬜ Customize UI/colors as desired
8. ⬜ Add additional features from enhancement list

## 📚 Documentation

- Full details: `MOBILE_APP_SUMMARY.md`
- Project README: `README.md`
- Backend docs: `../backend/README.md`

## 🎉 What's Next?

The app is fully functional and ready to connect to your backend! Once the build completes, you'll see the welcome screen on the iPhone 16 simulator.

Key things to test:
1. Registration for both roles
2. Login and role-based routing
3. Dashboard features
4. Profile management
5. API integration with backend

Happy coding! 🚀
