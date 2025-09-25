# Architech Frontend

A modern React frontend for the Architech floor plan generation platform, built with Vite, Redux Toolkit, and TailwindCSS.

## 🚀 Features

- **Modern React 19** - Latest React features and performance
- **Redux Toolkit** - Efficient state management
- **TailwindCSS** - Utility-first styling
- **Vite** - Fast development and build
- **React Router** - Client-side routing
- **Responsive Design** - Works on all devices
- **File Upload** - Drag-and-drop file uploads
- **AI Integration** - Real-time floor plan generation

## 📋 Prerequisites

- Node.js 16+ installed
- Backend server running (see Backend README)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd "Frontend/Architech Frontend"
npm install
```

### 2. Environment Configuration

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Configure your environment:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Development settings
VITE_NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/
│   ├── FileUpload.jsx       # File upload component
│   ├── ProjectCard.jsx      # Project display card
│   └── ProjectModal.jsx     # Project creation modal
├── pages/
│   ├── Dashboard2.jsx       # Main dashboard
│   ├── Search.jsx          # File upload and search
│   └── Results.jsx         # Results display
├── store/
│   ├── store.js            # Redux store configuration
│   └── slices/
│       ├── projectsSlice.js # Project state management
│       └── analysisSlice.js # Analysis state management
├── services/
│   └── api.js              # API client configuration
├── assets/                 # Static assets
├── App.jsx                 # Main app component
└── main.jsx               # App entry point
```

## 🔄 Redux State Structure

### Projects Slice
```javascript
{
  projects: [],           // Array of user projects
  currentProject: null,   // Currently selected project
  projectTypes: [],       // Available project types
  loading: false,         // Loading state
  error: null            // Error messages
}
```

### Analysis Slice
```javascript
{
  uploadLoading: false,      // File upload loading
  uploadedFiles: [],         // Successfully uploaded files
  currentFloorPlan: null,    // Generated floor plan data
  analysisResults: null,     // Full analysis results
  floorPlanVariations: []    // Generated variations
}
```

## 🎨 Component Overview

### Dashboard (Dashboard2.jsx)
- Displays all user projects
- Project creation modal
- Real-time stats and activities
- Empty state handling

### ProjectModal (ProjectModal.jsx)
- Project creation form
- Project type selection
- Form validation
- Redux integration

### Search (Search.jsx)
- File upload interface
- Project description input
- Advanced filtering
- AI analysis trigger

### Results (Results.jsx)
- Floor plan visualization
- Design variations
- Interactive controls
- AI chat assistant

## 🔧 API Integration

The frontend communicates with the backend through:

### Projects API
- Create, read, update, delete projects
- Fetch project types
- Manage project status

### Upload API
- Upload files to Google Cloud Storage
- File type validation
- Progress tracking

### Analysis API
- Generate floor plans with Gemini AI
- Create design variations
- File analysis

## 🎯 User Flow

1. **Dashboard** - View and manage projects
2. **Create Project** - Set up new project with details
3. **Upload Files** - Add CAD files, images, documents
4. **AI Analysis** - Generate floor plans with Gemini
5. **Results** - View and interact with generated designs

## 🔒 Error Handling

- **Network Errors** - Automatic retry mechanisms
- **Validation Errors** - Form-level error display
- **Upload Errors** - File-specific error reporting
- **API Errors** - User-friendly error messages

## 🎨 Styling Guide

### Colors
- Primary Purple: `#7636D9`
- Secondary Pink: `#E16CDF`
- Brown Accent: `#694342`
- Light Brown: `#c6a480`

### Components
- Rounded corners: `rounded-lg`, `rounded-xl`
- Shadows: `shadow-sm`, `shadow-lg`
- Gradients: `from-[#7636D9] to-[#E16CDF]`
- Animations: `transition-all duration-300`

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Tablet Support** - Responsive grid layouts
- **Desktop** - Full-featured interface
- **Touch Friendly** - Large touch targets

## 🐛 Troubleshooting

### Development Server Issues
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm run dev
```

### API Connection Issues
- Check backend server is running on port 5000
- Verify `VITE_API_BASE_URL` in `.env`
- Check CORS configuration

### Redux State Issues
- Install Redux DevTools Extension
- Check action dispatching
- Verify reducer logic

### Styling Issues
- Ensure TailwindCSS is configured properly
- Check for conflicting CSS
- Verify class names are correct

## 🚀 Production Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

The build will be created in the `dist` folder.

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_NODE_ENV` | Environment mode | `development` |

## 📚 Dependencies

### Core Dependencies
- **React 19.1.1** - UI library
- **Redux Toolkit 2.9.0** - State management
- **React Router 7.9.1** - Routing
- **TailwindCSS 4.1.13** - Styling
- **Axios 1.12.2** - HTTP client
- **Lucide React 0.544.0** - Icons

### Development Dependencies
- **Vite 7.1.7** - Build tool
- **ESLint 9.36.0** - Code linting
- **@vitejs/plugin-react** - React support

## 🎯 Performance Tips

1. **Code Splitting** - Implemented with React.lazy
2. **Image Optimization** - Use appropriate formats
3. **Bundle Size** - Monitor with build analyzer
4. **Caching** - Redux state persistence
5. **API Calls** - Debounced search inputs

## 🔄 State Management

The app uses Redux Toolkit for:
- **Project Management** - CRUD operations
- **File Uploads** - Progress tracking
- **AI Analysis** - Results caching
- **Error Handling** - Centralized error states

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+