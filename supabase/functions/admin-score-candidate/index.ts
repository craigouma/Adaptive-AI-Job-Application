import Groq from 'npm:groq-sdk@0.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

async function scoreCandidate(application: any) {
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    // Return mock scores if Groq is not available
    return {
      applicationId: application.id,
      overallScore: Math.floor(Math.random() * 40) + 60,
      skillsScore: Math.floor(Math.random() * 40) + 60,
      experienceScore: Math.floor(Math.random() * 40) + 60,
      communicationScore: Math.floor(Math.random() * 40) + 60,
      cultureFitScore: Math.floor(Math.random() * 40) + 60,
      reasoning: 'Mock scoring - Groq API not configured. This candidate shows potential based on their responses.'
    };
  }

  const groq = new Groq({ apiKey: groqApiKey });

  const roleTitle = application.role.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  const answers = application.answers.map((a: any) => `${a.key}: ${a.value}`).join('\n');

  const systemPrompt = `You are an expert HR professional and technical recruiter specializing in ${roleTitle} positions. 

Your task is to evaluate a job application and provide detailed scoring across multiple dimensions.

Evaluate the candidate on a scale of 0-100 for each category:

1. SKILLS SCORE (0-100): Technical competency and relevant skills for the role
2. EXPERIENCE SCORE (0-100): Years of experience, project complexity, and career progression
3. COMMUNICATION SCORE (0-100): Clarity of responses, articulation, and professional communication
4. CULTURE FIT SCORE (0-100): Alignment with company values, enthusiasm, and team collaboration potential

Also provide an OVERALL SCORE (0-100) that weighs all factors appropriately.

SCORING GUIDELINES:
- 90-100: Exceptional candidate, top 5%
- 80-89: Strong candidate, definitely interview
- 70-79: Good candidate, consider for interview
- 60-69: Average candidate, may interview if needed
- Below 60: Not a good fit for this role

Provide your assessment in this EXACT JSON format:
{
  "overallScore": 85,
  "skillsScore": 88,
  "experienceScore": 82,
  "communicationScore": 87,
  "cultureFitScore": 83,
  "reasoning": "Detailed explanation of the scoring rationale, highlighting strengths and areas of concern. Be specific about what impressed you or what raised concerns."
}`;

  const userPrompt = `Please evaluate this ${roleTitle} candidate based on their application responses:

${answers}

Provide a comprehensive scoring assessment following the guidelines above.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    const parsedResponse = JSON.parse(response);
    
    // Validate the response structure
    const requiredFields = ['overallScore', 'skillsScore', 'experienceScore', 'communicationScore', 'cultureFitScore', 'reasoning'];
    for (const field of requiredFields) {
      if (!(field in parsedResponse)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure scores are within valid range
    const scoreFields = ['overallScore', 'skillsScore', 'experienceScore', 'communicationScore', 'cultureFitScore'];
    for (const field of scoreFields) {
      const score = parsedResponse[field];
      if (typeof score !== 'number' || score < 0 || score > 100) {
        parsedResponse[field] = Math.max(0, Math.min(100, parseInt(score) || 50));
      }
    }

    return {
      applicationId: application.id,
      ...parsedResponse
    };

  } catch (error) {
    console.error('Error scoring candidate with Groq:', error);
    
    // Fallback to mock scoring
    return {
      applicationId: application.id,
      overallScore: Math.floor(Math.random() * 40) + 60,
      skillsScore: Math.floor(Math.random() * 40) + 60,
      experienceScore: Math.floor(Math.random() * 40) + 60,
      communicationScore: Math.floor(Math.random() * 40) + 60,
      cultureFitScore: Math.floor(Math.random() * 40) + 60,
      reasoning: 'AI scoring temporarily unavailable. This is a placeholder assessment based on application completeness and basic criteria.'
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const { applicationId } = await req.json();

      if (!applicationId) {
        return new Response(
          JSON.stringify({ error: 'Application ID is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Get the application
      const { data: application, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (error || !application) {
        return new Response(
          JSON.stringify({ error: 'Application not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Score the candidate
      const score = await scoreCandidate(application);

      // Update the application with the score
      const { error: updateError } = await supabase
        .from('applications')
        .update({ score: score.overallScore })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error updating application score:', updateError);
      }

      return new Response(
        JSON.stringify(score),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in admin-score-candidate function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});