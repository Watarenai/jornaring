import { EntryCard } from './EntryCard'
import type { Entry } from '../types/entry'

interface Props {
  entries: Entry[]
}

export function EntryList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📖</p>
        <p className="text-sm">まだ記録がありません</p>
        <p className="text-xs mt-1">「今日」タブから最初の学びを記録しましょう</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
