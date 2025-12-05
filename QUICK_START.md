# 🚀 Quick Start Guide - PrintEase Frontend

## Step 1: Install Dependencies

Open PowerShell or Command Prompt in the `frontend` folder and run:

```bash
npm install
```

This will install:
- React 19
- React Router
- Tailwind CSS
- Lucide React icons
- Vite build tool
- All other dependencies

**Expected time:** 1-2 minutes

---

## Step 2: Start Development Server

After installation completes, run:

```bash
npm run dev
```

**What happens:**
- Vite will start the development server
- The app will automatically open in your browser at `http://localhost:5173`
- You'll see hot-reload enabled (changes auto-refresh)

**Expected output:**
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 3: Explore the App

### Available Pages:

1. **Home Page** (`/`)
   - Hero section with file upload
   - How it works section
   - Featured dealers carousel
   - Chatbot CTA

2. **Login** (`/login`)
   - Form with validation
   - Try submitting empty form to see errors
   - Password visibility toggle

3. **New Order** (`/order`)
   - 4-step wizard
   - Upload file → Customize → Select dealer → Review
   - Try the binding options!

4. **My Orders** (`/my-orders`)
   - View sample orders
   - Filter by status
   - Responsive card layout

5. **Chatbot**
   - Click the floating button (bottom-right)
   - Try asking questions

---

## Step 4: Test Features

### ✅ Test Toast Notifications:
- Upload a file on Home page → See success toast
- Submit login form → See success/error toast
- Place an order → See confirmation toast

### ✅ Test Form Validation:
- Go to Login page
- Try submitting empty form
- See inline error messages

### ✅ Test Responsive Design:
- Resize browser window
- Open on mobile device
- Check mobile menu (hamburger icon)

### ✅ Test Micro-interactions:
- Hover over buttons
- Hover over cards
- Click buttons (see scale effect)
- Focus on inputs (see focus ring)

---

## Troubleshooting

### Issue: `npm install` fails
**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -r node_modules
rm package-lock.json

# Install again
npm install
```

### Issue: Port 5173 already in use
**Solution:**
```bash
# Vite will automatically use next available port
# Or specify a different port:
npm run dev -- --port 3000
```

### Issue: Styles not loading
**Solution:**
- Make sure `index.css` exists in `src/`
- Check that Tailwind is imported in `index.css`
- Restart the dev server

### Issue: Routes not working
**Solution:**
- Make sure you're using React Router v7
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

---

## Build for Production

When ready to deploy:

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

Preview the production build:
```bash
npm run preview
```

---

## What's Next?

1. **Connect to Backend:**
   - Replace sample data with API calls
   - Add authentication
   - Connect order submission

2. **Customize:**
   - Adjust colors in `tailwind.config.js`
   - Modify components in `src/components/`
   - Add new pages in `src/pages/`

3. **Deploy:**
   - Build the project
   - Deploy to Vercel, Netlify, or your preferred hosting

---

## Need Help?

- Check `README.md` for detailed documentation
- Check `FEATURES.md` for complete feature list
- Check `SETUP.md` for detailed setup guide

---

## 🎉 You're All Set!

Your PrintEase frontend is ready to go. Start the dev server and explore!

