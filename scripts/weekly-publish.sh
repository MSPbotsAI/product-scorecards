#!/bin/bash
#
# Weekly refresh + publish of the AI Ticket Intake client-engagement report.
#
# Runs every Wednesday 14:30 Asia/Shanghai, ahead of the Thursday 10:30 Product-Platform L10.
# Installed as the launchd agent `ai.mspbots.scorecard.weekly-publish` (see the .plist next to this
# script). Log: /tmp/scorecard-weekly-publish.log
#
# What it does, and what it deliberately does NOT do:
#
#   ① regenerate the snapshot from the ATI docs repo   — automated here
#   ② type-check                                        — automated here, and a hard gate: a failure
#                                                         aborts before anything is published
#   ③ build                                             — automated here
#   ④ publish to npm.mspbots.ai                         — automated here (auth lives in ~/.npmrc)
#   ⑤ raise the version on the platform                 — CANNOT be automated: it is a click on the
#                                                         "New Version" badge at agent.mspbots.ai/apps,
#                                                         and mspack has no command for it
#
# So the last step is a person's job. That is why this script ends in a notification rather than a
# silent success — an unnoticed run leaves L10 looking at last week's numbers, which is the exact
# failure this schedule exists to prevent.
#
# Usage:
#   weekly-publish.sh              # the real thing
#   weekly-publish.sh --dry-run    # everything except the publish (safe to run any time)

set -uo pipefail

REPO="/Users/noahbombom/AIcursor/product scorecard/product-scorecards"
ATI_SOURCE="/Users/noahbombom/AIcursor/ai after hours call/AI-after-hours-call-docs/timeline/intake-client-meetings.json"
APPS_URL="https://agent.mspbots.ai/apps"

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

# launchd starts from a bare environment — no shell profile, so no nvm on PATH. Resolve the node bin
# directory rather than hard-coding one version, so an nvm upgrade doesn't silently break the job.
#
# Pick the newest version that actually carries pnpm, not simply the newest installed: pnpm is a
# global install and does not follow an `nvm install`, so this Mac's newest node (v24.14.0) has none
# while v24.11.1 does. Choosing by version alone would put a pnpm-less bin dir on PATH and the job
# would die at the first `pnpm` call.
NVM_BIN=""
if [ -d "$HOME/.nvm/versions/node" ]; then
    for v in $(/bin/ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | sort -Vr); do
        if [ -x "$HOME/.nvm/versions/node/$v/bin/pnpm" ]; then
            NVM_BIN="$HOME/.nvm/versions/node/$v/bin"
            break
        fi
    done
fi
export PATH="${NVM_BIN}:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

command -v node >/dev/null || { echo "node not found on PATH"; exit 1; }
command -v pnpm >/dev/null || { echo "pnpm not found on PATH"; exit 1; }

# npm.mspbots.ai and the platform database are both reachable directly; the proxy is not needed and
# is left unset on purpose, so a stopped proxy app can never take this job down.

say() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# One notification, whatever the outcome — a run nobody hears about is a run that didn't happen.
notify() {
    local title="$1" message="$2"
    /usr/bin/osascript -e "display notification \"${message//\"/\\\"}\" with title \"${title//\"/\\\"}\" sound name \"Glass\"" 2>/dev/null || true
}

fail() {
    say "FAILED: $*"
    notify "Scorecard 周更失败" "$1 — 详见 /tmp/scorecard-weekly-publish.log，本周 L10 前需要人工处理"
    exit 1
}

echo ""
echo "================================================================"
say "weekly-publish start (dry-run=$DRY_RUN)"

cd "$REPO" || fail "找不到项目目录"

# ── ① snapshot ────────────────────────────────────────────────────────────────
# The ATI repo has its own launchd job pulling at 10:00 / 14:00 / 22:30, so by 14:30 the source is
# normally fresh. Report its age rather than pulling here: two jobs writing the same repo would race,
# and stale-but-honest beats a half-pulled tree.
if [ ! -f "$ATI_SOURCE" ]; then
    fail "ATI 数据源文件不存在，无法生成快照"
fi
SOURCE_AGE_DAYS=$(( ( $(date +%s) - $(stat -f %m "$ATI_SOURCE") ) / 86400 ))
say "ATI source last modified ${SOURCE_AGE_DAYS} day(s) ago"
if [ "$SOURCE_AGE_DAYS" -gt 3 ]; then
    say "WARNING: 上游数据超过 3 天没更新，快照会跟着旧"
fi

say "regenerating snapshot"
SNAPSHOT_OUT=$(node scripts/build-intake-snapshot.mjs 2>&1) || fail "快照生成失败"
say "$SNAPSHOT_OUT"

# ── ② type-check (hard gate) ──────────────────────────────────────────────────
say "type-checking"
pnpm exec tsc --noEmit || fail "类型检查不通过，已中止，没有发布任何东西"

# ── ③ build ───────────────────────────────────────────────────────────────────
say "building"
pnpm build > /tmp/scorecard-weekly-build.log 2>&1 || fail "构建失败（详见 /tmp/scorecard-weekly-build.log）"
say "build ok"

# ── ④ publish ─────────────────────────────────────────────────────────────────
if [ "$DRY_RUN" = "1" ]; then
    say "dry-run: skipping publish"
    PUBLISH_OUT=$(pnpm exec mspack publish --dry-run 2>&1) || fail "dry-run publish 失败"
else
    say "publishing"
    PUBLISH_OUT=$(pnpm exec mspack publish 2>&1) || fail "发布到 registry 失败"
fi

# mspack prints the published spec as a trailing `+ @app/product-scorecards@0.0.12` line.
VERSION=$(echo "$PUBLISH_OUT" | grep -o '@app/product-scorecards@[0-9][0-9.]*' | tail -1 | sed 's/.*@//')
[ -n "$VERSION" ] || fail "发布命令跑完了，但读不出版本号 — 请人工确认是否发布成功"

ASOF=$(grep -m1 '"asOf"' service/snapshots/intake.ts | sed 's/[^0-9-]//g')

if [ "$DRY_RUN" = "1" ]; then
    say "would publish ${VERSION} (snapshot asOf ${ASOF})"
else
    say "published ${VERSION} (snapshot asOf ${ASOF})"
fi

# ── ⑤ hand off to a human ─────────────────────────────────────────────────────
if [ "$DRY_RUN" = "1" ]; then
    say "dry-run complete — nothing was published"
    notify "Scorecard 周更演练通过" "一切正常（未真正发布）。数据日期 ${ASOF}"
else
    notify "Scorecard ${VERSION} 已发布 — 还差最后一步" "数据已更新到 ${ASOF}。请打开 agent.mspbots.ai/apps，点 Product Team Scorecards 卡片上的 New Version 标签升级，L10 前完成。"
    say "REMINDER: 平台升级需要人工点击 → ${APPS_URL}"
fi

say "done"
echo "================================================================"
