"""
Step 1 確認スクリプト: YouTube Music のいいね曲リストを取得して表示する。
本番では sync.py から呼び出す。

使い方:
  1. YTM_COOKIE 環境変数をセットする（GitHub Secrets と同じ値）
  2. python scripts/fetch_liked_songs.py
"""

import json
import os
import sys
from pathlib import Path

try:
    from ytmusicapi import YTMusic
except ImportError:
    print("ERROR: ytmusicapi がインストールされていません。")
    print("  pip install ytmusicapi")
    sys.exit(1)


AUTH_FILE = Path(__file__).parent / "ytm_auth.json"


def build_auth_headers(cookie: str) -> dict:
    """Cookie 文字列から ytmusicapi 用の認証ヘッダー dict を組み立てる。"""
    return {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "*/*",
        "Accept-Language": "ja,en;q=0.9",
        "Content-Type": "application/json",
        "Cookie": cookie,
        "X-Goog-AuthUser": "0",
        "x-origin": "https://music.youtube.com",
    }


def get_ytmusic_client() -> YTMusic:
    """
    YTMusic クライアントを返す。
    環境変数 YTM_COOKIE があればそれを使い、なければ AUTH_FILE を使う。
    """
    cookie = os.environ.get("YTM_COOKIE", "").strip()

    if cookie:
        headers = build_auth_headers(cookie)
        # ytmusicapi は dict を直接受け付ける
        return YTMusic(auth=headers)

    if AUTH_FILE.exists():
        return YTMusic(auth=str(AUTH_FILE))

    print("ERROR: 認証情報が見つかりません。")
    print("  YTM_COOKIE 環境変数をセットするか、scripts/ytm_auth.json を配置してください。")
    sys.exit(1)


def fetch_liked_songs(ytmusic: YTMusic) -> list[dict]:
    """いいね曲を全件取得して返す。"""
    results = []
    limit = 100  # 1 回の API 呼び出しで取得する件数
    continuation = None

    while True:
        if continuation is None:
            batch = ytmusic.get_liked_songs(limit=limit)
        else:
            # get_liked_songs は continuation をサポートしていないため
            # playlist として取得する（playlistId = "LM" が liked songs）
            batch = ytmusic.get_playlist("LM", limit=limit, continuation=continuation)

        tracks = batch.get("tracks", [])
        results.extend(tracks)

        continuation = batch.get("continuation")
        if not continuation or not tracks:
            break

    return results


def main():
    print("YouTube Music のいいね曲を取得します...\n")

    ytmusic = get_ytmusic_client()
    songs = fetch_liked_songs(ytmusic)

    if not songs:
        print("いいね曲が見つかりませんでした。")
        return

    print(f"取得件数: {len(songs)} 曲\n")
    print(f"{'#':<5} {'タイトル':<40} {'アーティスト':<30} {'videoId'}")
    print("-" * 100)
    for i, track in enumerate(songs[:20], 1):
        title = (track.get("title") or "")[:38]
        artists = ", ".join(
            a.get("name", "") for a in (track.get("artists") or [])
        )[:28]
        video_id = track.get("videoId") or ""
        print(f"{i:<5} {title:<40} {artists:<30} {video_id}")

    if len(songs) > 20:
        print(f"  ... 残り {len(songs) - 20} 曲（省略）")

    # JSON で保存（デバッグ用）
    out_path = Path(__file__).parent / "liked_songs_debug.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    print(f"\nデバッグ用の全データを {out_path} に保存しました。")


if __name__ == "__main__":
    main()
