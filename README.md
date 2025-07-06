# Adaptive Job Application

A modern, AI-powered job application system that dynamically generates personalized questions based on user responses and selected roles. Built with React, TypeScript, Supabase, and Groq AI.

## 🚀 Features

- **Adaptive Questioning**: Dynamic question generation based on user responses using Groq AI
- **Multiple Job Roles**: Support for 10 different roles including Frontend Engineer, Product Designer, Backend Engineer, and more
- **Real-time Progress Tracking**: Visual progress indicators with smooth animations
- **AI-Powered Logic**: Uses Groq's LLaMA model for intelligent question sequencing
- **Database Integration**: Supabase for secure application storage
- **Admin Dashboard**: Complete admin interface for managing applications with analytics
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Comprehensive Testing**: Unit tests with Vitest and E2E tests with Playwright

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **ApplicationFlow**: Main application component managing the flow
- **QuestionCard**: Renders individual questions with various input types
- **ProgressIndicator**: Shows completion progress with visual feedback
- **RoleToggle**: Dropdown selector for choosing job roles
- **CompletionCard**: Displays success message and next steps
- **AdminDashboard**: Complete admin interface with analytics

### Backend (Supabase Edge Functions)
- **next-question**: Determines the next question based on current answers using AI
- **submit-application**: Saves completed applications to the database
- **admin-applications**: Retrieves applications for admin dashboard
- **admin-analytics**: Provides application analytics and insights
- **admin-score-candidate**: AI-powered candidate scoring system

### Database (PostgreSQL)
- **applications**: Stores application data with role, answers, status, and scores
- **admin_users**: Admin authentication system

## 🛠️ How Adaptive Question Logic Works

The application uses a sophisticated question flow system powered by Groq AI:

1. **Role Selection**: User chooses from 10 available job roles
2. **AI-Generated Questions**: Groq AI generates contextual questions based on:
   - Selected role and its requirements
   - Previous answers from the candidate
   - Current stage in the application process
3. **Dynamic Flow**: Questions are served one at a time, each building on previous responses
4. **Fallback System**: Predefined questions ensure the system works even without AI
5. **Progress Tracking**: Real-time updates show completion percentage
6. **Completion Detection**: System automatically detects when all questions are answered

### Supported Job Roles:
- **Frontend Engineer**: React, TypeScript, CSS, JavaScript focus
- **Product Designer**: UX/UI design, design systems, user research
- **Backend Engineer**: Server-side development, APIs, databases
- **Full Stack Engineer**: End-to-end development
- **Data Scientist**: Machine learning, data analysis, Python/R
- **DevOps Engineer**: Infrastructure, CI/CD, cloud platforms
- **Product Manager**: Product strategy, roadmap planning
- **UI/UX Designer**: Interface design, user experience
- **Mobile Developer**: iOS, Android, cross-platform development
- **QA Engineer**: Testing, automation, quality assurance

### Question Types Supported:
- **Text Input**: For names, emails, and short answers
- **Textarea**: For detailed responses and descriptions
- **Select Dropdown**: For multiple choice questions
- **Number Input**: For numeric values (experience years, etc.)

## 🔧 Setup & Configuration

### Prerequisites
- Node.js 18+
- Supabase account
- Groq API key

### Environment Variables
Create a `.env` file based on `.env.example`:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
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

### Database Setup
The application automatically creates the required database schema:

```sql
-- Applications table
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('frontend-engineer', 'product-designer', ...)),
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

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

4. **Start the development server**
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
- **Testing**: Vitest, Playwright, Testing Library
- **Build**: Vite
- **Deployment**: Netlify (frontend), Supabase (backend)

## 🎯 Future Enhancements

- **Advanced Analytics**: More detailed candidate insights and trends
- **Email Integration**: Automated follow-up emails and notifications
- **File Upload**: Resume and portfolio uploads
- **Video Responses**: Optional video question responses
- **Advanced AI**: More sophisticated question routing and candidate matching
- **Multi-language Support**: International candidate support
- **Integration APIs**: Connect with ATS systems and HR tools
- **Advanced Scoring**: Machine learning models for better candidate evaluation