'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

const supabase = createClient()

interface UseGroupReturn {
  group: Tables<'groups'> | null
  groupId: string | null
  membership: Tables<'group_members'> | null
  loading: boolean
  error: Error | null
  isAdmin: boolean
  refresh: () => void
}

export function useGroup(): UseGroupReturn {
  const [group, setGroup] = useState<Tables<'groups'> | null>(null)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [membership, setMembership] = useState<Tables<'group_members'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const resetState = () => {
    setGroup(null)
    setGroupId(null)
    setMembership(null)
  }

  const loadGroupData = async (userId: string) => {
    // 1. membership
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (membershipError) throw membershipError
    if (!membershipData?.group_id) return null

    // 2. group
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', membershipData.group_id)
      .single()

    if (groupError) throw groupError

    return { membershipData, groupData }
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!active) return

        if (!user) {
          resetState()
          return
        }

        const result = await loadGroupData(user.id)

        if (!active) return

        if (!result) {
          resetState()
          return
        }

        setMembership(result.membershipData)
        setGroup(result.groupData)
        setGroupId(result.membershipData.group_id)

      } catch (err) {
        if (active) setError(err as Error)
      } finally {
        if (active) setLoading(false)
      }
    }

    init()

    // 🔥 IMPORTANTE: escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return

        if (!session?.user) {
          resetState()
          return
        }

        try {
          const result = await loadGroupData(session.user.id)

          if (!active) return

          if (!result) {
            resetState()
            return
          }

          setMembership(result.membershipData)
          setGroup(result.groupData)
          setGroupId(result.membershipData.group_id)

        } catch (err) {
          if (active) setError(err as Error)
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [refreshKey])

  const isAdmin = membership?.role === 'group_admin'

  return { group, groupId, membership, loading, error, isAdmin, refresh }
}