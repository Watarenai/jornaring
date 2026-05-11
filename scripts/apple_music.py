"""Apple MusicKit API クライアント。JWT 生成・曲検索・ライブラリ追加を担当する。"""

import time
from pathlib import Path

import jwt
import requests

MUSICKIT_BASE = "https://api.music.apple.com/v1"
TOKEN_TTL = 15_777_000  # 6ヶ月（秒）


class AppleMusicClient:
    def __init__(self, key_id: str, team_id: str, private_key: str, user_token: str):
        self._key_id = key_id
        self._team_id = team_id
        self._private_key = private_key
        self._user_token = user_token
        self._dev_token: str | None = None
        self._token_expiry: float = 0.0

    # ------------------------------------------------------------------ #
    # JWT                                                                  #
    # ------------------------------------------------------------------ #

    def _get_dev_token(self) -> str:
        """開発者トークンを返す。期限切れなら再生成する。"""
        now = time.time()
        if self._dev_token and now < self._token_expiry - 60:
            return self._dev_token

        payload = {
            "iss": self._team_id,
            "iat": int(now),
            "exp": int(now) + TOKEN_TTL,
        }
        self._dev_token = jwt.encode(
            payload,
            self._private_key,
            algorithm="ES256",
            headers={"kid": self._key_id},
        )
        self._token_expiry = now + TOKEN_TTL
        return self._dev_token

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self._get_dev_token()}",
            "Music-User-Token": self._user_token,
        }

    # ------------------------------------------------------------------ #
    # 検索                                                                 #
    # ------------------------------------------------------------------ #

    def search_song(self, title: str, artist: str) -> str | None:
        """
        Apple Music カタログを検索し、最初にヒットした曲の catalog ID を返す。
        見つからなければ None を返す。
        """
        query = f"{title} {artist}".strip()
        url = f"{MUSICKIT_BASE}/catalog/jp/search"
        params = {"term": query, "types": "songs", "limit": 5}

        resp = requests.get(url, headers=self._headers(), params=params, timeout=15)
        resp.raise_for_status()

        songs = resp.json().get("results", {}).get("songs", {}).get("data", [])
        if not songs:
            return None

        # タイトルが前方一致するものを優先
        title_lower = title.lower()
        for song in songs:
            attrs = song.get("attributes", {})
            if attrs.get("name", "").lower().startswith(title_lower):
                return song["id"]

        return songs[0]["id"]

    # ------------------------------------------------------------------ #
    # ライブラリ追加                                                       #
    # ------------------------------------------------------------------ #

    def add_to_library(self, catalog_id: str) -> None:
        """
        カタログ ID の曲をユーザーライブラリに追加する。
        既に追加済みでも 202 が返るだけでエラーにならない。
        失敗時は requests.HTTPError を raise する。
        """
        url = f"{MUSICKIT_BASE}/me/library"
        params = {"ids[songs]": catalog_id}
        resp = requests.post(url, headers=self._headers(), params=params, timeout=15)
        resp.raise_for_status()
