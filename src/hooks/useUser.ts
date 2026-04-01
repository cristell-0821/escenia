'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/types/database.types'

const supabase = createClient()

interface UseUserReturn {
  user: User | null
  profile: Tables<'profiles'> | null
  role: string | null
  loading: boolean
  error: Error | null
  refresh: () => void
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

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
    const init = async () => {

      try {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()
        const session = data?.session
        const user = session?.user ?? null

        if (!active) {
          return
        }

        if (!user) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setLoading(false)
          return
        }

        setUser(user)
        setLoading(false)

        const profileData = await loadProfile(user.id)

        if (!active) return

        setProfile(profileData)
        setRole(profileData?.role || null)

      } catch (err) {
        console.error('INIT ERROR:', err)
        if (active) setError(err as Error)
      } finally {
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return

        if (!session?.user) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setLoading(false)
          return
        }

        setUser(session.user)
        setLoading(true)

        try {
          const profileData = await loadProfile(session.user.id)

          if (!active) return

          setProfile(profileData)
          setRole(profileData?.role || null)
        } catch (err) {
          if (active) setError(err as Error)
        } finally {
          if (active) setLoading(false)
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshKey])

  return { user, profile, role, loading, error, refresh }
}