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
      // Get analytics data
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Calculate analytics
      const totalApplications = applications.length;
      
      // Applications by role
      const applicationsByRole = applications.reduce((acc, app) => {
        acc[app.role] = (acc[app.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Completion rate (assuming all fetched applications are completed)
      const completionRate = 100; // Since we only store completed applications

      // Average completion time (mock data for now)
      const averageCompletionTime = 12; // minutes

      // Drop-off points analysis
      const questionKeys = ['name', 'email', 'experience', 'technologies', 'project', 'availability'];
      const dropOffPoints = questionKeys.map((key, index) => ({
        questionKey: key,
        dropOffRate: Math.max(0, (6 - index) * 2 + Math.random() * 5) // Mock drop-off rates
      }));

      // Recent applications (last 10)
      const recentApplications = applications.slice(0, 10);

      // Top candidates (mock scoring for now)
      const topCandidates = applications
        .map(app => ({
          ...app,
          score: Math.floor(Math.random() * 40) + 60 // Mock scores between 60-100
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const analytics = {
        totalApplications,
        applicationsByRole,
        completionRate,
        averageCompletionTime,
        dropOffPoints,
        recentApplications,
        topCandidates
      };

      return new Response(
        JSON.stringify(analytics),
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
    console.error('Error in admin-analytics function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});