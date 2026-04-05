import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isTeacher: boolean
  geminiApiKey: string | null
  setAuth: (data: Partial<AuthState>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      isTeacher: false,
      geminiApiKey: null,
      setAuth: (data) => set((state) => ({ ...state, ...data })),
      clearAuth: () => set({ user: null, session: null, isTeacher: false, geminiApiKey: null, loading: false }),
    }),
    {
      name: 'edu-games-auth',
    }
  )
)

export function useAuth() {
  const { user, session, loading, isTeacher, geminiApiKey, setAuth, clearAuth } = useAuthStore()

  const setSessionFromUrl = async () => {
    const params = new URLSearchParams(window.location.search)
    const lmsToken = params.get('lms_token')

    if (lmsToken) {
      try {
        const payload = JSON.parse(decodeURIComponent(atob(lmsToken)))
        
        // Tạo Session Ảo
        const virtualUser = {
          id: payload.id,
          email: payload.email,
          user_metadata: { 
            name: payload.name, 
            role: payload.role, 
            class_id: payload.class_id,
            gemini_api_key: payload.gemini_api_key // Nhận key từ LMS
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as unknown as User;

        setAuth({
          user: virtualUser,
          session: { user: virtualUser, access_token: 'lms-virtual-token', refresh_token: '', expires_in: 9999, token_type: 'bearer' },
          loading: false,
          isTeacher: payload.role === 'teacher',
          geminiApiKey: payload.gemini_api_key || null
        })

        // Xóa lms_token khỏi URL
        const cleanUrl = new URL(window.location.href)
        cleanUrl.searchParams.delete('lms_token')
        window.history.replaceState({}, '', cleanUrl.toString())
        return true
      } catch (err) {
        console.error("Failed to parse LMS user token", err)
      }
    }
    return false
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    clearAuth()
  }

  return { 
    user, 
    session, 
    loading, 
    isTeacher, 
    geminiApiKey,
    setAuth, 
    clearAuth,
    setSessionFromUrl,
    signOut
  }
}
