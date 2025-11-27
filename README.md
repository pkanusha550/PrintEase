# PrintEase Frontend

A complete, responsive frontend for PrintEase - a print ordering platform with advanced customization options, dealer selection, and chatbot assistance.

## Features

- ✅ **Sticky Navbar** with responsive collapse
- ✅ **Toast Notifications** for user actions
- ✅ **Loading Spinners** for uploads and payments
- ✅ **Form Validation** with inline error messages
- ✅ **Responsive Grid/Card Layouts** for dealers and orders
- ✅ **Micro-interactions** (hover, focus, transitions)
- ✅ **Accessibility** (proper labels, keyboard focus, contrast)

## Design System

- **Brand**: PrintEase
- **Primary Color**: Soft Pink (#FF69B4)
- **Typography**: Poppins / Inter / Roboto
- **Components**: Rounded buttons, soft shadows, ample padding
- **Icons**: Lucide React
- **Fully Responsive**: Desktop, Tablet, Mobile

## Pages & Components

### Pages
- **Landing Page** (`/`) - Hero section, how it works, featured dealers
- **Login** (`/login`) - Form validation, password visibility toggle
- **New Order** (`/order`) - Multi-step wizard with file upload, customization, dealer selection, review
- **My Orders** (`/my-orders`) - Order tracking with filters and responsive card grid
- **Chatbot** - Floating chatbot with smooth animations

### Components
- `Navbar` - Sticky navigation with mobile menu
- `Button` - Primary, secondary, ghost variants with loading states
- `Card` - Reusable card component with hover effects
- `Input` - Form input with validation and error states
- `Toast` - Notification system with multiple types
- `Spinner` - Loading indicator
- `Chatbot` - Interactive AI assistant

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Tech Stack

- **React 19** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── data/           # Sample data
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Features in Detail

### Order Wizard
- Step 1: File upload with drag & drop
- Step 2: Customization (paper, binding, finishing)
- Step 3: Dealer selection with filters
- Step 4: Order review and confirmation

### Binding Options
- Spiral Binding
- Wiro Binding
- Stapled
- Perfect Bound
- Hardcover Binding
- Saddle Stitch

### Form Validation
- Real-time validation
- Inline error messages
- Accessible error states
- Required field indicators

### Toast Notifications
- Success, Error, Info, Warning types
- Auto-dismiss with configurable duration
- Smooth slide-in animations
- Accessible with ARIA labels

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

