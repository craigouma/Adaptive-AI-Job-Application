interface AdminUser {
  id: string;
  email: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  user?: AdminUser;
  error?: string;
}

const getApiBaseUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }
  return `${supabaseUrl}/functions/v1`;
};

const getAuthHeaders = () => {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error('Supabase anonymous key not configured');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`,
  };
};

export const adminAuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/admin-login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: errorText || 'Login failed' };
      }

      const result = await response.json();
      
      if (result.success && result.user) {
        // Store admin session
        localStorage.setItem('adminUser', JSON.stringify(result.user));
        localStorage.setItem('adminToken', result.token || 'admin-session');
        return { success: true, user: result.user };
      }

      return { success: false, error: result.error || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  logout(): void {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  },

  getCurrentUser(): AdminUser | null {
    try {
      const userStr = localStorage.getItem('adminUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!localStorage.getItem('adminToken');
  }
};