# Customer Authentication & Profile System

This guide covers the customer authentication system with profile management for your e-commerce store.

## Step 1: Enable Firebase Authentication

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project "seen-668e3"
3. In the left sidebar, click on **"Authentication"**
4. Click **"Get started"**
5. Go to the **"Sign-in method"** tab
6. Enable **"Email/Password"** provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 2: Test the Customer System

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click the **User icon** in the navbar (top right)
4. Create a customer account:
   - Click "Sign up" in the modal
   - Enter your name, email, and password
   - Click "Create Account"

## Step 3: Verify Customer Registration

1. Go back to Firebase Console → Authentication → Users tab
2. You should see your newly registered customer
3. The customer will have the email and display name provided

## Customer Features

### 🛍️ **Customer Authentication**
- **Registration**: Create customer accounts with email/password
- **Login**: Sign in with existing credentials  
- **Logout**: Sign out functionality
- **Profile Management**: Complete customer profile system

### 👤 **Customer Profile System**
- **Personal Information**: Edit name, phone, date of birth
- **Address Management**: Add, edit, delete shipping/billing addresses
- **Order History**: View past orders and tracking information
- **Account Settings**: Manage account preferences

### 🎨 **UI Features**
- **Modal-based Auth**: Clean login/register modal
- **Navbar Integration**: User icon shows login state
- **Customer Menu**: Dropdown with "My Account" and "Sign Out"
- **Profile Dashboard**: Tabbed interface for profile, addresses, orders
- **Responsive Design**: Works on desktop and mobile

### 🛡️ **Security Features**
- **Customer-only Access**: Profile pages require authentication
- **Form Validation**: Password length, email format validation
- **Error Handling**: Clear error messages for auth failures
- **Session Management**: Automatic auth state persistence

## Customer User Flow

### **When Not Logged In:**
- User icon in navbar opens login/register modal
- Profile pages show "Please Sign In" message

### **When Logged In:**
- User icon shows customer name/email
- Clicking user icon opens dropdown menu with:
  - "My Account" link
  - "Sign Out" button
- Full access to customer profile system

### **Customer Journey:**
1. **Registration**: Click user icon → "Sign up" → create account
2. **Login**: Click user icon → enter credentials → sign in
3. **Profile Setup**: Go to "My Account" → complete profile information
4. **Address Management**: Add shipping/billing addresses
5. **Order Tracking**: View order history and status
6. **Account Management**: Update personal information

## Admin Access (Store Owner Only)

The admin panel is **NOT** accessible to regular customers. It's restricted to the store owner only.

### **To Access Admin Panel:**
1. Navigate to: `http://localhost:5173/admin?key=owner2024`
2. The admin panel will only load with the correct access key
3. **Change the access key** in `src/App.tsx` for security:
   ```typescript
   // In ProtectedAdmin component, change 'owner2024' to your own key
   if (adminKey === 'your-secret-key-here') {
   ```

### **Admin Features:**
- Add new products to the store
- Edit existing product details
- Delete products from inventory
- Real-time updates to the shop page
- Product management with images, colors, sizes, prices

## Security Rules Update (Optional)

For enhanced security, you can update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: anyone can read, authenticated users can write
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Customer profiles: only the owner can read/write their own data
    match /customers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders: only the customer can read their own orders
    match /orders/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.customerUid;
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Auth domain not configured"**: Make sure you've enabled Authentication in Firebase Console

2. **"Email already in use"**: This email is already registered - try signing in instead

3. **"Weak password"**: Password must be at least 6 characters

4. **"Invalid email"**: Check email format

5. **"User not found"**: Email not registered - try signing up first

6. **Admin access denied**: Make sure you're using the correct access key in the URL

## Testing the Complete System

### **Customer Testing:**
1. **Create Account**: Register a new customer
2. **Login**: Sign in with the account
3. **Profile Setup**: Go to "My Account" and complete profile
4. **Add Addresses**: Add shipping and billing addresses
5. **Logout**: Sign out and verify profile access is restricted

### **Admin Testing (Store Owner):**
1. **Access Admin**: Navigate to `/admin?key=owner2024`
2. **Add Products**: Test adding new products
3. **Edit Products**: Modify existing product details
4. **Delete Products**: Remove products from inventory
5. **Verify Updates**: Check that changes appear on the shop page

Your customer authentication system with profile management is now fully integrated!
