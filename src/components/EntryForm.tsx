import { useState, useEffect } from 'react'
import type { Entry } from '../types/entry'

interface Props {
  date: string
  existing: Entry | null
  onSave: (experience: string, learning: string) => void
}

export function EntryForm({ date, existing, onSave }: Props) {
  const [experience, setExperience] = useState(existing?.experience ?? '')
  const [learning, setLearning] = useState(existing?.learning ?? '')

  useEffect(() => {
    setExperience(existing?.experience ?? '')
    setLearning(existing?.learning ?? '')
  }, [existing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!experience.trim() && !learning.trim()) return
    onSave(experience, learning)
  }

  const formatted = new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-1">{formatted}</p>
        <h2 className="text-xl font-semibold text-gray-800">今日の記録</h2>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          体験
          <span className="ml-1 text-xs text-gray-400">（今日何をしたか）</span>
        </label>
        <textarea
          value={experience}
          onChange={e => setExperience(e.target.value)}
          rows={4}
          placeholder="今日どんな体験をしましたか？"
          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          学び・気づき
          <span className="ml-1 text-xs text-gray-400">（そこから何を学んだか）</span>
        </label>
        <textarea
          value={learning}
          onChange={e => setLearning(e.target.value)}
          rows={4}
          placeholder="どんな気づきや学びがありましたか？"
          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl transition-colors"
      >
        {existing ? '更新する' : '保存する'}
      </button>
    </form>
  )
}
