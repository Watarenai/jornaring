import { useState } from 'react'
import { FRAMEWORKS } from '../data/frameworks'
import type { FrameworkSuggestion } from '../lib/claudeClient'

interface Props {
  suggestion: FrameworkSuggestion
  onSave: (frameworkId: string, fields: Record<string, string>) => void
  onDiscard: () => void
}

export function FrameworkPanel({ suggestion, onSave, onDiscard }: Props) {
  const framework = FRAMEWORKS.find(f => f.id === suggestion.frameworkId) ?? FRAMEWORKS[0]
  const [fields, setFields] = useState<Record<string, string>>(suggestion.fields)

  const handleChange = (key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-indigo-500 font-medium mb-0.5">AIが提案するフレームワーク</p>
          <h3 className="text-base font-semibold text-gray-800">{framework.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{framework.useCase}</p>
        </div>
        <button
          onClick={onDiscard}
          className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
        >
          使わない
        </button>
      </div>

      <div className="space-y-3">
        {framework.fields.map(field => (
          <div key={field.key} className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">{field.label}</label>
            <textarea
              value={fields[field.key] ?? ''}
              onChange={e => handleChange(field.key, e.target.value)}
              rows={2}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave(framework.id, fields)}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
      >
        この振り返りを保存する
      </button>
    </div>
  )
}
