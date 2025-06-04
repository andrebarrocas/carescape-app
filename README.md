# CareSpace - Natural Color Collection Platform

CareSpace is a web platform for documenting and sharing natural colors found in our environment. It allows users to create a digital collection of colors extracted from natural sources, complete with location data, extraction processes, and community knowledge sharing.

## Features

- **Color Documentation**: Upload and document natural colors with detailed information about their sources and extraction processes
- **Interactive Map**: Explore colors by location using an interactive map interface
- **Community Features**: Share knowledge and connect with other color enthusiasts
- **Image Processing**: Extract color information from uploaded images
- **Location Tracking**: Document and explore colors based on geographic location

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Map Integration**: Mapbox GL JS
- **Backend**: Supabase (PostgreSQL with PostGIS)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Image Processing**: color-thief-ts

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Mapbox account

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/carespace.git
   cd carespace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Enable PostGIS extension
3. Create the following tables:
   - users
   - colors
   - sources
   - uploads

Detailed schema information can be found in the database schema section.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  pseudonym TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### Colors Table
```sql
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  description TEXT,
  date_collected DATE NOT NULL,
  season TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  location GEOMETRY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### Sources Table
```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  color_id UUID REFERENCES colors(id),
  material TEXT NOT NULL,
  type TEXT NOT NULL,
  application TEXT NOT NULL,
  process TEXT NOT NULL,
  notes TEXT
);
```

### Uploads Table
```sql
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  color_id UUID REFERENCES colors(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT
);
```

