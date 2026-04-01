import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/types/database.types'

interface UserState {
  // Auth
  user: User | null
  isAuthReady: boolean
  
  // Perfil (profiles)
  profile: Tables<'profiles'> | null
  role: string | null
  isProfileLoading: boolean
  
  // Grupo (group_members + groups)
  group: Tables<'groups'> | null
  groupId: string | null
  membership: Tables<'group_members'> | null
  isGroupLoading: boolean
  
  // Acciones
  setUser: (user: User | null) => void
  setProfile: (profile: Tables<'profiles'> | null) => void
  setRole: (role: string | null) => void
  setGroupData: (data: { 
    group: Tables<'groups'> | null
    membership: Tables<'group_members'> | null 
  } | null) => void
  setLoading: (type: 'auth' | 'profile' | 'group', loading: boolean) => void
  reset: () => void
  resetGroup: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      role: null,
      group: null,
      groupId: null,
      membership: null,
      isAuthReady: false,
      isProfileLoading: false,
      isGroupLoading: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setRole: (role) => set({ role }),
      
      setGroupData: (data) => set({
        group: data?.group ?? null,
        groupId: data?.membership?.group_id ?? null,
        membership: data?.membership ?? null,
      }),
      
      setLoading: (type, loading) => set({
        ...(type === 'auth' && { isAuthReady: !loading }),
        ...(type === 'profile' && { isProfileLoading: loading }),
        ...(type === 'group' && { isGroupLoading: loading }),
      }),
      
      reset: () => set({
        user: null,
        profile: null,
        role: null,
        group: null,
        groupId: null,
        membership: null,
        isAuthReady: true,
        isProfileLoading: false,
        isGroupLoading: false,
      }),
      
      resetGroup: () => set({
        group: null,
        groupId: null,
        membership: null,
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user,
        role: state.role,
        group: state.group,
        groupId: state.groupId,
        membership: state.membership,
        isAuthReady: state.isAuthReady,
      }),
    }
  )
)