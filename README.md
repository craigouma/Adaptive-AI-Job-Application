# Adaptive Job Application

A modern, AI-powered job application system that dynamically generates personalized questions based on user responses and selected roles. Built with React, TypeScript, Supabase, and Groq AI.

## 🚀 Features

- **Adaptive Questioning**: Dynamic question generation based on user responses
- **Role-Based Personalization**: Different question sets for Frontend Engineers and Product Designers
- **Real-time Progress Tracking**: Visual progress indicators with smooth animations
- **AI-Powered Logic**: Uses Groq's LLaMA model for intelligent question sequencing
- **Database Integration**: Supabase for secure application storage
- **Modern UI/UX**: Beautiful, responsive design with micro-interactions
- **Comprehensive Testing**: Unit tests with Vitest and E2E tests with Playwright

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **QuestionCard**: Renders individual questions with various input types
- **ProgressIndicator**: Shows completion progress with visual feedback
- **RoleToggle**: Switches between Frontend Engineer and Product Designer
- **CompletionCard**: Displays success message and next steps

### Backend (Supabase Edge Functions)
- **next-question**: Determines the next question based on current answers
- **submit-application**: Saves completed applications to the database

### Database (PostgreSQL)
- **applications**: Stores application data with role and answers in JSONB format

## 🛠️ How Adaptive Question Logic Works

The application uses a sophisticated question flow system:

1. **Role Selection**: User chooses between Frontend Engineer or Product Designer
2. **Question Sets**: Each role has its own predefined question sequence
3. **Dynamic Flow**: Questions are served one at a time based on previous answers
4. **Progress Tracking**: Real-time updates show completion percentage
5. **Completion Detection**: System automatically detects when all questions are answered

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
  role text NOT NULL CHECK (role IN ('frontend-engineer', 'product-designer')),
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
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
- **Complete Application Flow**: Tests full application submission
- **Role Switching**: Verifies different question sets for each role
- **Progress Tracking**: Ensures accurate progress calculation
- **Form Validation**: Tests required field validation
- **Error Handling**: Verifies graceful error handling

## 🚀 Deployment

### Frontend Deployment
The application can be deployed to any static hosting service:

1. **Build the application**
```bash
npm run build
```

2. **Deploy the `dist` folder** to your hosting service

### Supabase Edge Functions
Edge functions are automatically deployed when you push to your Supabase project.

## 🔍 Monitoring & Analytics

### Application Metrics
- Response completion rates
- Average time per question
- Role distribution
- Drop-off points in the application flow

### Database Queries
```sql
-- Get application statistics
SELECT 
  role,
  COUNT(*) as total_applications,
  AVG(jsonb_array_length(answers)) as avg_questions_answered
FROM applications 
GROUP BY role;

-- Recent applications
SELECT role, answers, created_at 
FROM applications 
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

## 📚 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (via Supabase)
- **AI**: Groq LLaMA 3 70B
- **Testing**: Vitest, Playwright, Testing Library
- **Build**: Vite
- **Deployment**: Netlify (frontend), Supabase (backend)

## 🎯 Future Enhancements

- **Multi-language Support**: Internationalization for global users
- **Advanced AI Logic**: More sophisticated question routing
- **Analytics Dashboard**: Real-time application metrics
- **Email Integration**: Automated follow-up emails
- **File Upload**: Resume and portfolio uploads
- **Video Responses**: Optional video question responses
- **Admin Panel**: Application review and management interface