# CareConnect Mobile App

React Native mobile application for caregivers and care receivers.

## Features

### Common Features
- Welcome screen with role selection
- Email/password authentication
- Role-based registration (Caregiver/Care Receiver)
- Forgot password functionality
- Profile management

### Caregiver Portal
- Dashboard with statistics
- Availability toggle
- Profile management (skills, experience, hourly rate)
- View and manage requests
- Payment tracking
- Rating and reviews

### Care Receiver Portal
- Dashboard with available caregivers
- Browse caregiver profiles
- Request caregiver services
- Manage appointments
- Payment history
- Emergency contact management

## Tech Stack
- React Native CLI
- TypeScript
- React Navigation (Native Stack & Bottom Tabs)
- Axios for API calls
- AsyncStorage for local data persistence
- React Context API for state management

## Prerequisites
- Node.js (v16 or higher)
- Xcode (for iOS development)
- CocoaPods
- React Native CLI

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install iOS dependencies:**
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the App

### iOS
```bash
npx react-native run-ios
```

Or open `ios/CareConnectMobile.xcworkspace` in Xcode and run.

To run on specific simulator:
```bash
npx react-native run-ios --simulator="iPhone 16"
```

## Backend Configuration

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

For iOS simulator use `localhost` or `127.0.0.1`

## Project Structure

```
src/
├── context/          # Authentication context
├── navigation/       # Navigation configuration
├── screens/          # All screen components
│   ├── common/      # Auth screens
│   ├── caregiver/   # Caregiver portal
│   └── carereceiver/# Care receiver portal
├── services/         # API service layer
├── types/           # TypeScript definitions
└── utils/           # Utility functions
```


## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
