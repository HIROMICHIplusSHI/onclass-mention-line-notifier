// 「どこまで通知したか」を state.json に記録する。
// これにより、既読/未読に関係なく "新しいメンションだけ" を1回ずつ通知できる。

import { readFile, writeFile } from "node:fs/promises";

const STATE_FILE = "state.json";

/**
 * 状態を読み込む。ファイルが無ければ初期状態を返す。
 * @returns {Promise<{ lastNotifiedAt: string | null }>}
 */
export async function loadState() {
  try {
    const raw = await readFile(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    // 初回はファイルが無いので初期状態
    return { lastNotifiedAt: null };
  }
}

/**
 * 状態を保存する。
 * @param {{ lastNotifiedAt: string | null }} state
 */
export async function saveState(state) {
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}
