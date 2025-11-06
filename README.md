# Personal Blog Website

A modern, full-stack personal blog built with Next.js 14, Firebase, and TypeScript. Features a comprehensive admin panel, real-time analytics, SEO optimization, and responsive design.

## Features

- 📝 Rich text editor for article creation
- 🏷️ Category and tag management
- 📧 Newsletter subscription system
- 🎨 WordPress-like customization options
- 📱 Fully responsive design
- 🔒 Secure admin authentication
- 📊 Analytics and engagement tracking
- 🚀 Optimized for performance and SEO

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **UI Components**: Headless UI, Radix UI
- **Rich Text Editor**: Tiptap
- **Form Handling**: React Hook Form + Zod
- **Email**: EmailJS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-blog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Configure your Firebase project:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Enable Storage
   - Copy your Firebase config to `.env.local`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the blog.

### Firebase Setup

1. **Firestore Database**:
   - Create a new Firestore database in production mode
   - Set up security rules (will be configured in later tasks)

2. **Authentication**:
   - Enable Email/Password authentication
   - Create an admin user account

3. **Storage**:
   - Enable Firebase Storage
   - Configure security rules for image uploads

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel routes
│   ├── api/               # API routes
│   ├── articles/          # Article pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── admin/            # Admin-specific components
│   └── public/           # Public-facing components
├── lib/                  # Utility libraries
│   ├── firebase.ts       # Firebase configuration
│   ├── firestore.ts      # Firestore helpers
│   ├── auth.ts           # Authentication helpers
│   └── storage.ts        # Storage helpers
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── hooks/                # Custom React hooks
└── store/                # State management
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Admin Access

The admin panel is available at `/admin` and requires authentication. Create an admin user through Firebase Console or the authentication setup.

## 📦 Production Deployment

### Quick Deploy to Vercel

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel --confirm
   ```

2. **Configure Environment Variables** in Vercel Dashboard
3. **Deploy**: `npm run deploy:vercel`

### Manual Production Build

```bash
# Prepare production environment
cp .env.production.example .env.production.local

# Run production build
npm run build:production
# or use build scripts
./scripts/build-production.sh  # Linux/Mac
./scripts/build-production.bat # Windows
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway  
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
