import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const role = url.searchParams.get('role');

      let query = supabase.from('applications').select('*');
      
      if (role) {
        query = query.eq('role', role);
      }

      const { data: applications, error } = await query;

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Define question labels
      const questionLabels: Record<string, string> = {
        name: 'What is your full name?',
        email: 'What is your email address?',
        experience: 'How many years of experience do you have?',
        technologies: 'Which technologies are you comfortable with?',
        design_tools: 'Which design tools do you use regularly?',
        project: 'Tell us about your most challenging project',
        design_process: 'Describe your typical design process',
        challenging_project: 'Tell us about your most challenging project',
        availability: 'When would you be available to start?'
      };

      // Analyze questions
      const questionAnalytics: any[] = [];
      const allQuestionKeys = new Set<string>();

      // Collect all question keys
      applications.forEach(app => {
        app.answers.forEach((answer: any) => {
          allQuestionKeys.add(answer.key);
        });
      });

      // Analyze each question
      Array.from(allQuestionKeys).forEach(questionKey => {
        const responses = applications
          .map(app => app.answers.find((a: any) => a.key === questionKey))
          .filter(Boolean);

        const responseCount = responses.length;
        const averageResponseLength = responses.reduce((sum, response) => {
          return sum + String(response.value).length;
        }, 0) / responseCount || 0;

        // Calculate common responses
        const responseCounts: Record<string, number> = {};
        responses.forEach(response => {
          const value = String(response.value).toLowerCase().trim();
          responseCounts[value] = (responseCounts[value] || 0) + 1;
        });

        const commonResponses = Object.entries(responseCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }));

        // Mock drop-off rate calculation
        const dropOffRate = Math.max(0, (applications.length - responseCount) / applications.length * 100);

        questionAnalytics.push({
          questionKey,
          label: questionLabels[questionKey] || questionKey.replace('_', ' '),
          responseCount,
          averageResponseLength: Math.round(averageResponseLength),
          commonResponses,
          dropOffRate: Math.round(dropOffRate * 100) / 100
        });
      });

      // Sort by response count (most answered first)
      questionAnalytics.sort((a, b) => b.responseCount - a.responseCount);

      return new Response(
        JSON.stringify(questionAnalytics),
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
    console.error('Error in admin-question-analytics function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});