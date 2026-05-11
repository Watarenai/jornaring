"""
YouTube Music いいね → Apple Music 自動同期スクリプト。

動作フロー:
  1. YTMusic からいいね曲を全件取得
  2. synced_songs.json と差分チェック（未追加の曲だけ処理）
  3. Apple MusicKit API で検索 → ライブラリ追加
  4. 追加成功した曲のみ synced_songs.json に記録
  5. 失敗した曲はログ出力してスキップ（翌日リトライ）
"""

import json
import os
import sys
import time
from datetime import date
from pathlib import Path

try:
    from ytmusicapi import YTMusic
except ImportError:
    print("ERROR: ytmusicapi がインストールされていません: pip install ytmusicapi")
    sys.exit(1)

try:
    import requests
    import jwt  # noqa: F401 (import check)
except ImportError:
    print("ERROR: 依存ライブラリが不足しています: pip install -r requirements.txt")
    sys.exit(1)

from scripts.apple_music import AppleMusicClient

SYNCED_FILE = Path(__file__).parent / "synced_songs.json"
RETRY_DELAY = 2  # 秒（Apple Music API への連続リクエストの間隔）


# ------------------------------------------------------------------ #
# 認証                                                                #
# ------------------------------------------------------------------ #

def _require_env(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        print(f"ERROR: 環境変数 {name} がセットされていません。")
        sys.exit(1)
    return val


def build_ytmusic_client() -> YTMusic:
    cookie = _require_env("YTM_COOKIE")
    headers = {
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
    return YTMusic(auth=headers)


def build_apple_client() -> AppleMusicClient:
    return AppleMusicClient(
        key_id=_require_env("APPLE_KEY_ID"),
        team_id=_require_env("APPLE_TEAM_ID"),
        private_key=_require_env("APPLE_PRIVATE_KEY"),
        user_token=_require_env("APPLE_MUSIC_USER_TOKEN"),
    )


# ------------------------------------------------------------------ #
# synced_songs.json 読み書き                                          #
# ------------------------------------------------------------------ #

def load_synced() -> dict:
    if SYNCED_FILE.exists():
        with SYNCED_FILE.open(encoding="utf-8") as f:
            return json.load(f)
    return {"last_synced": "", "synced_ids": []}


def save_synced(data: dict) -> None:
    data["last_synced"] = date.today().isoformat()
    with SYNCED_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ------------------------------------------------------------------ #
# YTMusic いいね取得                                                  #
# ------------------------------------------------------------------ #

def fetch_liked_songs(ytmusic: YTMusic) -> list[dict]:
    """いいね曲を全件取得して返す。"""
    results = []
    limit = 100
    continuation = None

    while True:
        if continuation is None:
            batch = ytmusic.get_liked_songs(limit=limit)
        else:
            batch = ytmusic.get_playlist("LM", limit=limit, continuation=continuation)

        tracks = batch.get("tracks", [])
        results.extend(tracks)

        continuation = batch.get("continuation")
        if not continuation or not tracks:
            break

    return results


# ------------------------------------------------------------------ #
# メイン同期処理                                                      #
# ------------------------------------------------------------------ #

def sync() -> None:
    print("=== YouTube Music → Apple Music 同期開始 ===")

    ytmusic = build_ytmusic_client()
    apple = build_apple_client()
    synced = load_synced()
    already_synced: set[str] = set(synced["synced_ids"])

    # YTMusic からいいね曲を全件取得
    print("YTMusic からいいね曲を取得中...")
    liked_songs = fetch_liked_songs(ytmusic)
    print(f"取得件数: {len(liked_songs)} 曲")

    # 差分チェック
    new_songs = [
        s for s in liked_songs
        if s.get("videoId") and s["videoId"] not in already_synced
    ]
    print(f"未同期の曲: {len(new_songs)} 曲")

    if not new_songs:
        print("同期対象なし。終了します。")
        save_synced(synced)
        return

    succeeded = 0
    failed = 0

    for track in new_songs:
        video_id = track["videoId"]
        title = track.get("title") or ""
        artists = ", ".join(a.get("name", "") for a in (track.get("artists") or []))

        print(f"処理中: {title} / {artists} ({video_id})")

        try:
            # Apple Music で検索
            catalog_id = apple.search_song(title, artists)
            if catalog_id is None:
                print(f"  [WARN] 検索結果なし: '{title}' by '{artists}' → スキップ（翌日リトライ）")
                failed += 1
                continue

            # ライブラリに追加
            apple.add_to_library(catalog_id)
            synced["synced_ids"].append(video_id)
            print(f"  [OK] 追加成功: catalog_id={catalog_id}")
            succeeded += 1

        except requests.HTTPError as e:
            status = e.response.status_code if e.response is not None else "?"
            print(f"  [ERROR] HTTP {status}: {title} / {artists} → スキップ（翌日リトライ）")
            print(f"          詳細: {e}")
            failed += 1

        except Exception as e:
            print(f"  [ERROR] 予期せぬエラー: {title} / {artists} → スキップ（翌日リトライ）")
            print(f"          詳細: {e}")
            failed += 1

        time.sleep(RETRY_DELAY)

    # 成功した曲のみ synced_songs.json に保存
    save_synced(synced)

    print("\n=== 同期完了 ===")
    print(f"成功: {succeeded} 曲 / 失敗: {failed} 曲")
    if failed > 0:
        print("失敗した曲は翌日の実行時に再試行されます。")


if __name__ == "__main__":
    sync()
