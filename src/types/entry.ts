export interface Entry {
  id: string
  date: string                          // "YYYY-MM-DD"
  experience: string                    // 今日の体験
  learning: string                      // 気づき・学び
  createdAt: string                     // ISO timestamp
  framework?: string                    // 使用した振り返りフレームワークのID
  structured?: Record<string, string>  // フレームワークの各フィールドの内容
}
