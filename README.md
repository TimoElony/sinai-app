# Sinai Climbing App

This is a full-stack Next.js application providing an interface to the database of all climbing routes in Egypt, especially those in the Sinai but possibly in the future also for the rest of Egypt, once significant crags get opened.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database (Supabase)

### Installation

1. Clone the repository
```bash
git clone https://github.com/TimoElony/sinai-app.git
cd sinai-app
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

Required environment variables:
- `DB_PASSWORD`: Supabase database password
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox access token for the map view

4. Run the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
npm start
```

## 🎯 Features

### Public Features (The 3 visible Tabs)
* Browse all climbing areas
* Routes and their Topos (Only those routes visible that are linked to topos)
* A Map view to navigate

### Auth Features
* Adding routes to an existing crag
* Adding Topo pictures to an existing crag
* Associating routes to Topos with their corresponding Topo number shown in the picture
* Updating the number of a Route which is already associated to a certain Topo

## 🔌 API Endpoints

This is a full-stack Next.js app with integrated API routes:

### Public Endpoints
- `GET /api/climbingareas` - List all climbing areas
- `GET /api/climbingareas/details/:area` - Get details for a specific area
- `GET /api/climbingroutes/:area/:crag` - Get routes for an area/crag
- `GET /api/walltopos/:area/:crag` - Get wall topos for an area/crag
- `GET /api/geodata/topos` - Get geographic locations of topos
- `GET /api/health` - Server health status

### Protected Endpoints (Require Authentication)
- `POST /api/climbingroutes/new` - Create a new climbing route
- `POST /api/climbingroutes/addToTopo` - Add route to topo
- `PUT /api/climbingroutes/updateTopoNumber` - Update topo number
- `POST /api/walltopos/:area/:crag` - Create a new wall topo
- `POST /api/walltopos/verify` - Verify authentication
- `PUT /api/walltopos/drawnLine/:lineLabel/:asNew` - Add/update drawn lines

### Auth Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

## 🔐 Authentication

The app uses Supabase for authentication. Protected endpoints require a Bearer token in the Authorization header.

## 🏗️ Architecture

This is a Next.js 15 full-stack application that combines:
- **Frontend**: React 19 with Tailwind CSS and Radix UI components
- **Backend**: Next.js API routes with PostgreSQL (Supabase)
- **Auth**: Supabase authentication

```
┌─────────────────────────────┐
│    Next.js Full-Stack App   │
│       (Vercel Ready)        │
│                             │
│   ┌───────────┬──────────┐  │
│   │ Frontend  │   API    │  │
│   │  (React)  │  Routes  │  │
│   └───────────┴──────────┘  │
│                             │
└────────────┬────────────────┘
             │
             │ PostgreSQL
             │
┌────────────▼────────────────┐
│        Supabase             │
│   (Database + Auth)         │
└─────────────────────────────┘
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC
