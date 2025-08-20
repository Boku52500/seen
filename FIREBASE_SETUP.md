# Firebase Setup Instructions

This guide will help you set up Firebase Firestore for your dynamic product management system.

## Prerequisites

- Node.js installed on your machine
- A Google account for Firebase

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "my-shop-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now (you can configure security rules later)
4. Select a location for your database (choose one close to your users)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In your Firebase project console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to add a web app
5. Enter an app nickname (e.g., "my-shop-web-app")
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 4: Update Your Project Configuration

1. Open `src/firebase/config.ts` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Step 5: Install Dependencies

Run the following command in your project directory:

```bash
npm install firebase
```

## Step 6: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:5173/admin` to access the admin panel
3. Try adding a new product to test the Firebase connection
4. Check your Firestore console to see if the data is being saved

## Step 7: Configure Security Rules (Important!)

For production, you should configure proper security rules. In your Firestore console:

1. Go to "Firestore Database" → "Rules"
2. Replace the default rules with more secure ones:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to products for all users
    match /products/{document} {
      allow read: if true;
      // Only allow write access for authenticated admin users
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Firebase not found" errors**: Make sure you've installed the firebase package with `npm install firebase`

2. **Permission denied**: Check your Firestore security rules. For development, you can temporarily use:
```javascript
allow read, write: if true;
```

3. **Network errors**: Ensure your internet connection is stable and Firebase project is properly configured

## Features Included

- **Dynamic Product Management**: Add, edit, and delete products through the admin panel
- **Real-time Updates**: Changes in the admin panel immediately reflect on the shop page
- **Advanced Filtering**: Filter products by category, color, price, and size
- **Responsive Design**: Works on desktop and mobile devices
- **Image Support**: Multiple images per product with URL-based storage

## Admin Panel Access

Navigate to `/admin` in your application to access the product management interface:
- Add new products with images, colors, sizes, and categories
- Edit existing products
- Delete products
- All changes are saved to Firebase and immediately visible on the shop page

## Shop Page Features

The shop page (`/shop`) includes:
- Dynamic product grid with real-time data from Firebase
- Category filtering (Dresses, Sets)
- Color filtering (based on available product colors)
- Size filtering (based on available product sizes)
- Price range filtering
- Grid/List view toggle
- Responsive design matching your existing styling

## Data Structure

Products are stored in Firestore with the following structure:

```typescript
{
  id: string;
  name: string;
  price: number;
  images: string[];
  colors: { name: string; value: string }[];
  sizes: string[];
  category: 'Dresses' | 'Sets';
  createdAt: Date;
  updatedAt: Date;
}
```

Your dynamic product system is now ready to use!
