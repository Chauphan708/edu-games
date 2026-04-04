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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        isTeacher: session?.user?.user_metadata?.role === 'teacher',
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          isTeacher: session?.user?.user_metadata?.role === 'teacher',
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Handle LMS cross-domain token passing
   * LMS passes access_token and refresh_token in URL params
   */
  const setSessionFromUrl = async () => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

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
