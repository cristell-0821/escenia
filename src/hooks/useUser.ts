// hooks/useUser.ts
'use client'

import { useEffect, useCallback, useState } from 'react'
import { useUserStore } from '@/stores/userStore'
import { createClient } from '@/lib/supabase/client'

interface UseUserOptions {
  loadGroup?: boolean
}

export function useUser(options: UseUserOptions = {}) {
  const { loadGroup = false } = options
  const [supabase] = useState(() => createClient())

  const {
    user, profile, role, group, groupId, membership,
    isAuthReady, isProfileLoading, isGroupLoading,
  } = useUserStore()

  const setUser = useUserStore((state) => state.setUser)
  const setProfile = useUserStore((state) => state.setProfile)
  const setRole = useUserStore((state) => state.setRole)
  const setGroupData = useUserStore((state) => state.setGroupData)
  const setLoading = useUserStore((state) => state.setLoading)
  const reset = useUserStore((state) => state.reset)

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    return data
  }, [])

  const loadGroupData = useCallback(async (userId: string) => {
    const { data: membershipData } = await supabase
      .from('group_members').select('*').eq('user_id', userId).maybeSingle()
    if (!membershipData?.group_id) return null

    const { data: groupData } = await supabase
      .from('groups').select('*').eq('id', membershipData.group_id).single()

    return { membership: membershipData, group: groupData }
  }, [])

  useEffect(() => {
    let active = true

    const init = async () => {
      // ✅ CORREGIDO: Verificar que tengamos user Y role
      if (isAuthReady && user && role) return
      
      setLoading('auth', true)
      const { data } = await supabase.auth.getSession()
      const currentUser = data?.session?.user ?? null

      if (!active) return
      if (!currentUser) { reset(); setLoading('auth', false); return }

      // Si cambió el usuario o no tenemos perfil, cargar todo
      const needsProfile = currentUser.id !== user?.id || !profile
      
      if (needsProfile) {
        setUser(currentUser)
        setLoading('profile', true)
        if (loadGroup) setLoading('group', true)

        try {
          const profileData = await loadProfile(currentUser.id)
          if (!active) return
          
          setProfile(profileData)
          setRole(profileData?.role || null)
          setLoading('profile', false)

          if (loadGroup) {
            const groupResult = await loadGroupData(currentUser.id)
            if (!active) return
            setGroupData(groupResult)
            setLoading('group', false)
          }
        } catch (err) {
          console.error('Error loading profile:', err)
          setLoading('profile', false)
          setLoading('group', false)
        }
      }
      
      setLoading('auth', false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return
        const currentUser = session?.user ?? null
        if (!currentUser) { reset(); return }
        
        if (currentUser.id !== user?.id) {
          setUser(currentUser)
          setLoading('profile', true)
          if (loadGroup) setLoading('group', true)

          try {
            const profileData = await loadProfile(currentUser.id)
            setProfile(profileData)
            setRole(profileData?.role || null)

            if (loadGroup) {
              const groupResult = await loadGroupData(currentUser.id)
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

    return () => { active = false; subscription.unsubscribe() }
  }, [user?.id, loadGroup, isAuthReady, role, profile]) // ✅ Agregué role y profile a deps

  const refresh = useCallback(() => {
    setLoading('auth', true)
    setLoading('auth', false)
  }, [])

  const refreshGroup = useCallback(async () => {
    if (!user?.id) return
    setLoading('group', true)
    const result = await loadGroupData(user.id)
    setGroupData(result)
    setLoading('group', false)
  }, [user?.id])

  return {
    user, isAuthReady, profile, role, isProfileLoading,
    group, groupId, membership, isGroupLoading,
    isGroupAdmin: membership?.role === 'group_admin',
    showPanel: isAuthReady && !isProfileLoading && !!role,
    refresh, refreshGroup,
  }
}