import type { Entry } from '../types/entry'
import { FRAMEWORKS } from '../data/frameworks'

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

  const framework = entry.framework
    ? FRAMEWORKS.find(f => f.id === entry.framework)
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-indigo-400">{formatted}</p>
        {framework && (
          <span className="text-xs bg-indigo-50 text-indigo-500 rounded-full px-2 py-0.5">
            {framework.name}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">体験</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{entry.experience || '—'}</p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">学び・気づき</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.learning || '—'}</p>
      </div>

      {framework && entry.structured && (
        <div className="border-t border-gray-50 pt-3 space-y-2">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
            {framework.name} 振り返り
          </p>
          {framework.fields.map(field => (
            entry.structured?.[field.key] ? (
              <div key={field.key} className="space-y-0.5">
                <p className="text-xs text-gray-400">{field.label}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.structured[field.key]}</p>
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}
