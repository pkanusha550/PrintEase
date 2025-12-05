# 🚀 Complete Setup Guide - PrintEase Frontend

## Prerequisites Check

✅ **Node.js**: v24.11.1 (Installed)
⚠️ **npm**: PowerShell execution policy needs to be fixed

---

## Step 1: Fix PowerShell Execution Policy (If Needed)

If you see an error about execution policy, run this in PowerShell **as Administrator**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**OR** use Command Prompt (cmd) instead of PowerShell - it doesn't have this restriction.

---

## Step 2: Navigate to Project Directory

You're already in the correct directory:
```
C:\Users\theri\PrintEase\frontend
```

If you need to navigate here again:
```bash
cd C:\Users\theri\PrintEase\frontend
```

---

## Step 3: Install Dependencies

Run this command to install all required packages:

```bash
npm install
```

**What this does:**
- Installs React 19.2.0
- Installs React Router DOM 7.9.6
- Installs Tailwind CSS 3.3.6
- Installs Lucide React icons
- Installs Vite build tool
- Installs all other dependencies

**Expected output:**
```
added 150+ packages, and audited 150+ packages in 30s
```

**Time:** 1-3 minutes depending on internet speed

**If you see errors:**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

---

## Step 4: Start Development Server

After installation completes, run:

```bash
npm run dev
```

**What happens:**
- Vite starts the development server
- Your browser automatically opens to `http://localhost:5173`
- Hot Module Replacement (HMR) is enabled - changes auto-refresh

**Expected output:**
```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**To stop the server:** Press `Ctrl + C` in the terminal

---

## Step 5: Access Your Website

Once the server starts, you can access:

- **Local URL**: http://localhost:5173
- **Network URL**: Will be shown in terminal (for access from other devices on same network)

The website will automatically open in your default browser.

---

## Available Pages to Explore

### 1. **Home Page** (`/`)
- Hero section with file upload
- "How it works" section
- Featured dealers showcase
- Chatbot call-to-action

### 2. **Login Page** (`/login`)
- Form validation
- Password visibility toggle
- Error handling

### 3. **New Order** (`/order`)
- 4-step wizard:
  1. File upload (drag & drop)
  2. Customization (paper, binding, finishing)
  3. Dealer selection with filters
  4. Order review and confirmation

### 4. **My Orders** (`/my-orders`)
- Order tracking
- Status filters
- Responsive card grid layout

### 5. **Chatbot**
- Floating button (bottom-right corner)
- Interactive AI assistant
- Available on all pages

---

## Testing Features

### ✅ Toast Notifications
- Upload a file → See success notification
- Submit login form → See success/error toast
- Complete an order → See confirmation toast

### ✅ Form Validation
- Go to `/login`
- Try submitting empty form
- See inline error messages appear

### ✅ Responsive Design
- Resize browser window
- Test on mobile device
- Check mobile menu (hamburger icon on small screens)

### ✅ Micro-interactions
- Hover over buttons (see color change)
- Hover over cards (see shadow effect)
- Click buttons (see scale animation)
- Focus on inputs (see focus ring)

---

## Available Commands

### Development
```bash
npm run dev
```
Starts development server with hot-reload

### Production Build
```bash
npm run build
```
Creates optimized production build in `dist/` folder

### Preview Production Build
```bash
npm run preview
```
Preview the production build locally

---

## Troubleshooting

### Issue: `npm install` fails
**Solution:**
```bash
# Delete node_modules and package-lock.json
rmdir /s node_modules
del package-lock.json

# Install again
npm install
```

### Issue: Port 5173 already in use
**Solution:**
- Vite will automatically use the next available port (5174, 5175, etc.)
- Or specify a different port:
```bash
npm run dev -- --port 3000
```

### Issue: Styles not loading
**Solution:**
- Make sure `src/index.css` exists
- Check that Tailwind directives are in `index.css`
- Restart the dev server
- Clear browser cache (Ctrl+Shift+R)

### Issue: Routes not working
**Solution:**
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)
- Make sure React Router is properly installed

### Issue: PowerShell execution policy error
**Solution:**
- Run PowerShell as Administrator
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- OR use Command Prompt (cmd) instead

---

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Toast.jsx
│   │   ├── Spinner.jsx
│   │   ├── Chatbot.jsx
│   │   └── Layout.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Order.jsx
│   │   ├── MyOrders.jsx
│   │   └── NotFound.jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useToast.js
│   ├── data/            # Sample data
│   │   ├── dealers.js
│   │   └── orders.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles (Tailwind)
├── index.html           # HTML template
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── node_modules/        # Installed dependencies
```

---

## Tech Stack

- **React 19** - UI library
- **React Router DOM 7** - Navigation
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icons
- **Vite 7** - Build tool and dev server

---

## Next Steps

1. **Development**: Start making changes - they'll auto-reload!
2. **Backend Integration**: Connect to your backend API
3. **Deployment**: Build and deploy to Vercel, Netlify, or your hosting

---

## Quick Reference

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎉 You're Ready!

Your PrintEase frontend is now running. Open http://localhost:5173 in your browser and start exploring!

**Need help?** Check:
- `README.md` - Full documentation
- `FEATURES.md` - Complete feature list
- `QUICK_START.md` - Quick reference guide

