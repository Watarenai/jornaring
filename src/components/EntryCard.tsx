import type { Entry } from '../types/entry'

interface Props {
  entry: Entry
}

export function EntryCard({ entry }: Props) {
  const formatted = new Date(entry.date + 'T00:00:00').toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <p className="text-xs font-medium text-indigo-400">{formatted}</p>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">体験</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{entry.experience || '—'}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">学び・気づき</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.learning || '—'}</p>
      </div>
    </div>
  )
}
