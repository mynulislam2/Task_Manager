import { supabase } from '../../lib/supabase';

interface SignUpParams { name: string; email: string; password: string }
interface SignInParams { email: string; password: string }

export const authService = {
  signUp: async ({ name, email, password }: SignUpParams) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    await supabase.from('profiles').insert({
      id: data.user!.id, name, email, currency: 'USD',
    });
    return data;
  },

  signIn: async ({ email, password }: SignInParams) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};