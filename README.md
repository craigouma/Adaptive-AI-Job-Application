# Adaptive Job Application

A modern, AI-powered job application system that dynamically generates personalized questions based on user responses and selected roles. Built with React, TypeScript, Supabase, and Groq AI, with full internationalization support powered by lingo.dev.

## 🚀 Features

- **Adaptive Questioning**: Dynamic question generation based on user responses using Groq AI
- **Multiple Job Roles**: Support for 10 different roles including Frontend Engineer, Product Designer, Backend Engineer, and more
- **Real-time Progress Tracking**: Visual progress indicators with smooth animations
- **AI-Powered Logic**: Uses Groq's LLaMA model for intelligent question sequencing
- **Database Integration**: Supabase for secure application storage
- **Admin Dashboard**: Complete admin interface for managing applications with analytics
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Comprehensive Testing**: Unit tests with Vitest and E2E tests with Playwright
- **🌐 Full Internationalization**: Real-time AI-powered translation supporting 12+ languages via lingo.dev
- **Session Caching**: Optimized translation performance with intelligent caching
- **Dynamic Content Translation**: Questions, options, and UI elements translate on-the-fly

## 🌐 Internationalization Features

### Supported Languages
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇵🇹 Portuguese (pt)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar)
- 🇮🇳 Hindi (hi)
- 🇷🇺 Russian (ru)

### Translation Features
- **Real-time Translation**: All UI text, questions, and options translate instantly when language is changed
- **Session Caching**: Translated content is cached for optimal performance
- **Fallback Handling**: Original text is preserved if translation fails
- **Dynamic Content**: Questions and form options are translated on-the-fly
- **Static UI Translation**: All interface elements (buttons, labels, messages) are translated
- **Error Recovery**: Graceful handling of translation service outages

### How Translation Works
1. **Language Selection**: Users can select their preferred language from a dropdown
2. **Automatic Translation**: All content is translated using lingo.dev's AI-powered translation
3. **Caching**: Translated content is cached to avoid repeated API calls
4. **Fallback**: If translation fails, the original English text is displayed
5. **Real-time Updates**: Language changes are applied immediately across the entire application

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **ApplicationFlow**: Main application component managing the flow with language selector
- **QuestionCard**: Renders individual questions with various input types and translation support
- **ProgressIndicator**: Shows completion progress with visual feedback and translated text
- **RoleToggle**: Dropdown selector for choosing job roles
- **CompletionCard**: Displays success message and next steps with translation
- **AdminDashboard**: Complete admin interface with analytics (admin UI remains in English)
- **Translation Service**: Custom hooks and services for managing translations

### Backend (Supabase Edge Functions)
- **next-question**: Determines the next question based on current answers using AI
- **submit-application**: Saves completed applications to the database
- **admin-applications**: Retrieves applications for admin dashboard
- **admin-analytics**: Provides application analytics and insights
- **admin-score-candidate**: AI-powered candidate scoring system
- **translate**: Proxies translation requests to lingo.dev (new)

### Database (PostgreSQL)
- **applications**: Stores application data with role, answers, status, and scores
- **admin_users**: Admin authentication system

## 🔧 Setup & Configuration

### Prerequisites
- Node.js 18+
- Supabase account
- Groq API key
- lingo.dev API key

### Environment Variables
Create a `.env` file based on `.env.example`:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Translation Configuration
VITE_LINGO_API_KEY=your_lingo_dev_api_key_here
```

### Getting API Keys

#### Groq API Setup
1. Visit [Groq Console](https://console.groq.com)
2. Create an account and generate an API key
3. Copy the key to your `.env` file

#### Supabase Setup
1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings → API
3. Copy the Project URL and anon key
4. Copy the service role key from the same page

#### lingo.dev Setup
1. Visit [lingo.dev](https://lingo.dev)
2. Create an account and generate an API key
3. Copy the key to your `.env` file
4. Set the `LINGO_API_KEY` environment variable in your Supabase Edge Functions

### Supabase Edge Functions Setup
The translation functionality requires a Supabase Edge Function to proxy requests to lingo.dev:

1. **Deploy the translate function:**
```bash
supabase functions deploy translate
```

2. **Set the LINGO_API_KEY in Supabase:**
   - Go to your Supabase dashboard → Settings → Functions → Environment Variables
   - Add `LINGO_API_KEY` with your lingo.dev API key

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd adaptive-job-application
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

4. **Deploy Supabase Edge Functions**
```bash
supabase functions deploy translate
```

5. **Start the development server**
```bash
npm run dev
```

## 🧪 Testing

### Unit Tests
Run unit tests with Vitest:
```bash
npm run test
```

Interactive test UI:
```bash
npm run test:ui
```

Test coverage:
```bash
npm run test:coverage
```

### End-to-End Tests
Run E2E tests with Playwright:
```bash
npm run test:e2e
```

Interactive E2E test UI:
```bash
npm run test:e2e:ui
```

### Test Scenarios
- **Complete Application Flow**: Tests full application submission for different roles
- **Role Switching**: Verifies different question sets for each role
- **Progress Tracking**: Ensures accurate progress calculation
- **Form Validation**: Tests required field validation
- **Error Handling**: Verifies graceful error handling
- **Admin Dashboard**: Tests admin functionality and analytics
- **Translation Features**: Tests language switching and content translation

## 🎯 Admin Dashboard Features

### Authentication
- Secure admin login system
- Default credentials: `craigcarlos95@gmail.com` / `password123`

### Application Management
- View all applications with filtering by role and status
- Update application status (pending, reviewed, shortlisted, rejected)
- Detailed application view with candidate responses
- Export applications to CSV or PDF

### Analytics & Insights
- Total applications and completion rates
- Applications breakdown by role
- Drop-off analysis to identify problematic questions
- Recent applications overview
- Top candidates identification

### AI-Powered Candidate Scoring
- Automatic candidate scoring using Groq AI
- Scores across multiple dimensions:
  - Overall Score (0-100)
  - Skills Assessment
  - Experience Evaluation
  - Communication Quality
  - Culture Fit Analysis
- Detailed reasoning for each score
- Bulk scoring capabilities

## 🚀 Deployment

### Frontend Deployment
The application can be deployed to any static hosting service:

1. **Build the application**
```bash
npm run build
```

2. **Deploy the `dist` folder** to your hosting service (Netlify, Vercel, etc.)

### Supabase Edge Functions
Edge functions are automatically deployed when you push to your Supabase project.

## 🔍 Monitoring & Analytics

### Application Metrics
- Response completion rates by role
- Average time per question
- Role distribution analysis
- Drop-off points identification
- Candidate scoring distribution
- Language usage statistics

### Database Queries
```sql
-- Get application statistics
SELECT 
  role,
  COUNT(*) as total_applications,
  AVG(jsonb_array_length(answers)) as avg_questions_answered,
  AVG(score) as avg_score
FROM applications 
GROUP BY role;

-- Recent high-scoring applications
SELECT role, answers, score, created_at 
FROM applications 
WHERE score >= 80
ORDER BY created_at DESC 
LIMIT 10;
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors**
- Verify your Supabase URL and keys are correct
- Check that your Groq API key is valid
- Ensure edge functions are deployed
- Verify your lingo.dev API key is set in Supabase Edge Functions

**Translation Issues**
- Check that the `translate` Edge Function is deployed
- Verify `LINGO_API_KEY` is set in Supabase Edge Functions
- Check lingo.dev service status for any outages
- Ensure your lingo.dev API key has sufficient credits

**Database Errors**
- Verify the applications table exists
- Check RLS policies are properly configured
- Ensure your service role key has the correct permissions

**Build Errors**
- Clear node_modules and reinstall dependencies
- Check TypeScript configuration
- Verify all environment variables are set

**AI Question Generation Issues**
- Check Groq API key is valid and has credits
- Verify network connectivity
- The system will fall back to predefined questions if AI fails

## 📚 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (via Supabase)
- **AI**: Groq LLaMA 3 70B
- **Translation**: lingo.dev AI-powered translation
- **Testing**: Vitest, Playwright, Testing Library
- **Build**: Vite
- **Deployment**: Netlify (frontend), Supabase (backend)

## 🎯 Future Enhancements

- **Advanced Analytics**: More detailed candidate insights and trends
- **Email Integration**: Automated follow-up emails and notifications
- **File Upload**: Resume and portfolio uploads
- **Video Responses**: Optional video question responses
- **Advanced AI**: More sophisticated question routing and candidate matching
- **Enhanced Translation**: Voice-to-text translation, regional dialect support
- **Integration APIs**: Connect with ATS systems and HR tools
- **Advanced Scoring**: Machine learning models for better candidate evaluation
- **Translation Analytics**: Track which languages are most used
- **Offline Translation**: Cache translations for offline use