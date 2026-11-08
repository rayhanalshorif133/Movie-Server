'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData) {
  let redirectUrl = null;

  try {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      redirectUrl = '/login?error=' + encodeURIComponent(error.message);
    } else {
      const cookieStore = await cookies()
      cookieStore.set('dummy_auth_token', 'mock_admin_token', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      })

      redirectUrl = '/admin/dashboard';
    }
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('Login action error:', err);
    redirectUrl = '/login?error=' + encodeURIComponent(err.message || 'Login failed');
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }
}

export async function logout() {
  try {
    const supabase = await createClient()
    if (supabase?.auth?.signOut) {
      await supabase.auth.signOut()
    }
  } catch (err) {
    console.error('Logout action error:', err);
  }

  const cookieStore = await cookies()
  cookieStore.delete('dummy_auth_token')

  redirect('/login')
}
