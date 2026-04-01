import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/types/database.types'

interface UserState {
  // Datos
  user: User | null
  profile: Tables<'profiles'> | null
  role: string | null
  
  // Estados de carga
  isAuthReady: boolean
  isProfileLoading: boolean
  
  // Acciones
  setUser: (user: User | null) => void
  setProfile: (profile: Tables<'profiles'> | null) => void
  setRole: (role: string | null) => void
  setIsAuthReady: (ready: boolean) => void
  setIsProfileLoading: (loading: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      role: null,
      isAuthReady: false,
      isProfileLoading: false,
      
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setRole: (role) => set({ role }),
      setIsAuthReady: (ready) => set({ isAuthReady: ready }),
      setIsProfileLoading: (loading) => set({ isProfileLoading: loading }),
      reset: () => set({ 
        user: null, 
        profile: null, 
        role: null, 
        isAuthReady: true, 
        isProfileLoading: false 
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        // Solo persistir lo necesario para evitar flash
        user: state.user,
        role: state.role,
        isAuthReady: state.isAuthReady,
      }),
    }
  )
)