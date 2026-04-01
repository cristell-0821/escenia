'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'

const supabase = createClient()

interface UseUserOptions {
  loadGroup?: boolean // ← nuevo: cargar grupo o no
}

export function useUser(options: UseUserOptions = {}) {
  const { loadGroup = false } = options
  
  const {
    user, profile, role, group, groupId, membership,
    isAuthReady, isProfileLoading, isGroupLoading,
    setUser, setProfile, setRole, setGroupData, setLoading, reset, resetGroup,
  } = useUserStore()

  // Cargar perfil
  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  // En loadGroupData, cambia los nombres al retornar:
  const loadGroupData = async (userId: string) => {
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (membershipError) throw membershipError
    if (!membership?.group_id) return null

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', membership.group_id)
      .single()

    if (groupError) throw groupError

    return { membership, group } // ← group y membership, no groupData/membershipData
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        if (!isAuthReady) setLoading('auth', true)

        const { data } = await supabase.auth.getSession()
        const session = data?.session
        const currentUser = session?.user ?? null

        if (!active) return

        if (!currentUser) {
          reset()
          return
        }

        // Solo actualizar si cambió el usuario
        const userChanged = currentUser.id !== user?.id
        
        if (userChanged) {
          setUser(currentUser)
          setLoading('profile', true)
          if (loadGroup) setLoading('group', true)

          try {
            // Cargar perfil
            const profileData = await loadProfile(currentUser.id)
            if (!active) return
            
            setProfile(profileData)
            setRole(profileData?.role || null)
            setLoading('profile', false)

            // Cargar grupo si se pidió
            if (loadGroup) {
              const groupResult = await loadGroupData(currentUser.id)
              if (!active) return
              setGroupData(groupResult)
              
              setGroupData(groupResult)
              setLoading('group', false)
            }

          } catch (err) {
            console.error('Error cargando datos:', err)
            setLoading('profile', false)
            setLoading('group', false)
          }
        }

        setLoading('auth', false)

      } catch (err) {
        console.error('INIT ERROR:', err)
        setLoading('auth', false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return

        const currentUser = session?.user ?? null

        if (!currentUser) {
          reset()
          return
        }

        if (currentUser.id !== user?.id) {
          setUser(currentUser)
          setLoading('profile', true)
          if (loadGroup) setLoading('group', true)

          try {
            const profileData = await loadProfile(currentUser.id)
            if (!active) return
            setProfile(profileData)
            setRole(profileData?.role || null)

            if (loadGroup) {
              const groupResult = await loadGroupData(currentUser.id)
              if (!active) return
              setGroupData(groupResult)
            }

          } catch (err) {
            console.error('Error:', err)
          } finally {
            setLoading('profile', false)
            setLoading('group', false)
          }
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [user?.id, loadGroup])

  const refresh = useCallback(() => {
    setLoading('auth', false) // Fuerza re-carga
  }, [])

  const refreshGroup = useCallback(async () => {
    if (!user?.id) return
    setLoading('group', true)
    const result = await loadGroupData(user.id)
    setGroupData(result)
    setLoading('group', false)
  }, [user?.id])

  return {
    // Auth
    user,
    isAuthReady,
    
    // Perfil
    profile,
    role,
    isProfileLoading,
    
    // Grupo (null si no se cargó)
    group,
    groupId,
    membership,
    isGroupLoading,
    isGroupAdmin: membership?.role === 'group_admin',
    
    // Actions
    refresh,
    refreshGroup,
  }
}