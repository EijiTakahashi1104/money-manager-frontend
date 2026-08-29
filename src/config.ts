// アプリ全体で共有するランタイム設定。
// Viteの環境変数からAPIのベースURLを取得する（未設定ならローカルにフォールバック）。
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
