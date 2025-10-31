# MGNREGA Performance Dashboard

A comprehensive, bilingual (Hindi/English) dashboard for visualizing MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act) performance data across Indian districts. Features real-time data visualization, intelligent location detection, and text-to-speech capabilities in both languages.

![MGNREGA Dashboard](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) 

## 🌟 Features

### Core Functionality
- **📊 Interactive Data Visualization**: Real-time charts and metrics for MGNREGA performance data
- **🌍 Bilingual Support**: Seamless switching between Hindi and English
- **🎯 Smart Location Detection**: Automatic district detection based on user's GPS location
- **🔊 Text-to-Speech**: Comprehensive audio narration with proper Hindi number pronunciation
- **🔍 Advanced Search**: Type-ahead district search with intelligent filtering
- **📱 Fully Responsive**: Optimized for mobile, tablet, and desktop devices

### Data Insights
- Total Workers and Employment Statistics
- Wage Distribution and Average Rates
- Women Participation Metrics
- Household Employment Data
- Completed Works Tracking
- Historical Trend Analysis

### Technical Highlights
- **Progressive Web App** ready
- **Google Cloud TTS** integration with browser fallback
- **Real-time database** with Supabase
- **Optimized performance** with React hooks and memoization
- **Accessible design** with proper ARIA labels

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16.x
- **npm** >= 8.x or **yarn** >= 1.22.x
- **Supabase** account
- **Google Cloud Platform** account (for TTS and Maps APIs)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/mgnrega-dashboard.git
   cd mgnrega-dashboard
```

2. **Install dependencies**
```bash
   npm install
   # or
   yarn install
```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Maps API (for location detection)
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   
   # Google Cloud Text-to-Speech API (optional - falls back to browser TTS)
   VITE_GOOGLE_TTS_API_KEY=your_google_tts_api_key
```

4. **Set up Supabase Database**
   
   Run the following SQL in your Supabase SQL editor:
```sql
   -- Create districts table
   CREATE TABLE districts (
     id SERIAL PRIMARY KEY,
     state_code VARCHAR(10) NOT NULL,
     state_name VARCHAR(100) NOT NULL,
     district_code VARCHAR(10) NOT NULL UNIQUE,
     district_name VARCHAR(100) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create district_performance table
   CREATE TABLE district_performance (
     id SERIAL PRIMARY KEY,
     fin_year VARCHAR(20) NOT NULL,
     month VARCHAR(20) NOT NULL,
     state_code VARCHAR(10) NOT NULL,
     state_name VARCHAR(100) NOT NULL,
     district_code VARCHAR(10) NOT NULL,
     district_name VARCHAR(100) NOT NULL,
     
     -- Performance metrics
     Total_No_of_Workers INTEGER DEFAULT 0,
     Wages BIGINT DEFAULT 0,
     Women_Persondays INTEGER DEFAULT 0,
     Total_Households_Worked INTEGER DEFAULT 0,
     Number_of_Completed_Works INTEGER DEFAULT 0,
     Average_Wage_rate_per_day_per_person DECIMAL(10,2) DEFAULT 0,
     SC_persondays INTEGER DEFAULT 0,
     ST_persondays INTEGER DEFAULT 0,
     
     -- Additional metrics (add all other columns as needed)
     
     last_updated TIMESTAMP DEFAULT NOW(),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create indexes for better performance
   CREATE INDEX idx_district_code ON district_performance(district_code);
   CREATE INDEX idx_fin_year ON district_performance(fin_year);
   CREATE INDEX idx_month ON district_performance(month);
   
   -- Enable Row Level Security (RLS)
   ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE district_performance ENABLE ROW LEVEL SECURITY;
   
   -- Create policies for public read access
   CREATE POLICY "Allow public read access on districts"
     ON districts FOR SELECT
     USING (true);
   
   CREATE POLICY "Allow public read access on district_performance"
     ON district_performance FOR SELECT
     USING (true);
```

5. **Import your data**
   
   Upload your CSV data to Supabase tables using the Supabase dashboard or API.

6. **Start the development server**
```bash
   npm run dev
   # or
   yarn dev
```

7. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 🔧 Configuration

### Google Cloud APIs Setup

#### 1. Geocoding API (Location Detection)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Geocoding API**
3. Create an API key
4. Restrict key to Geocoding API only
5. Add to `.env` as `VITE_GOOGLE_MAPS_API_KEY`

#### 2. Text-to-Speech API (Audio Narration)
1. In Google Cloud Console, enable **Cloud Text-to-Speech API**
2. Create an API key (can use same key as Maps)
3. Add to `.env` as `VITE_GOOGLE_TTS_API_KEY`
4. **Note**: Requires billing enabled, but includes free tier (1M characters/month)

**Security Best Practices:**
- ✅ Restrict API keys to specific APIs
- ✅ Add HTTP referrer restrictions in production
- ✅ Set up billing alerts
- ✅ Never commit `.env` to version control

---

## 📁 Project Structure
```
mgnrega-dashboard/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx          # Main dashboard container
│   │   ├── DistrictSelector.tsx   # District search/select
│   │   ├── PerformanceCards.tsx   # Metric cards
│   │   └── TrendsChart.tsx        # Chart components
│   ├── lib/
│   │   └── supabase.ts           # Supabase client & utilities
│   ├── services/
│   │   └── api.ts                # API service layer
│   ├── App.tsx            # Root component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment file
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎨 Features in Detail

### 1. Language Toggle
- Seamlessly switch between Hindi and English
- Updates all UI elements, labels, and audio
- Preserves user selection across sessions
- Bilingual chart labels and tooltips

### 2. Audio Narration
- **Intelligent Number Conversion**: "2.86 L" → "do lakh chhiyaasi hazaar"
- **Comprehensive Coverage**: Narrates all dashboard metrics
- **Google TTS Integration**: High-quality natural voices
- **Automatic Fallback**: Uses browser TTS if Google API unavailable
- **Single-Click Control**: Start/stop with one button

### 3. Smart Search
- **Type-ahead filtering**: Real-time district search
- **Fuzzy matching**: Searches both district and state names
- **Priority sorting**: Exact matches appear first
- **Keyboard navigation**: Full keyboard accessibility

### 4. Responsive Design
- **Mobile-first approach**: Optimized for small screens
- **Adaptive layouts**: 1/2/3 column grids based on screen size
- **Touch-friendly**: Large tap targets and gestures
- **Performance optimized**: Lazy loading and code splitting

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.x** - Type safety
- **Vite 5.x** - Build tool
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **TailwindCSS** (utility classes) - Styling

### Backend & APIs
- **Supabase** - Database and real-time backend
- **Google Cloud TTS** - Text-to-speech
- **Google Maps Geocoding** - Location services

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static typing

---

## 📊 Performance Metrics

The dashboard displays the following key metrics:

| Metric | Description | Format |
|--------|-------------|--------|
| Total Workers | Number of workers employed | Formatted (K/L/Cr) |
| Total Wages | Total wages distributed | Currency (₹) |
| Women Persondays | Women participation | Formatted number |
| Households Worked | Families employed | Formatted number |
| Completed Works | Projects finished | Count |
| Average Wage | Per day per person | Currency (₹) |

### Trend Analysis
- **Workers Trend**: Line chart showing employment over time
- **Wages Trend**: Bar chart for wage distribution
- **Demographics**: SC/ST and women participation trends

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

#### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Option 3: Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist/` folder to your web server
3. Configure environment variables on your hosting platform

### Environment Variables in Production
Make sure to set all environment variables in your hosting platform's dashboard:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Others: Consult platform documentation

---

## 🔒 Security Considerations

1. **API Key Security**
   - Never commit `.env` to git
   - Use environment variables in production
   - Restrict API keys to specific domains
   - Enable billing alerts

2. **Database Security**
   - Enable Row Level Security (RLS) on Supabase
   - Use read-only policies for public access
   - Regularly audit access logs

3. **Content Security**
   - Implement CSP headers
   - Use HTTPS in production
   - Validate all user inputs

---

## 🐛 Troubleshooting

### Common Issues

**1. Location detection not working**
- Ensure browser has location permissions
- Check Google Maps API key is valid
- Verify Geocoding API is enabled

**2. Audio not playing**
- Check browser supports Web Audio API
- Verify Google TTS API key (or rely on browser fallback)
- Ensure microphone permissions if needed

**3. Data not loading**
- Verify Supabase credentials in `.env`
- Check database tables exist
- Ensure RLS policies allow read access

**4. Build errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm run clean` (if available)
- Check Node.js version: `node --version` (should be 16+)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Standards
- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Test on multiple devices/browsers

---

## 🙏 Acknowledgments

- **Ministry of Rural Development, Government of India** - Data source
- **MGNREGA Program** - Employment data
- **Supabase** - Backend infrastructure
- **Google Cloud** - TTS and Maps APIs
- **React & Vite Communities** - Development tools

---

## 📈 Roadmap

### Upcoming Features
- [ ] Export data to CSV/PDF
- [ ] Advanced filtering and date range selection
- [ ] Comparison between multiple districts
- [ ] Offline mode with service workers
- [ ] User authentication for personalized dashboards
- [ ] Admin panel for data management
- [ ] Mobile app (React Native)
- [ ] WhatsApp/SMS notifications
- [ ] Multi-language support (Tamil, Telugu, etc.)
