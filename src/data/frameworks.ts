export interface FrameworkField {
  key: string
  label: string
  placeholder: string
}

export interface Framework {
  id: string
  name: string
  description: string
  useCase: string
  fields: FrameworkField[]
}

export const FRAMEWORKS: Framework[] = [
  {
    id: 'kpt',
    name: 'KPT',
    description: 'Keep・Problem・Tryで行動を振り返る',
    useCase: '日常業務・チーム活動の振り返りに最適',
    fields: [
      { key: 'keep', label: 'Keep（続けること）', placeholder: '良かったこと、続けたいこと' },
      { key: 'problem', label: 'Problem（課題）', placeholder: '改善が必要なこと、うまくいかなかったこと' },
      { key: 'try', label: 'Try（次にやること）', placeholder: '次回試したいこと、具体的なアクション' },
    ],
  },
  {
    id: 'five-whys',
    name: '5 Whys（なぜなぜ分析）',
    description: '「なぜ？」を5回繰り返して根本原因を探る',
    useCase: '失敗・問題の根本原因を深掘りしたいときに',
    fields: [
      { key: 'why1', label: 'なぜ1（第1の問い）', placeholder: 'なぜそれが起きたのか？' },
      { key: 'why2', label: 'なぜ2（第2の問い）', placeholder: 'その原因はなぜ？' },
      { key: 'why3', label: 'なぜ3（第3の問い）', placeholder: 'さらに掘り下げると？' },
      { key: 'why4', label: 'なぜ4（第4の問い）', placeholder: 'もう一段深く考えると？' },
      { key: 'root', label: '根本原因', placeholder: '最終的に行き着いた本質的な原因' },
    ],
  },
  {
    id: 'cornell',
    name: 'コーネルノート式',
    description: 'メモ・キーワード・サマリーで学びを定着させる',
    useCase: '学習・読書・講義の内容を整理して定着させたいときに',
    fields: [
      { key: 'notes', label: 'メモ（詳細な内容）', placeholder: '体験・学習で得た情報をそのまま書く' },
      { key: 'keywords', label: 'キーワード・問い', placeholder: '重要な概念や、自分への問いかけ' },
      { key: 'summary', label: 'サマリー（要約）', placeholder: '自分の言葉で一言まとめると？' },
    ],
  },
  {
    id: 'aar',
    name: 'AAR（After Action Review）',
    description: '目標・実績・差異・教訓の4ステップで振り返る',
    useCase: 'プロジェクト・イベント終了後の包括的振り返りに',
    fields: [
      { key: 'intended', label: '目標・意図（何を達成しようとしたか）', placeholder: '最初に目指していたこと' },
      { key: 'actual', label: '実際の結果（何が起きたか）', placeholder: '実際に起きたこと・達成できたこと' },
      { key: 'gap', label: '差異（なぜ違いが生まれたか）', placeholder: '目標と結果の差の原因' },
      { key: 'lesson', label: '教訓（次に活かすこと）', placeholder: '今後に持ち越す具体的な学び' },
    ],
  },
]
