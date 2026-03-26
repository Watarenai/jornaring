import { useState } from 'react'
import { EntryForm } from './components/EntryForm'
import { EntryList } from './components/EntryList'
import { useEntries } from './hooks/useEntries'

type Tab = 'today' | 'history'

function todayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [saved, setSaved] = useState(false)
  const { entries, addEntry, updateEntry, getByDate } = useEntries()

  const today = todayDate()
  const existing = getByDate(today)

  const handleSave = (experience: string, learning: string) => {
    if (existing) {
      updateEntry(existing.id, experience, learning)
    } else {
      addEntry(today, experience, learning)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-indigo-600 tracking-tight">Jornaring</h1>
          <p className="text-xs text-gray-400">体験から学びをストック</p>
        </div>

        <div className="max-w-lg mx-auto px-4 pb-0 flex gap-1">
          <button
            onClick={() => setTab('today')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'today'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            今日
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            振り返り
            {entries.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                {entries.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {tab === 'today' ? (
          <div>
            {saved && (
              <div className="mb-4 bg-green-50 text-green-700 text-sm rounded-xl px-4 py-2.5 text-center">
                保存しました
              </div>
            )}
            <EntryForm date={today} existing={existing} onSave={handleSave} />
          </div>
        ) : (
          <EntryList entries={entries} />
        )}
      </main>
    </div>
  )
}
