import { useState, useCallback } from 'react'
import type { Entry } from '../types/entry'

const STORAGE_KEY = 'jornaring_entries'

function load(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(load)

  const addEntry = useCallback((
    date: string,
    experience: string,
    learning: string,
    framework?: string,
    structured?: Record<string, string>
  ) => {
    const entry: Entry = {
      id: crypto.randomUUID(),
      date,
      experience,
      learning,
      createdAt: new Date().toISOString(),
      ...(framework ? { framework, structured } : {}),
    }
    setEntries(prev => {
      const next = [entry, ...prev]
      save(next)
      return next
    })
  }, [])

  const updateEntry = useCallback((
    id: string,
    experience: string,
    learning: string,
    framework?: string,
    structured?: Record<string, string>
  ) => {
    setEntries(prev => {
      const next = prev.map(e =>
        e.id === id
          ? { ...e, experience, learning, ...(framework ? { framework, structured } : {}) }
          : e
      )
      save(next)
      return next
    })
  }, [])

  const getByDate = useCallback(
    (date: string) => entries.find(e => e.date === date) ?? null,
    [entries]
  )

  return { entries, addEntry, updateEntry, getByDate }
}
