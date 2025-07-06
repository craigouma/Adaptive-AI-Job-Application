import Groq from 'npm:groq-sdk@0.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Define roles directly in the Edge Function to avoid import issues
const ROLES = [
  'frontend-engineer',
  'product-designer', 
  'backend-engineer',
  'fullstack-engineer',
  'data-scientist',
  'devops-engineer',
  'product-manager',
  'ui-ux-designer',
  'mobile-developer',
  'qa-engineer'
] as const;

type Role = typeof ROLES[number];

interface Answer {
  key: string;
  value: string | number;
}

interface NextQuestionRequest {
  answers: Answer[];
  role: Role;
}

// Role-specific context for better question generation
const ROLE_CONTEXTS = {
  'frontend-engineer': {
    focus: 'frontend development, React, TypeScript, CSS, JavaScript, web technologies, user interfaces',
    skills: 'HTML, CSS, JavaScript, React, Vue, Angular, TypeScript, responsive design, accessibility, performance optimization',
    responsibilities: 'building user interfaces, implementing designs, optimizing performance, ensuring cross-browser compatibility, collaborating with designers',
    sampleQuestions: [
      'What frontend frameworks have you worked with?',
      'How do you approach responsive design?',
      'Tell us about a challenging UI component you built',
      'How do you ensure cross-browser compatibility?',
      'What tools do you use for performance optimization?'
    ]
  },
  'product-designer': {
    focus: 'user experience design, user interface design, design systems, user research, prototyping',
    skills: 'Figma, Sketch, Adobe Creative Suite, prototyping, user research, design systems, wireframing, usability testing',
    responsibilities: 'creating user-centered designs, conducting user research, building design systems, collaborating with developers, testing designs',
    sampleQuestions: [
      'What design tools do you prefer and why?',
      'How do you approach user research?',
      'Tell us about a design system you created',
      'How do you validate your design decisions?',
      'Describe your design process from concept to handoff'
    ]
  },
  'backend-engineer': {
    focus: 'server-side development, APIs, databases, system architecture, performance optimization, security',
    skills: 'Node.js, Python, Java, Go, SQL, NoSQL, REST APIs, GraphQL, microservices, cloud platforms',
    responsibilities: 'building scalable backend systems, designing APIs, database optimization, ensuring security, system monitoring',
    sampleQuestions: [
      'What backend technologies do you specialize in?',
      'How do you approach API design?',
      'Tell us about a scalability challenge you solved',
      'How do you ensure application security?',
      'What database technologies have you worked with?'
    ]
  },
  'fullstack-engineer': {
    focus: 'full-stack development, frontend and backend integration, system architecture, end-to-end development',
    skills: 'JavaScript, TypeScript, React, Node.js, databases, cloud platforms, DevOps, system design',
    responsibilities: 'developing complete applications, integrating frontend and backend, system architecture, deployment and monitoring',
    sampleQuestions: [
      'How do you balance frontend and backend development?',
      'Tell us about a full-stack project you built',
      'How do you approach system architecture?',
      'What technologies do you use for deployment?',
      'How do you handle data flow between frontend and backend?'
    ]
  },
  'data-scientist': {
    focus: 'data analysis, machine learning, statistical modeling, data visualization, predictive analytics',
    skills: 'Python, R, SQL, pandas, scikit-learn, TensorFlow, PyTorch, Jupyter, data visualization, statistics',
    responsibilities: 'analyzing complex datasets, building ML models, creating insights, data visualization, statistical analysis',
    sampleQuestions: [
      'What programming languages do you use for data science?',
      'Tell us about a machine learning project you worked on',
      'How do you approach data cleaning and preprocessing?',
      'What visualization tools do you prefer?',
      'How do you validate your models?'
    ]
  },
  'devops-engineer': {
    focus: 'infrastructure automation, CI/CD, cloud platforms, monitoring, containerization, deployment',
    skills: 'Docker, Kubernetes, AWS, Azure, GCP, Jenkins, GitLab CI, Terraform, monitoring tools, scripting',
    responsibilities: 'automating deployments, managing infrastructure, ensuring system reliability, monitoring and alerting',
    sampleQuestions: [
      'What cloud platforms have you worked with?',
      'How do you approach CI/CD pipeline design?',
      'Tell us about an infrastructure challenge you solved',
      'What containerization technologies do you use?',
      'How do you handle monitoring and alerting?'
    ]
  },
  'product-manager': {
    focus: 'product strategy, user research, roadmap planning, stakeholder management, data-driven decisions',
    skills: 'product strategy, user research, analytics, roadmap planning, stakeholder communication, agile methodologies',
    responsibilities: 'defining product vision, managing roadmaps, coordinating with teams, analyzing user feedback, making data-driven decisions',
    sampleQuestions: [
      'How do you approach product roadmap planning?',
      'Tell us about a product launch you managed',
      'How do you prioritize features?',
      'What metrics do you use to measure success?',
      'How do you gather and analyze user feedback?'
    ]
  },
  'ui-ux-designer': {
    focus: 'user interface design, user experience research, interaction design, usability testing, design systems',
    skills: 'Figma, Sketch, Adobe XD, prototyping, user research, usability testing, design systems, interaction design',
    responsibilities: 'creating intuitive user interfaces, conducting user research, prototyping, usability testing, maintaining design consistency',
    sampleQuestions: [
      'What is your design process from research to final design?',
      'How do you conduct usability testing?',
      'Tell us about a design challenge you solved',
      'How do you ensure accessibility in your designs?',
      'What tools do you use for prototyping?'
    ]
  },
  'mobile-developer': {
    focus: 'mobile app development, iOS, Android, cross-platform development, mobile UI/UX, app store optimization',
    skills: 'Swift, Kotlin, React Native, Flutter, Xamarin, mobile UI design, app store guidelines, mobile testing',
    responsibilities: 'developing mobile applications, ensuring cross-platform compatibility, optimizing performance, following platform guidelines',
    sampleQuestions: [
      'What mobile development platforms do you work with?',
      'How do you approach cross-platform development?',
      'Tell us about a mobile app you built',
      'How do you handle different screen sizes and devices?',
      'What tools do you use for mobile testing?'
    ]
  },
  'qa-engineer': {
    focus: 'quality assurance, test automation, manual testing, bug tracking, test planning, quality processes',
    skills: 'test automation, Selenium, Jest, Cypress, manual testing, bug tracking, test planning, quality metrics',
    responsibilities: 'ensuring software quality, creating test plans, automating tests, identifying bugs, improving quality processes',
    sampleQuestions: [
      'What testing frameworks and tools do you use?',
      'How do you approach test automation?',
      'Tell us about a critical bug you found and how you handled it',
      'How do you create comprehensive test plans?',
      'What metrics do you use to measure quality?'
    ]
  }
} as const;

async function generateNextQuestion(answers: Answer[], role: Role) {
  const roleContext = ROLE_CONTEXTS[role];
  const answeredQuestions = answers.map(a => `Question: ${a.key}\nAnswer: ${a.value}`).join('\n\n');
  const roleTitle = role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Determine what stage we're at in the application
  const questionCount = answers.length;
  let stageGuidance = '';
  
  if (questionCount === 0) {
    stageGuidance = 'Start with basic contact information (name).';
  } else if (questionCount === 1) {
    stageGuidance = 'Ask for email address.';
  } else if (questionCount === 2) {
    stageGuidance = 'Ask about their experience level in the field.';
  } else if (questionCount === 3) {
    stageGuidance = 'Ask about specific skills, tools, or technologies relevant to the role.';
  } else if (questionCount === 4) {
    stageGuidance = 'Ask about a specific project, portfolio piece, or work experience.';
  } else if (questionCount === 5) {
    stageGuidance = 'Ask about availability or preferences for starting the role.';
  } else {
    stageGuidance = 'The application should be complete. Return completed: true.';
  }

  const systemPrompt = `You are an intelligent job application assistant for a ${roleTitle} position. 

Role Context:
- Focus areas: ${roleContext.focus}
- Key skills: ${roleContext.skills}  
- Main responsibilities: ${roleContext.responsibilities}

Current Stage: ${stageGuidance}

Your task is to generate the next most relevant question based on the candidate's previous answers. 

CRITICAL RULES:
1. Ask only ONE question at a time
2. Make questions progressively more specific based on previous answers
3. Ensure questions are highly relevant to the ${roleTitle} role
4. Keep questions professional, engaging, and conversational
5. NEVER repeat similar questions or ask for information already provided
6. After 6 questions total, mark the application as completed
7. Use the candidate's previous answers to personalize follow-up questions

Question Types Available:
- "text": For short answers (names, emails, single words)
- "textarea": For longer responses (descriptions, explanations, stories)
- "select": For multiple choice with specific options
- "number": For numeric values

RESPONSE FORMAT - Return ONLY valid JSON with this exact structure:
{
  "question": {
    "key": "unique_snake_case_identifier",
    "label": "Clear, engaging question text",
    "type": "text|textarea|select|number",
    "options": ["option1", "option2", "option3"] // ONLY include if type is "select"
  },
  "completed": false
}

If 6+ questions have been answered, return:
{
  "completed": true,
  "message": "Thank you for completing your application! We'll review it and get back to you soon."
}

Make each question feel natural and build upon previous answers when possible.`;

  const userPrompt = `Previous answers from the ${roleTitle} candidate:
${answeredQuestions || 'No previous answers yet - this is the first question.'}

Total questions answered so far: ${questionCount}

Generate the next most appropriate question for this ${roleTitle} candidate. Remember to follow the stage guidance and make it relevant to their previous responses.`;

  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.log('Groq API key not available, using fallback questions');
      throw new Error('Groq API key not configured');
    }

    console.log(`Generating AI question for ${role}, question #${questionCount + 1}`);

    const groq = new Groq({
      apiKey: groqApiKey,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    console.log('Raw Groq response:', response);

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse Groq JSON response:', parseError);
      throw new Error('Invalid JSON from AI');
    }
    
    // Validate the response structure
    if (parsedResponse.completed) {
      console.log('AI marked application as completed');
      return { 
        completed: true, 
        message: parsedResponse.message || 'Thank you for completing your application! We\'ll review it and get back to you soon.' 
      };
    }
    
    if (!parsedResponse.question || !parsedResponse.question.key || !parsedResponse.question.label || !parsedResponse.question.type) {
      console.error('Invalid question structure from AI:', parsedResponse);
      throw new Error('Invalid question structure from AI');
    }

    // Ensure the question type is valid
    const validTypes = ['text', 'textarea', 'select', 'number'];
    if (!validTypes.includes(parsedResponse.question.type)) {
      console.error('Invalid question type from AI:', parsedResponse.question.type);
      parsedResponse.question.type = 'text'; // Default fallback
    }

    // Validate select options
    if (parsedResponse.question.type === 'select' && (!parsedResponse.question.options || !Array.isArray(parsedResponse.question.options))) {
      console.error('Select question missing options, converting to textarea');
      parsedResponse.question.type = 'textarea';
      delete parsedResponse.question.options;
    }

    console.log('Successfully generated AI question:', parsedResponse.question);
    return parsedResponse;

  } catch (error) {
    console.error('Error generating question with Groq:', error);
    
    // Always fall back to predefined questions if AI fails
    return getFallbackQuestion(answers, role);
  }
}

function getFallbackQuestion(answers: Answer[], role: Role) {
  const answeredKeys = answers.map(a => a.key);
  
  // Define fallback question sequences for each role
  const fallbackQuestions = {
    'frontend-engineer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of frontend development experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'technologies',
        label: 'Which frontend technologies and frameworks are you most comfortable with? (e.g., React, Vue, Angular, TypeScript)',
        type: 'textarea',
        required: true
      },
      {
        key: 'challenging_project',
        label: 'Tell us about your most challenging frontend project. What made it difficult and how did you overcome the challenges?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'product-designer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of product design experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'design_tools',
        label: 'Which design tools do you use regularly? (e.g., Figma, Sketch, Adobe Creative Suite)',
        type: 'textarea',
        required: true
      },
      {
        key: 'design_process',
        label: 'Describe your typical design process from initial concept to final delivery. How do you ensure your designs meet user needs?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'backend-engineer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of backend development experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'technologies',
        label: 'Which backend technologies and frameworks are you most experienced with? (e.g., Node.js, Python, Java, Go)',
        type: 'textarea',
        required: true
      },
      {
        key: 'system_design',
        label: 'Describe a complex backend system you designed or worked on. What were the main challenges and how did you address them?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'fullstack-engineer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of full-stack development experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'tech_stack',
        label: 'What is your preferred full-stack technology stack? Include frontend, backend, and database technologies.',
        type: 'textarea',
        required: true
      },
      {
        key: 'fullstack_project',
        label: 'Tell us about a full-stack application you built from scratch. What technologies did you use and what challenges did you face?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'data-scientist': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of data science experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'tools_languages',
        label: 'Which programming languages and data science tools do you use regularly? (e.g., Python, R, SQL, TensorFlow)',
        type: 'textarea',
        required: true
      },
      {
        key: 'ml_project',
        label: 'Describe a machine learning or data analysis project you worked on. What was the problem, approach, and outcome?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'devops-engineer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of DevOps/Infrastructure experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'cloud_tools',
        label: 'Which cloud platforms and DevOps tools do you have experience with? (e.g., AWS, Docker, Kubernetes, Jenkins)',
        type: 'textarea',
        required: true
      },
      {
        key: 'infrastructure_project',
        label: 'Tell us about a complex infrastructure or automation project you implemented. What challenges did you solve?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'product-manager': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of product management experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'product_tools',
        label: 'What product management tools and methodologies do you use? (e.g., Jira, Figma, Agile, OKRs)',
        type: 'textarea',
        required: true
      },
      {
        key: 'product_launch',
        label: 'Tell us about a successful product launch you managed. What was your strategy and how did you measure success?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'ui-ux-designer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of UI/UX design experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'design_tools',
        label: 'Which design and prototyping tools do you use regularly? (e.g., Figma, Sketch, Adobe XD, Principle)',
        type: 'textarea',
        required: true
      },
      {
        key: 'design_process',
        label: 'Walk us through your design process from user research to final handoff. How do you ensure user-centered design?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'mobile-developer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of mobile development experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'mobile_platforms',
        label: 'Which mobile development platforms and technologies do you work with? (e.g., iOS/Swift, Android/Kotlin, React Native, Flutter)',
        type: 'textarea',
        required: true
      },
      {
        key: 'mobile_app',
        label: 'Tell us about a mobile app you developed. What were the key features and technical challenges you faced?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ],
    'qa-engineer': [
      {
        key: 'name',
        label: 'What is your full name?',
        type: 'text',
        required: true
      },
      {
        key: 'email',
        label: 'What is your email address?',
        type: 'text',
        required: true
      },
      {
        key: 'experience',
        label: 'How many years of QA/Testing experience do you have?',
        type: 'select',
        options: ['0-1 years', '2-3 years', '4-5 years', '6-8 years', '9+ years'],
        required: true
      },
      {
        key: 'testing_tools',
        label: 'Which testing tools and frameworks do you use? (e.g., Selenium, Cypress, Jest, Postman, JIRA)',
        type: 'textarea',
        required: true
      },
      {
        key: 'testing_approach',
        label: 'Describe your approach to testing a complex application. How do you balance manual and automated testing?',
        type: 'textarea',
        required: true
      },
      {
        key: 'availability',
        label: 'When would you be available to start?',
        type: 'select',
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'More than 2 months'],
        required: true
      }
    ]
  };

  const questions = fallbackQuestions[role];
  const nextQuestion = questions.find(q => !answeredKeys.includes(q.key));
  
  if (nextQuestion) {
    console.log('Using fallback question:', nextQuestion.key);
    return { question: nextQuestion, completed: false };
  } else {
    console.log('All fallback questions completed');
    return { 
      completed: true, 
      message: 'Thank you for completing your application! We\'ll review it and get back to you soon.' 
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request body
    let requestData: NextQuestionRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { answers, role } = requestData;
    
    // Validate required fields
    if (!role || !ROLES.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing role' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: 'Answers must be an array' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Processing request for ${role} with ${answers.length} previous answers`);
    
    // Check if Groq API key is available
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    let response;
    if (groqApiKey) {
      console.log('Using Groq AI for adaptive question generation');
      response = await generateNextQuestion(answers, role);
    } else {
      console.log('Groq API key not found, using fallback questions');
      response = getFallbackQuestion(answers, role);
    }
    
    console.log('Final response:', response);
    
    // Ensure response has the correct structure
    if (!response || (typeof response !== 'object')) {
      throw new Error('Invalid response generated');
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in next-question function:', error);
    
    // Return a fallback response to ensure the application doesn't break
    const fallbackResponse = {
      question: {
        key: 'name',
        label: 'What is your full name?',
        type: 'text'
      },
      completed: false
    };
    
    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        status: 200, // Return 200 with fallback instead of 500 error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});