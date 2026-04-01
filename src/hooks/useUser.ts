'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'

const supabase = createClient()

export function useUser() {
  const {
    user,
    profile,
    role,
    isAuthReady,
    isProfileLoading,
    setUser,
    setProfile,
    setRole,
    setIsAuthReady,
    setIsProfileLoading,
    reset,
  } = useUserStore()

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  }

  useEffect(() => {
    let active = true

    // Si ya tenemos datos persistidos, no empezar desde cero
    // pero sí verificar que la sesión siga válida
    const init = async () => {
      try {
        // Si no hay auth ready, marcar que estamos verificando
        if (!isAuthReady) {
          setIsAuthReady(false)
        }

        const { data, error } = await supabase.auth.getSession()
        const session = data?.session
        const currentUser = session?.user ?? null

        if (!active) return

        if (!currentUser) {
          // No hay sesión activa
          reset()
          return
        }

        // Hay sesión: verificar si cambió el usuario
        if (currentUser.id !== user?.id) {
          // Usuario diferente, resetear y cargar todo
          setUser(currentUser)
          setRole(null)
          setProfile(null)
        }

        setIsAuthReady(true)

        // Cargar perfil solo si no lo tenemos o cambió el user
        if (!profile || currentUser.id !== user?.id) {
          setIsProfileLoading(true)
          try {
            const profileData = await loadProfile(currentUser.id)
            if (!active) return

            setProfile(profileData)
            setRole(profileData?.role || null)
          } catch (err) {
            console.error('Error cargando perfil:', err)
            setProfile(null)
            setRole(null)
          } finally {
            if (active) setIsProfileLoading(false)
          }
        }

      } catch (err) {
        console.error('INIT ERROR:', err)
        setIsAuthReady(true)
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

        // Solo actualizar si cambió
        if (currentUser.id !== user?.id) {
          setUser(currentUser)
          setIsAuthReady(true)
          setIsProfileLoading(true)

          try {
            const profileData = await loadProfile(currentUser.id)
            if (!active) return

            setProfile(profileData)
            setRole(profileData?.role || null)
          } catch (err) {
            setProfile(null)
            setRole(null)
          } finally {
            if (active) setIsProfileLoading(false)
          }
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [user?.id]) // ← dependencia clave: solo re-ejecutar si cambia el user

  const refresh = useCallback(() => {
    setIsAuthReady(false)
  }, [setIsAuthReady])

  return {
    user,
    profile,
    role,
    isAuthReady,
    isProfileLoading,
    error: null, // manejar si lo necesitas
    refresh,
  }
}