import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Simple password verification (in production, use proper bcrypt)
function verifyPassword(password: string, hash: string): boolean {
  // For demo purposes, we'll use a simple comparison
  // In production, use proper bcrypt verification
  const demoHash = '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK';
  return hash === demoHash && password === 'password123';
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
      const { email, password } = await req.json();

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, error: 'Email and password are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // For demo purposes, check against the default admin credentials
      if (email === 'craigcarlos95@gmail.com' && password === 'password123') {
        const adminUser = {
          id: 'admin-001',
          email: 'craigcarlos95@gmail.com',
          role: 'admin'
        };

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: adminUser,
            token: 'admin-session-token'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try to find user in database (for future expansion)
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Verify password
      if (!verifyPassword(password, user.password_hash)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Return user data (excluding password hash)
      const { password_hash, ...userWithoutPassword } = user;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: userWithoutPassword,
          token: 'admin-session-token'
        }),
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
    console.error('Error in admin-login function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});