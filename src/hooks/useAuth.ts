import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isTeacher: boolean
  geminiApiKey: string | null
  // Gamification fields
  coins: number
  xp: number
  level: number
  avatarConfig: any
  unlockedItems: string[]
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
      coins: 0,
      xp: 0,
      level: 1,
      avatarConfig: { base: 'default', hat: null, glasses: null, outfit: null },
      unlockedItems: [],
      setAuth: (data) => set((state) => ({ ...state, ...data })),
      clearAuth: () => set({ 
        user: null, 
        session: null, 
        isTeacher: false, 
        geminiApiKey: null, 
        loading: false,
        coins: 0,
        xp: 0,
        level: 1,
        avatarConfig: { base: 'default', hat: null, glasses: null, outfit: null },
        unlockedItems: []
      }),
    }),
    {
      name: 'edu-games-auth',
    }
  )
)

export function useAuth() {
  const { user, session, loading, isTeacher, geminiApiKey, coins, xp, level, avatarConfig, unlockedItems, setAuth, clearAuth } = useAuthStore()

  const fetchStudentProfile = async (userId: string) => {
    try {
      const { data } = await (supabase
        .from('student_gamification') as any)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setAuth({
          coins: data.coins,
          xp: data.xp,
          level: data.level,
          avatarConfig: data.avatar_config,
          unlockedItems: data.unlocked_items || []
        })
      } else {
        // Nếu chưa có profile, tạo mới
        const newProfile = {
          user_id: userId,
          coins: 0,
          xp: 0,
          level: 1,
          avatar_config: { base: 'default', hat: null, glasses: null, outfit: null },
          unlocked_items: []
        }
        await (supabase.from('student_gamification') as any).insert(newProfile)
        setAuth(newProfile as any)
      }
    } catch (err) {
      console.error("Error fetching student profile:", err)
    }
  }

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

        if (payload.role !== 'teacher') {
          fetchStudentProfile(payload.id)
        }

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

  useEffect(() => {
    if (!user && !loading) {
      setSessionFromUrl()
    } else if (user && !isTeacher) {
      fetchStudentProfile(user.id)
    }
  }, [user, loading, isTeacher])

  return {
    user,
    session,
    loading,
    isTeacher,
    geminiApiKey,
    setAuth,
    clearAuth,
    setSessionFromUrl,
    signOut,
    fetchStudentProfile,
    coins,
    xp,
    level,
    avatarConfig,
    unlockedItems
  }
}
