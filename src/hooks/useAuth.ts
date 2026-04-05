import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isTeacher: boolean
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>
  setSessionFromUrl: () => Promise<void>
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isTeacher: false,
  })

  useEffect(() => {
    // Check URL for LMS token first
    const params = new URLSearchParams(window.location.search);
    const lmsToken = params.get('lms_token');
    
    if (lmsToken) {
      setSessionFromUrl(); // This will handle the virtual session and set state
      return;
    }

    // Otherwise, get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState({
          user: session.user,
          session,
          loading: false,
          isTeacher: session.user.user_metadata?.role === 'teacher',
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setState({
            user: session.user,
            session,
            loading: false,
            isTeacher: session.user.user_metadata?.role === 'teacher',
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Handle LMS cross-domain token passing
   * LMS passes access_token and refresh_token in URL params
   */
  const setSessionFromUrl = async () => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const lmsToken = params.get('lms_token')

    if (lmsToken) {
      try {
        const payload = JSON.parse(decodeURIComponent(atob(lmsToken)))
        // Tạo Session Ảo
        const virtualUser = {
          id: payload.id,
          email: payload.email,
          user_metadata: { name: payload.name, role: payload.role, class_id: payload.class_id },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as unknown as User;

        setState({
          user: virtualUser,
          session: { user: virtualUser, access_token: 'lms-virtual-token', refresh_token: '', expires_in: 9999, token_type: 'bearer' },
          loading: false,
          isTeacher: payload.role === 'teacher',
        })

        // Xóa lms_token khỏi URL
        const cleanUrl = new URL(window.location.href)
        cleanUrl.searchParams.delete('lms_token')
        window.history.replaceState({}, '', cleanUrl.toString())
        return; // Dừng thực thi các logic auth khác
      } catch (err) {
        console.error("Failed to parse LMS user token", err)
      }
    }

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (!error && data.session) {
        // Remove tokens from URL for security
        const cleanUrl = new URL(window.location.href)
        cleanUrl.searchParams.delete('access_token')
        cleanUrl.searchParams.delete('refresh_token')
        window.history.replaceState({}, '', cleanUrl.toString())
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { ...state, signOut, setSessionFromUrl }
}
