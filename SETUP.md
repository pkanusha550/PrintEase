# PrintEase Frontend Setup Guide

## Quick Start

1. **Navigate to the frontend directory:**
   ```bash
   cd PrintEase/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   The app will automatically open at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Sticky navbar with responsive collapse
│   │   ├── Button.jsx       # Button component with variants
│   │   ├── Card.jsx         # Card component
│   │   ├── Input.jsx        # Input with validation
│   │   ├── Toast.jsx        # Toast notifications
│   │   ├── Spinner.jsx      # Loading spinner
│   │   ├── Chatbot.jsx      # Chatbot component
│   │   └── Layout.jsx      # Main layout wrapper
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page
│   │   ├── Login.jsx        # Login page with validation
│   │   ├── Order.jsx        # Order wizard (4 steps)
│   │   ├── MyOrders.jsx     # Orders list with filters
│   │   └── NotFound.jsx    # 404 page
│   ├── hooks/               # Custom hooks
│   │   └── useToast.js     # Toast notification hook
│   ├── data/                # Sample data
│   │   └── dealers.js      # Dealer data
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles (Tailwind)
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.js           # Vite configuration
└── README.md                # Project documentation
```

## Features Implemented

### ✅ UI Elements
- [x] Sticky navbar with responsive collapse
- [x] Toast notifications for actions
- [x] Loading spinners for uploads/payments
- [x] Form validation with inline errors
- [x] Responsive grid/card layouts
- [x] Micro-interactions (hover, focus, transitions)
- [x] Accessibility (labels, keyboard focus, contrast)

### ✅ Design System
- [x] Brand: PrintEase
- [x] Primary color: Soft Pink (#FF69B4)
- [x] Typography: Poppins / Inter / Roboto
- [x] Rounded buttons with clear hierarchy
- [x] Cards with soft shadows and padding
- [x] Material/simple line icons (Lucide React)
- [x] Smooth transitions between steps
- [x] Fully responsive (Desktop, Tablet, Mobile)

### ✅ Pages
- [x] Landing page with hero section
- [x] Login page with form validation
- [x] New Order wizard (4 steps):
  - Step 1: File upload
  - Step 2: Customization (paper, binding, finishing)
  - Step 3: Dealer selection
  - Step 4: Order review
- [x] My Orders page with filters
- [x] Chatbot component

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Dependencies

### Production
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `lucide-react` - Icons

### Development
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `tailwindcss` - Utility-first CSS framework
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All components use Tailwind CSS for styling
- Toast notifications are managed via a custom hook
- Form validation includes real-time feedback
- All interactive elements have proper accessibility attributes
- The chatbot is a floating component accessible from any page
- The order wizard includes comprehensive binding options

## Troubleshooting

If you encounter issues:

1. **Dependencies not installing:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

2. **Styles not loading:**
   - Ensure Tailwind is properly configured
   - Check that `index.css` is imported in `main.jsx`

3. **Routes not working:**
   - Ensure you're using React Router v7
   - Check that all routes are defined in `App.jsx`

