import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type BroadcastPayload = Record<string, unknown>

interface UseGameSyncOptions {
  roomId: string
  onBroadcast?: (event: string, payload: BroadcastPayload) => void
  onPresenceSync?: (state: Record<string, unknown[]>) => void
  enabled?: boolean
}

export function useGameSync({
  roomId,
  onBroadcast,
  onPresenceSync,
  enabled = true,
}: UseGameSyncOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!roomId || !enabled) return

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: roomId },
      },
    })

    // Listen for broadcast messages
    channel.on('broadcast', { event: '*' }, ({ event, payload }) => {
      onBroadcast?.(event, payload as BroadcastPayload)
    })

    // Listen for presence changes
    if (onPresenceSync) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        onPresenceSync(state)
      })
    }

    channel.subscribe()
    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [roomId, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Send a broadcast event to all clients in the room
   */
  const broadcast = useCallback(
    (event: string, payload: BroadcastPayload = {}) => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event,
          payload,
        })
      }
    },
    []
  )

  /**
   * Track user presence in the room
   */
  const trackPresence = useCallback(
    (data: Record<string, unknown>) => {
      if (channelRef.current) {
        channelRef.current.track(data)
      }
    },
    []
  )

  return { broadcast, trackPresence }
}

/**
 * Listen for database changes on a table (Realtime Postgres Changes)
 */
export function useRealtimeSubscription<T>(
  table: string,
  filter: { column: string; value: string },
  onInsert?: (record: T) => void,
  onUpdate?: (record: T) => void,
  onDelete?: (record: T) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}:${filter.value}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload) => onInsert?.(payload.new as T)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload) => onUpdate?.(payload.new as T)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        (payload) => onDelete?.(payload.old as T)
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [table, filter.column, filter.value]) // eslint-disable-line react-hooks/exhaustive-deps
}
