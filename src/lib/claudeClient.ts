import type { Framework } from '../data/frameworks'
import { FRAMEWORKS } from '../data/frameworks'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

export interface FrameworkSuggestion {
  frameworkId: string
  fields: Record<string, string>
}

export async function suggestFramework(
  experience: string,
  learning: string
): Promise<FrameworkSuggestion> {
  if (!API_KEY) {
    throw new Error('VITE_ANTHROPIC_API_KEY が設定されていません')
  }

  const frameworkList = FRAMEWORKS.map((f: Framework) => ({
    id: f.id,
    name: f.name,
    useCase: f.useCase,
    fields: f.fields.map(field => field.key),
  }))

  const prompt = `あなたは振り返り支援AIです。以下の体験と学びを読んで、最適な振り返りフレームワークを選択し、各フィールドの下書きを日本語で作成してください。

## 体験
${experience || '（未入力）'}

## 学び・気づき
${learning || '（未入力）'}

## 利用可能なフレームワーク
${JSON.stringify(frameworkList, null, 2)}

## 出力形式（JSONのみ返すこと）
{
  "frameworkId": "選択したフレームワークのid",
  "fields": {
    "フィールドkey": "下書きテキスト（体験の内容を踏まえた具体的な文章）"
  }
}

ルール:
- 必ずJSONのみを返すこと（説明文不要）
- フィールドの下書きは体験の内容を踏まえた具体的な文章にすること
- ユーザーが修正しやすいよう、断定的でなく示唆的な書き方にすること`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API エラー: ${response.status} ${err}`)
  }

  const data = await response.json()
  const text: string = data.content[0].text.trim()

  // JSON部分だけ抽出（```json ... ``` で囲まれる場合に対応）
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AIのレスポンスをパースできませんでした')

  return JSON.parse(jsonMatch[0]) as FrameworkSuggestion
}
