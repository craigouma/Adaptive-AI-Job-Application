import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

function generateCSV(applications: any[]) {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Role',
    'Experience',
    'Status',
    'Score',
    'Applied Date',
    'Technologies/Tools',
    'Project Description',
    'Availability'
  ];

  const rows = applications.map(app => {
    const answers = app.answers.reduce((acc: any, answer: any) => {
      acc[answer.key] = answer.value;
      return acc;
    }, {});

    return [
      app.id,
      answers.name || '',
      answers.email || '',
      app.role,
      answers.experience || '',
      app.status || 'pending',
      app.score || '',
      new Date(app.created_at).toLocaleDateString(),
      answers.technologies || answers.design_tools || '',
      answers.project || answers.design_process || answers.challenging_project || '',
      answers.availability || ''
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

function generatePDF(applications: any[]) {
  // For now, return a simple text-based report
  // In a real implementation, you'd use a PDF library
  let content = `JOB APPLICATIONS REPORT
Generated: ${new Date().toLocaleString()}
Total Applications: ${applications.length}

`;

  applications.forEach((app, index) => {
    const answers = app.answers.reduce((acc: any, answer: any) => {
      acc[answer.key] = answer.value;
      return acc;
    }, {});

    content += `
APPLICATION #${index + 1}
=====================================
ID: ${app.id}
Name: ${answers.name || 'N/A'}
Email: ${answers.email || 'N/A'}
Role: ${app.role}
Experience: ${answers.experience || 'N/A'}
Status: ${app.status || 'pending'}
Score: ${app.score || 'Not scored'}
Applied: ${new Date(app.created_at).toLocaleDateString()}

Technologies/Tools: ${answers.technologies || answers.design_tools || 'N/A'}

Project Description:
${answers.project || answers.design_process || answers.challenging_project || 'N/A'}

Availability: ${answers.availability || 'N/A'}

`;
  });

  return content;
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

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const format = url.searchParams.get('format') || 'csv';
      const role = url.searchParams.get('role');
      const status = url.searchParams.get('status');

      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (role) {
        query = query.eq('role', role);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: applications, error } = await query;

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      let content: string;
      let contentType: string;
      let filename: string;

      if (format === 'pdf') {
        content = generatePDF(applications || []);
        contentType = 'text/plain'; // Would be 'application/pdf' with a real PDF library
        filename = `applications_${new Date().toISOString().split('T')[0]}.txt`;
      } else {
        content = generateCSV(applications || []);
        contentType = 'text/csv';
        filename = `applications_${new Date().toISOString().split('T')[0]}.csv`;
      }

      return new Response(content, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in admin-export function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});