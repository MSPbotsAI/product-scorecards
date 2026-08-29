// GENERATED FILE — do not edit by hand.
//
// Regenerate:  node scripts/build-intake-snapshot.mjs --as-of 2026-08-29
// Source:      timeline/intake-client-meetings.json
// as of:       2026-08-29
//
// A dated, hand-curated snapshot of the AI Ticket Intake client-engagement report. See
// scripts/build-intake-snapshot.mjs for why this is a snapshot and not a live dataset read.

import type { RawSnapshot } from '../lib/intake-source.ts'

export const INTAKE_SNAPSHOT: RawSnapshot = {
 "asOf": "2026-08-29",
 "sourceGeneratedFor": "2026-08-22",
 "source": "timeline/intake-client-meetings.json",
 "meta": {
  "title": "AI Ticket Intake — 客户会议 Timeline",
  "window": {
   "from": "2026-05-04",
   "to": "2026-09-06"
  },
  "generated_for": "2026-08-22",
  "timezone_note": "所有日期/时间为 UTC。会议排期以 Glenn Bugtong 日历为准。",
  "sources": [
   {
    "layer": "计划",
    "source": "Outlook 日历(glenn.bugtong@mspbots.ai)",
    "detail": "Glenn 是所有客户 touchbase 的组织者。Grace 只被邀请了部分场次,必须读 Glenn 的日历才能看到 Valeo / Nomerel / ExperaIT / ACTS360 的周会。",
    "layer_en": "Planned",
    "source_en": "Outlook calendar (glenn.bugtong@mspbots.ai)",
    "detail_en": "Glenn organises every client touchbase. Grace is invited to only some of them, so Glenn's calendar is the only way to see the Valeo / Nomerel / ExperaIT / ACTS360 weeklies."
   },
   {
    "layer": "真实发生",
    "source": "Fathom 录像 + meetings/ 纪要",
    "detail": "两者取并集。有些场次 Fathom 搜不到但仓库里有纪要(如 Mainstream 5/8、Precicom 5/14),反之亦然。",
    "layer_en": "Actually happened",
    "source_en": "Fathom recordings + meetings/ notes",
    "detail_en": "Union of both. Some sessions are missing from Fathom but have notes in the repo (Mainstream 5/8, Precicom 5/14), and vice versa."
   },
   {
    "layer": "取消",
    "source": "取消邀请邮件(emails/<domain>/*Canceled*)",
    "detail": "关键:recurring series 中被取消的单次场次会被 Outlook 从日历彻底删除,不留 isCancelled 痕迹。历史取消只能靠邮件重建。",
    "layer_en": "Cancelled",
    "source_en": "Cancellation invites (emails/<domain>/*Canceled*)",
    "detail_en": "Critical: when a single occurrence of a recurring series is cancelled, Outlook deletes it from the calendar entirely — no isCancelled trace survives. Historic cancellations can only be rebuilt from email."
   }
  ],
  "tracks": [
   {
    "id": "alpha",
    "label": "Alpha 测试客户",
    "desc": "已经建立(或尝试建立)固定 ATI 周会节奏的客户。",
    "label_en": "Alpha testers",
    "desc_en": "Clients with an established (or attempted) weekly ATI cadence."
   },
   {
    "id": "prospect",
    "label": "潜在商机 · 待转化",
    "desc": "还没有 ATI 周会,但在 CSM 的固定例会/催化会里明确浮现了 ATI 需求的客户。格子画的就是那几场 CSM 例会。",
    "label_en": "Pipeline · to convert",
    "desc_en": "No ATI weekly yet, but an ATI need surfaced explicitly in the CSM's recurring meetings. The cells are those CSM meetings."
   }
  ],
  "states": {
   "held": {
    "label": "已开",
    "desc": "有录像或会议纪要",
    "label_en": "Held",
    "desc_en": "Recording or meeting notes exist"
   },
   "cancelled": {
    "label": "已取消",
    "desc": "有取消或拒绝记录,原因可追溯",
    "label_en": "Cancelled",
    "desc_en": "Cancellation or decline on record, reason traceable"
   },
   "norecord": {
    "label": "无记录",
    "desc": "排过期,但查不到开会证据,也查不到取消记录",
    "label_en": "No record",
    "desc_en": "Was scheduled, but no evidence it happened and no cancellation either"
   },
   "upcoming": {
    "label": "未来排期",
    "desc": "已发出邀请，日历上真实存在",
    "label_en": "Scheduled",
    "desc_en": "Invite sent, event exists on the calendar"
   },
   "noinvite": {
    "label": "应排未排",
    "desc": "按周会节奏应该有这一场，但日历上找不到邀请",
    "label_en": "Missing invite",
    "desc_en": "The weekly cadence calls for this slot, but no invite exists"
   }
  },
  "invite_rule": "「未来排期」只统计日历上真实存在的场次（= 邀请已发）。对每个仍在跑的周会，把 cadence 外推到窗口末，外推出来但日历上没有的场次记为「应排未排」——这就是 Glenn 漏发邀请的检测器。",
  "stages": {
   "lost": {
    "label": "商机失败",
    "pct": 0,
    "desc": "已通过会议/邮件明确拒绝",
    "label_en": "Closed Lost",
    "desc_en": "Explicitly declined via meeting or email"
   },
   "interest": {
    "label": "表示兴趣",
    "pct": 15,
    "desc": "提出需求或看过 demo，尚未配置",
    "label_en": "Interest",
    "desc_en": "Need raised or demo seen; nothing configured yet"
   },
   "onboarded": {
    "label": "Onboarding 完成",
    "pct": 35,
    "desc": "intake app 已配好、号码已开通",
    "label_en": "Onboarded",
    "desc_en": "Intake app configured, number provisioned"
   },
   "selftest": {
    "label": "MSP 自测",
    "pct": 55,
    "desc": "客户自己打过几次测试，提出了 bug/需求",
    "label_en": "MSP self-test",
    "desc_en": "Client placed their own test calls, raised bugs/requests"
   },
   "livecalls": {
    "label": "真实来电接入",
    "pct": 75,
    "desc": "已把电话转接给 AI，真实 caller 打进来",
    "label_en": "Live caller traffic",
    "desc_en": "Phones forwarded to the AI; real callers coming in"
   },
   "pricing": {
    "label": "询价 / 商务",
    "pct": 90,
    "desc": "进入定价与合同讨论",
    "label_en": "Pricing / commercial",
    "desc_en": "In pricing and contract discussion"
   },
   "won": {
    "label": "成交",
    "pct": 100,
    "desc": "已付费",
    "label_en": "Won",
    "desc_en": "Paying"
   }
  },
  "stage_note": "阶段阶梯按真实使用行为定义：表示兴趣 → Onboarding 配好 intake app → MSP 自测 → 接入真实来电 → 询价 → 成交/失败。每家的阶段都附了可追溯证据，证据来自 feedback.json（含 pricing / call-forwarding 分类）、tickets.json 和会议纪要。",
  "data_sources_extra": [
   "ati-client-feedback-report-dynamic/data/pipeline.json — 阶段、风险、下一步（生成于 2026-08-09）",
   "ati-client-feedback-report-dynamic/data/tickets.json — 按客户分组的 ClickUp 工单（生成于 2026-08-09）",
   "emails/<domain>/ — 最后一次对客邮件的日期"
  ],
  "delivery_caveats": [
   "ClickUp 导出字段里没有完成时间戳，所以无法计算「交付日 vs 回告日」的时差，只能用「距上次对客沟通多少天」做代理。",
   "ClickUp 的 Closed 既可能是「已解决」也可能是「不做/重复」，导出字段区分不了，因此单独成列，不计入「已交付」。",
   "teams/ 里只有一个 MSPbots 内部频道导出，没有对客 Teams 消息，所以「是否已回告客户」只能用 email + meeting 作证。"
  ],
  "stage_caveat": "阶段是按证据人工判定后写进 JSON 的，不是关键词自动匹配 —— 自动匹配在这种决策用途上误判率太高（例如「declined the paid apps」会被误读成客户拒绝）。",
  "rejection_note": "每一条「商机失败」都标了拒绝渠道和原话出处。检查过的渠道：会议纪要（meetings/ + Fathom）、邮件（Outlook + emails/）。Teams 查不了 —— 仓库里只有一个 MSPbots 内部频道导出，没有任何对客 Teams 消息。",
  "sla": "交接口径：需求浮现 → demo ≤ 7 天；demo → onboarding ≤ 14 天。按这个标准，10 家潜在商机里 5 家已超时（My IT Crew 8/6 才进来，尚在窗口内），另有 1 家（Parachute Techs）在超时期间直接流失。",
  "title_en": "AI Ticket Intake — Client Meetings & Pipeline",
  "timezone_note_en": "All dates/times in UTC. Meeting schedule is sourced from Glenn Bugtong's calendar.",
  "invite_rule_en": "\"Scheduled\" counts only occurrences that actually exist on the calendar (= invite sent). For every still-running weekly, the cadence is projected forward to the end of the window; a projected slot with no calendar event is flagged \"Missing invite\" — this is the detector for invites Glenn forgot to send.",
  "stage_note_en": "The ladder is defined by real usage behaviour: expressed interest → intake app configured → MSP self-testing → live caller traffic → pricing → won/lost. Every client's rung carries citable evidence drawn from feedback.json (incl. pricing / call-forwarding categories), tickets.json and meeting notes.",
  "stage_caveat_en": "Rungs are assigned by hand from evidence and written into the JSON — not keyword-matched. Keyword matching misfires badly for a decision artefact (e.g. \"declined the paid apps\" reads as a client rejection).",
  "rejection_note_en": "Every lost deal carries its rejection channel plus the verbatim source. Channels checked: meeting notes (meetings/ + Fathom) and email (Outlook + emails/). Teams could not be checked — the repo holds only one internal MSPbots channel export, with no client-facing Teams messages at all.",
  "sla_en": "Handoff targets: interest → demo ≤ 7 days; demo → onboarding ≤ 14 days. Against that bar, 5 of the 10 prospects are overdue (My IT Crew only entered on 8/6 and is still inside the window), and 1 more (Parachute Techs) was lost outright while overdue.",
  "data_sources_extra_en": [
   "ati-client-feedback-report-dynamic/data/pipeline.json — stage, risk, next action (generated 2026-08-09)",
   "ati-client-feedback-report-dynamic/data/tickets.json — ClickUp tickets grouped by client (generated 2026-08-09)",
   "emails/<domain>/ — date of the most recent client-facing email"
  ],
  "delivery_caveats_en": [
   "The ClickUp export carries no completion timestamps, so \"delivered on X vs told the client on Y\" cannot be computed. Days since the last client contact is used as a proxy.",
   "ClickUp's \"Closed\" can mean either resolved or won't-do/duplicate; the export cannot tell them apart, so it gets its own column and is not counted as delivered.",
   "teams/ holds only one internal MSPbots channel export — no client-facing Teams messages — so \"was the client told?\" can only be evidenced by email and meetings."
  ],
  "avatar_note": "头像：把 JPG/PNG 放到 timeline/avatars/<slug>.jpg（slug 见 role_actions.owners），重新生成时会自动 base64 内嵌；没有文件就退回首字母。M365 连接器读不到 Teams 头像，Artifact 的 CSP 也不允许外链图片，所以必须是本地文件。",
  "avatar_note_en": "Avatars: drop a JPG/PNG at timeline/avatars/<slug>.jpg (slugs live in role_actions.owners) and the next build embeds it as base64. Without a file it falls back to initials. The M365 connector cannot read Teams profile photos and the artifact CSP blocks remote images, so the file has to be local.",
  "ticket_match_note": "上游 tickets.json 的 client_tickets 分组只认到 614 张里的 128 张 —— 其余 486 张的 client 字段是空的，工单标题里明明写着客户名也没被归类。所以这里改成取并集：client_tickets 里的键，加上按 ticket_match 关键词在 all_tickets 里命中的，按工单 id 去重。这不是权宜之计 —— 分组数据缺一半，只认它会把「客户没提过任何需求」这种结论建立在假空值上。",
  "ticket_match_note_en": "Upstream tickets.json groups only 128 of 614 tickets into client_tickets; the other 486 carry an empty client field even when the ticket title names the client. So we take the union: the client_tickets keys plus anything in all_tickets matching ticket_match, deduplicated by ticket id. Trusting the grouping alone would rest conclusions like \"this client never raised anything\" on a false blank.",
  "ticket_scope_note": "工单口径（数字于 2026-08-19 重算；上一版的 614/144 是 8/7 手写后一直没更新的）：快照来自 ClickUp 的 ai_service_desk 与 ai_ticket_intake 两个 list，共 643 张，页面上显示 182 张（本轮把 CIO Landing 收进看板，+24 张）。剩下 461 张不是漏掉的 —— 其中 423 张不属于任何客户，是产品/基础设施/GTM/评测和阶段性工作项（如「Technical design」「Phase 1: V1 Readiness」）；另 38 张挂在 37 个本看板不跟踪的客户分组下，其中 36 个分组各只有一张标题就是域名或公司名的 onboarding 占位单。真正有实质内容的只有两家，理由都写在这里：CommonAngle（分组内 2 张，按标题关键词再算共 4 张）—— 2026-07-06 Carl Schneider 书面婉拒，\"I'd love to take another look at it as we get closer to 2027\"，约 2027 复访；Red Key Solutions（共 3 张）—— 属 AI Triage 产品线而非 ATI，6/17 会上已全额发 credit 冲抵、客户停用，回归门槛是 help chat 与 ticket acknowledgement 两个功能。另两条不是客户：IT-ed 名下 1 张是占位单，该客户 6/12 那场会谈的是 TicketQA、从未评估 ATI；VC3 名下 1 张是内部任务（\"Get Meeting Recording of VC3(OpsGenie) from King\"），按关键词误捞。两个已知边界：platform 和 tqa_gtm 两个 list 不在导出范围内；客户名既没写进标题、client 字段又为空的工单仍会漏。",
  "ticket_scope_note_en": "Ticket scope (recomputed 2026-08-19; the previous 614/144 was hand-written on 8/7 and never refreshed): the snapshot covers two ClickUp lists, ai_service_desk and ai_ticket_intake — 643 tickets, of which 182 appear here (+24 this run, from bringing CIO Landing onto the board). The remaining 461 are not missing work: 423 belong to no client at all, being product, infrastructure, GTM, evaluation and phase items (\"Technical design\", \"Phase 1: V1 Readiness\"), and 38 sit under 37 client groups this board does not track — 36 of those groups carrying a single ticket whose title is just the domain or company name, an onboarding placeholder. Only two of them hold real content, and the reason for excluding each is stated here. CommonAngle (2 in the group, 4 counting title matches): Carl Schneider declined in writing on 2026-07-06 — \"I'd love to take another look at it as we get closer to 2027\" — and asked to be revisited around 2027. Red Key Solutions (3 tickets): they belong to the AI Triage line rather than ATI; by the 6/17 call their AI spend had been fully credited back and they had stopped using it, with a help chat and ticket acknowledgement as the two features gating any return. Two more are not clients at all: the single IT-ed ticket is a placeholder and their 6/12 meeting was a TicketQA evaluation that never touched ATI, and the single VC3 ticket is an internal task (\"Get Meeting Recording of VC3(OpsGenie) from King\") caught by keyword. Two known edges remain: the platform and tqa_gtm lists are outside the export, and a ticket whose title omits the client name while its client field is empty will still slip through.",
  "told_note": "「已回告客户?」这一列：工单进入 complete / released & live 的时刻取自 ClickUp 的状态流转记录（get_bulk_tasks_time_in_status 的 current_status.since），再找该客户在这之后的第一次对客接触——邮件取自 emails/<domain>/ 的文件日期，会议取自本看板已开的场次。诚实说明：这证明的是「上线之后确实有过接触」，不能证明那次接触真的讲了这张单 —— ClickUp 里没有任何字段记录「已通知客户」，所以这是能做到的最接近的近似。Teams 无法作证，仓库里只有内部频道。另：release 日期是快照，工单换状态后需要重取。",
  "told_note_en": "The \"client told?\" column: the moment a ticket entered complete / released & live comes from ClickUp's status history (current_status.since via get_bulk_tasks_time_in_status), then we look for the first client-facing touch after it — emails by filename date in emails/<domain>/, meetings from the sessions on this board. Stated plainly: this proves contact happened after the ship date, not that the ticket itself was discussed. ClickUp carries no \"client notified\" field, so this is the closest honest approximation. Teams cannot corroborate — the repo holds only an internal channel. The release dates are a snapshot and need refetching when tickets change status.",
  "link_note": "工单状态继承：如果一张客户单在 ClickUp 里 link 到另一张单，它就跟随那张「交付载体」单的状态，而不是永远停在 new。载体单号会一并显示（「经 AST-xxxxx」），因为**挂在某张单下跟踪 ≠ 客户的诉求已被满足**。2026-08-26 做了本轮全量反查：把本看板判为「已交付」的 50 张与「进行中」的 14 张、共 64 张全部用 clickup_get_task include=linked_tasks 查了一遍，另补查了 8/25 被置为 Closed 的 86e2tw5ya，共 65 次调用。结果：载体仍是 6 张、link 仍是 10 条，与 8/8–8/25 每一次完全一致，没有新增；但其中两张载体在 8/25 那一批 CIO Landing 发布里上线了 —— 86e0za1dv（AST-18104）由 for qa 转 released & live，86e2u6nzw（AST-21493）由 in development 转 released & live。因此挂在它们下面的三张客户单 AST-20803（Titanium.Red）、AST-21492 与 AST-21420（均为 CIO Landing）本轮由「进行中」变为「已交付」，上线日期继承自载体。仍未上线的载体只剩 86e20pbz1（in development）。剩下的口径缺口不在这里，而在上游 —— 载体单本身若不在 ai_service_desk / ai_ticket_intake 两个 list 内（如 platform、tqa_gtm），就查不到。",
  "link_note_en": "Status inheritance: when a client ticket is linked to another ticket in ClickUp it follows that delivery vehicle's status instead of sitting at \"new\" forever. The vehicle is always named (\"via AST-xxxxx\") because being tracked under a ticket is not the same as the client's ask being satisfied. A full sweep was run on 2026-08-26: all 50 tickets this board buckets as delivered and all 14 in progress — 64 in total — were queried with clickup_get_task include=linked_tasks, plus one extra on 86e2tw5ya, which was set to Closed on 8/25: 65 calls. Result: still 6 vehicles and 10 links, identical to every sweep from 8/8 through 8/25, with nothing added. Two of those vehicles did ship in the CIO Landing batch released on 8/25, though — 86e0za1dv (AST-18104) went from for qa to released & live, and 86e2u6nzw (AST-21493) from in development to released & live. The three client tickets riding on them — AST-20803 (Titanium.Red), and AST-21492 and AST-21420 (both CIO Landing) — therefore move from in progress to delivered this run, inheriting the vehicle's ship date. The only vehicle still unshipped is 86e20pbz1 (in development). The remaining gap is not here but upstream: a vehicle that does not itself sit in the ai_service_desk or ai_ticket_intake lists (platform, tqa_gtm and so on) cannot be found by this lookup at all."
 },
 "clients": [
  {
   "track": "alpha",
   "name": "Mainstream Technologies",
   "contact": "Tim Brown",
   "cadence": "不定期 · 最早的 alpha 测试者 · 8/7 确认定价可接受 · 8/19 重新接上 · 8/20 四张单已建 · 9/2 已排期且客户已接受",
   "status": "活跃",
   "events": [
    {
     "date": "2026-05-08",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots - Mainstream Tech | AI Ticket Intake Touchbase",
     "transcript": "meetings/Mainstream Technologies/2026-05-08-Mainstream_Tech-AI_Ticket_Intake.md"
    },
    {
     "date": "2026-05-22",
     "time": "16:30",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Mainstream Technologies",
     "fathom": "https://fathom.video/calls/682978850"
    },
    {
     "date": "2026-06-18",
     "time": "20:30",
     "state": "held",
     "title": "Mainstream-Tech | AI Ticket Intake Touchbase",
     "fathom": "https://fathom.video/calls/715199293"
    },
    {
     "date": "2026-08-19",
     "time": "19:30",
     "state": "held",
     "title": "Mainstream Technologies | Meeting with MSPbots (Leonard Narvaza) — ATI segment",
     "fathom": "https://fathom.video/calls/789331110",
     "note": "本次新增。口径注意：这是 Leonard Narvaza 的 Autotask 迁移例会，Glenn 中途加入做 ATI 演示 —— 也就是 8/14 那封「Sorry, I missed you this week… happy to join for a few minutes」成真了。transcript 已逐字读过（Fathom 789331110，recording 174964149，客户方只有 Tim Brown）。ATI 段落从 [18:29] 到 [34:36]：Tim 先为失联道歉 \"I know you guys were waiting on me on intake.\"；Glenn 逐条回了 8/7 的诉求 —— 滥用护栏已有、通话时长实时告警 \"we didn't have that one in place yet\"（Tim 给了阈值：未转接却聊满 5–7 分钟就要告警）、多次呼叫的升级审计 \"I think we haven't added that one. I'll check with the team.\"；Tim 当场提了第 5 条新诉求：通知除了发给单个技术员，还要能发给一个 distribution list。商务侧是这一场最重要的东西，见 stage_evidence。",
     "note_en": "Added this run. Note the framing: this was Leonard Narvaza's Autotask-migration call and Glenn joined partway through to demo ATI — i.e. the 8/14 email (\"Sorry, I missed you this week… happy to join for a few minutes\") actually landed. The transcript was read verbatim (Fathom 789331110, recording 174964149; Tim Brown was the only client-side attendee). The ATI segment runs [18:29]–[34:36]: Tim opens by apologising for the silence — \"I know you guys were waiting on me on intake.\" Glenn answered the 8/7 asks one by one — the abuse guardrail exists; the real-time call-length alert \"we didn't have that one in place yet\" (Tim set the threshold: alert when a caller is with the AI more than 5–7 minutes without a transfer); the multi-attempt escalation audit \"I think we haven't added that one. I'll check with the team.\" Tim added a fifth ask on the call: notifications should be able to go to a distribution list, not only the individual technician. The commercial content is the important part — see stage_evidence."
    },
    {
     "date": "2026-09-02",
     "time": "16:00",
     "state": "upcoming",
     "title": "MSPbots AI Ticket Intake Touchbase",
     "note": "本次新增，来源是 Glenn 日历原件（calendarOwnerEmail=glenn.bugtong@mspbots.ai，事件 createdDateTime 2026-08-26 13:44:07 UTC）。客户方唯一受邀人 Tim Brown（tim.brown@mainstream-tech.com），responseStatus=accepted，responseTime 2026-08-26 14:15:28 UTC —— 也就是说这是客户已经点过「接受」的场次，不是单方面排期。这是 5/22 以来第一场纯 ATI 的 Mainstream 场次（8/19 那场是 Leonard 的 Autotask 迁移例会、Glenn 中途插入演示）。档位不动，仍 90%。",
     "note_en": "New this run, taken from the original entry on Glenn's calendar (calendarOwnerEmail=glenn.bugtong@mspbots.ai; the event's createdDateTime is 2026-08-26 13:44:07 UTC). The only client-side invitee is Tim Brown (tim.brown@mainstream-tech.com), responseStatus=accepted, responseTime 2026-08-26 14:15:28 UTC — so the client has actually accepted this one; it is not a slot we put on the calendar unilaterally. It is the first ATI-only Mainstream session since 5/22 (the 8/19 session was Leonard's Autotask-migration call that Glenn joined to demo). The rung is unchanged at 90%."
    }
   ],
   "pipeline_key": "Mainstream Technologies",
   "ticket_keys": [
    "Mainstream Technologies"
   ],
   "email_domain": "mainstream-tech.com",
   "stage": "pricing",
   "stage_evidence": "本次升档 55%→90%。2026-08-07 19:53 UTC Tim Brown 回复 Glenn 7/1 的 MVP 与定价征询，逐条回答了定价问题：对 $199/月含 200 分钟、超出 $0.50/分钟的方案，原话 \"those costs are in-line with what I would expect to pay for a service like this and that is comparable to existing pricing for voice/call center services we've used in the past and are using for our after hours intake now.\"；问「这个定价对你的团队可行吗」答 \"Yes, this would work for me to move forward with on an after-hours basis.\"；问「正式收费后是否愿意订阅」答 \"Yes, permitting the already reported problems and issues we've faced are resolved prior to full launch of the product/service.\" —— 这是明确的定价/商务讨论加附条件的订阅意向，因此按阶梯定义进入 90%。技术侧的既有证据不变：Tim 带 2 名内部测试者自测、提出 7 项 bug/质量问题，多级 call forwarding 仍是 production 前置条件，从未接入真实来电。注意订阅是有条件的 —— 他同一封信里重新确认了 call forwarding 转到语音信箱后卡住、不会拨下一个号码的问题。\n\n本次补充（档位不动，仍为 90%，但证据从「一封邮件」变成「一封邮件 + 一次逐字读过的通话」）：2026-08-19 19:30 UTC 的 Mainstream 例会上 Glenn 做了 ATI 演示，transcript 逐字读过（Fathom 789331110）。商务口径 Tim 说得比 8/7 那封信更具体：他把 ATI 与现用的 after-hours 呼叫中心做了成本对比，[27:23] 原话 \"from a cost perspective, it's, I think it's one to one, like what I'm paying them for initial bucket plus per minute and what I would be paying MSPbots for the AI intake. I think it's like dollar for dollar the same.\"，并说清了上线路径 \"basically I'd have one month of overlap because I'd want to be able to fail back to the call center if something went wrong\"，目标是 \"replace the call center with it\"，成功后还想推到白天。[31:00] \"it is right on the cusp, and I'll be ready to open it up to the internal testing with my CISO and my boss as well… then I just need to ask for their approval to do a test on replacing our call center. And I can just get into our VoIP system, and instead of it forwarding to the call center, forward to the AI intake number.\"合约形态也当场谈定：Tim [33:00] 问 \"would I be able to turn it on live for a month?\"，Leonard 答 \"you could\"；Tim [33:45] \"even if we've got to like, okay, we're not signing a contract yet. I'm going to buy a month of service, whatever. Do the proof of concept, replace the after hours. Cause if it's approved… I'm going to sign and move forward, whatever I need to do… I'm not worried about a contract or agreement or anything like that. I just have to prove it works and get my executive leadership to buy in.\"这仍然是 90%（定价 / 合同讨论）而不是 100%（已付费）—— 没有订阅、没有账单；也不是 75%（真实来电），电话至今没有转发过来。剩下的唯一「潜在 deal breaker」是响应延迟，[32:07] \"if the performance side of it's fixed, then that would be the only potential deal breaker.\"\n\n本轮（2026-08-21）复核：档位不动，仍为 90%。8/20–8/21 没有出现任何新的商务证据 —— Tim 没有再回信，也没有订阅、账单或付费凭证；变化全部发生在交付侧（见 next_action）。\n\n本轮（2026-08-25）复核：档位不动，仍为 90%。8/24 Tim Brown 确实回信了，但内容是产品方案选型、不是商务 —— 没有订阅、没有账单、没有付费凭证，也没有把电话转过来。升到 100% 需要付费凭证，升到 75% 需要真实来电，两样都还没有。",
   "next_action": "【8/27 更新：客户接受了 9/2 的 ATI 场次 —— 那一场之前必须给出两个日期】① 2026-08-26 13:44 UTC Glenn 新建了 9/2 16:00 UTC 的「MSPbots AI Ticket Intake Touchbase」，客户方只邀了 Tim Brown，Tim 14:15 UTC 点了接受（日历原件）。这是 8/19 那场之后的第一个明确检查点，也是把「已选定方案」变成「已排期」的机会。② 到会前要解决的还是同两张单，本轮复查状态未变：AST-21625（86e2wt01r，通话时长实时告警）仍 new、无负责人、无 due date —— 而 Tim 8/24 已经把方案替我们选完了（要 A 或 C，不要 B）；AST-21628（86e2wt0cy，语音抢话/延迟）仍 new、负责人 Glenn，是 Tim 亲口说的唯一 potential deal breaker。同批的 AST-21626（升级审计，86e2wt05u）与 AST-21627（distribution list 通知，86e2wt08w）本轮仍在 in development、Vow Meng 负责、due 已到 8/26。③ 商务侧本轮零变化：没有再谈价、没有订阅、没有账单，电话也没转过来。90% 不动。",
   "cadence_en": "Ad hoc · earliest alpha tester · pricing accepted 8/7 · re-engaged 8/19 · four tickets filed 8/20 · 9/2 booked and accepted by the client",
   "next_action_en": "[8/27 update: the client accepted a 9/2 ATI session — two dates have to exist before it] (1) At 13:44 UTC on 2026-08-26 Glenn created \"MSPbots AI Ticket Intake Touchbase\" for 9/2 16:00 UTC with Tim Brown as the only client-side invitee, and Tim accepted at 14:15 UTC (read off the calendar entry itself). It is the first firm checkpoint since 8/19 and the chance to turn \"option chosen\" into \"option scheduled\". (2) What has to be resolved before that meeting is still the same two tickets, both re-checked this run and both unchanged: AST-21625 (86e2wt01r, the real-time call-duration alert) is still new with no assignee and no due date — even though Tim made the design decision for us on 8/24 (option A or C, not B); and AST-21628 (86e2wt0cy, the barge-in / latency defect) is still new, owned by Glenn, and is the one thing Tim named as a potential deal breaker. The other two of that batch, AST-21626 (escalation audit, 86e2wt05u) and AST-21627 (distribution-list notification, 86e2wt08w), are still in development under Vow Meng with an 8/26 due date that has now passed. (3) Nothing changed commercially: no pricing reopened, no subscription, no billing, and the phones are still not forwarded. The rung stays at 90%.",
   "stage_evidence_en": "Upgraded 55% → 90% this run. On 2026-08-07 at 19:53 UTC Tim Brown answered Glenn's 1 July MVP-and-pricing questions point by point. On the $199/month-for-200-minutes plan with $0.50 per additional minute: \"those costs are in-line with what I would expect to pay for a service like this and that is comparable to existing pricing for voice/call center services we've used in the past and are using for our after hours intake now.\" Asked whether the pricing works for his team: \"Yes, this would work for me to move forward with on an after-hours basis.\" Asked whether he would subscribe once it becomes a paid offering: \"Yes, permitting the already reported problems and issues we've faced are resolved prior to full launch of the product/service.\" That is an explicit commercial discussion plus a conditional intent to subscribe, which is the 90% rung. The technical evidence is unchanged: Tim ran self-tests with two internal testers and raised 7 bug/quality items; multi-level call forwarding is still a prerequisite for production and live caller traffic never happened. Note the condition — in the same email he re-confirmed that call forwarding stalls at voicemail instead of trying the next number.\n\nAdded this run (the rung is unchanged at 90%, but the evidence goes from one email to one email plus a call read verbatim): on 2026-08-19 at 19:30 UTC Glenn demoed ATI on Mainstream's regular call and the transcript was read line by line (Fathom 789331110). Tim was more concrete on the commercials than in the 8/7 email. He compared ATI against the after-hours call centre they use today — [27:23]: \"from a cost perspective, it's, I think it's one to one, like what I'm paying them for initial bucket plus per minute and what I would be paying MSPbots for the AI intake. I think it's like dollar for dollar the same.\" He also described the cutover: \"basically I'd have one month of overlap because I'd want to be able to fail back to the call center if something went wrong\", with the goal to \"replace the call center with it\", and business hours after that if it works. [31:00]: \"it is right on the cusp, and I'll be ready to open it up to the internal testing with my CISO and my boss as well… then I just need to ask for their approval to do a test on replacing our call center. And I can just get into our VoIP system, and instead of it forwarding to the call center, forward to the AI intake number.\" The contract shape was settled on the call too: Tim at [33:00] asked \"would I be able to turn it on live for a month?\" and Leonard answered \"you could\"; Tim at [33:45]: \"even if we've got to like, okay, we're not signing a contract yet. I'm going to buy a month of service, whatever. Do the proof of concept, replace the after hours. Cause if it's approved… I'm going to sign and move forward, whatever I need to do… I'm not worried about a contract or agreement or anything like that. I just have to prove it works and get my executive leadership to buy in.\" That is still 90% (pricing / contract), not 100% (paying) — no subscription and no invoice exist; and not 75% (live callers), because the phones have never been forwarded. The one remaining \"potential deal breaker\" is responsiveness — [32:07]: \"if the performance side of it's fixed, then that would be the only potential deal breaker.\"\n\nRe-checked this run (2026-08-21): the rung is unchanged at 90%. No new commercial evidence appeared on 8/20–8/21 — Tim has not replied again, and there is still no subscription, invoice or payment record. Everything that moved is on the delivery side (see next action).\n\nRe-checked this run (2026-08-25); the rung is unchanged at 90%. Tim Brown did reply on 8/24, but on product design rather than commercials — no subscription, no invoice, no proof of payment, and the phones still are not forwarded. 100% needs proof of payment and 75% needs real caller traffic; neither exists yet.",
   "ticket_match": [
    "mainstream"
   ]
  },
  {
   "track": "alpha",
   "name": "Impact Group MN",
   "contact": "Ryan Boubelik",
   "cadence": "周二 17:00 · 已停",
   "status": "已停更",
   "events": [
    {
     "date": "2026-05-12",
     "time": "17:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Impact Group",
     "transcript": "meetings/Impact Group MN/2026-05-12-AI_Ticket_Intake_Impact_group.md",
     "note": "45 分钟首次 demo",
     "note_en": "First demo, 45 minutes"
    },
    {
     "date": "2026-05-26",
     "time": "17:00",
     "state": "norecord",
     "title": "AI Ticket Intake - Weekly Touchbase | Impact Group"
    }
   ],
   "pipeline_key": "Impact Group MN",
   "ticket_keys": [],
   "email_domain": "impactgroupmn.com",
   "stage": "interest",
   "stage_evidence": "5/12 完成 45 分钟 demo，要求 on-call 轮值集成；Ryan 问过最终定价但只是评估可行性。无工单、无自测证据，已 87 天无接触。",
   "cadence_en": "Tue 17:00 · stopped",
   "stage_evidence_en": "45-minute demo on 5/12; asked for on-call rotation integration. Ryan asked about final pricing, but only to assess feasibility. No tickets, no self-test evidence, 87 days without contact.",
   "ticket_match": [
    "impact group"
   ],
   "next_action": "【未核实，仅记录】2026-08-11 的内部 Churn Review（Fathom 779618229，Daniel、Jazz、Anushree、Crispin、Kevin Sebastian，无客户参会人）把 Impact Group 列为下一个要复盘的流失案例 —— 那一场实际只复盘了 TwentyFour IT，Impact Group 的复盘被推到了下一次会。这是内部会议、且案子还没复盘，按口径不能作为改档依据，因此 15% 不动。但值得注意的是这家 ATI 侧已经 90+ 天没有任何接触。动作：等那场复盘开完再看结论，如果 MSPbots 账号本身在流失，ATI 这条线就该直接标为不再跟进，而不是继续挂在 15%。",
   "next_action_en": "[UNVERIFIED — recorded only] The internal churn review of 2026-08-11 (Fathom 779618229, with Daniel, Jazz, Anushree, Crispin and Kevin Sebastian, no client present) named Impact Group as the next churn case to review — that session actually only covered TwentyFour IT, and the Impact Group post-mortem was deferred to a follow-up meeting. This is an internal meeting and the case has not even been reviewed, so it cannot move a rung and the 15% is unchanged. What is worth noting is that there has been no ATI contact at all for 90+ days. Action: wait for that review to happen and read its conclusion. If the MSPbots account itself is churning, the ATI line should be marked not-pursuing outright rather than left idling at 15%."
  },
  {
   "track": "alpha",
   "name": "Precicom",
   "contact": "Martin Rodrigue",
   "cadence": "一次性 demo · 7/24 邮件拒绝",
   "status": "已流失",
   "events": [
    {
     "date": "2026-05-14",
     "time": "13:00",
     "state": "held",
     "title": "AI Ticket Intake DEMO - Precicom",
     "transcript": "meetings/Precicom/2026-05-14-ATI_demo-Precicom.md"
    }
   ],
   "pipeline_key": "Precicom",
   "ticket_keys": [
    "Precicom"
   ],
   "email_domain": "precicom.com",
   "stage": "lost",
   "stage_evidence": "曾真的动手测：5/14 demo 后共 7 张 ClickUp 工单，其中 4 条来自 bug/质量反馈。但 7/24 Martin Rodrigue 以邮件明确拒绝付费订阅，主因是法语体验不够成熟、AI 常听不懂请求、对话流不顺。Glenn 7/29 回信确认结案。",
   "lost_reason": "法语体验不成熟是决定因素：Precicom 是法语运营团队，测试后认为 AI 常无法正确理解请求、对话流不满足运营要求，因此不接受当前状态下的付费订阅。若法语理解、对话准确度和整体 UX 有显著改进，愿意重新评估。",
   "next_action": "标记为 Closed Lost，暂不跟进；法语能力有显著进展时由 Glenn 主动回访（他 7/29 已作此承诺）。注意：本条流失此前未被看板记录，工单区仍有 7 张单，需按「客户已走」重新做减法。",
   "rejection": {
    "channel": "email",
    "date": "2026-07-24",
    "who": "Martin Rodrigue（Directeur des opérations / Operations Director）",
    "quote": "After conducting several tests, we do not feel that the product currently meets our needs. In our experience, the AI often struggles to understand the requests properly, and the conversation flow is not smooth enough for our operational requirements. A major challenge appears to be the French-language experience. Based on our testing, we believe the service is not yet sufficiently mature for French-speaking teams. ... For these reasons, we would not be prepared to move forward with a paid subscription in its current state.",
    "ref": "Outlook · RE: Checking In: AI Ticket Intake Feedback（martin.rodrigue@precicom.com，2026-07-24 15:29 UTC，Grace 在 Cc）· 归档件 emails/precicom.com/2026-07-24_Re- Checking In AI Ticket Intake Feedback (declines paid, French not mature).md · Glenn 7/29 回信确认：emails/precicom.com/2026-07-29_Re- Checking In AI Ticket Intake Feedback (Glenn ack, revisit when French improves).md",
    "who_en": "Martin Rodrigue (Directeur des opérations / Operations Director)",
    "ref_en": "Outlook · RE: Checking In: AI Ticket Intake Feedback (martin.rodrigue@precicom.com, 2026-07-24 15:29 UTC, Grace on Cc) · archived at emails/precicom.com/2026-07-24_Re- Checking In AI Ticket Intake Feedback (declines paid, French not mature).md · Glenn's 7/29 acknowledgement: emails/precicom.com/2026-07-29_Re- Checking In AI Ticket Intake Feedback (Glenn ack, revisit when French improves).md"
   },
   "cadence_en": "One-off demo · declined by email 7/24",
   "stage_evidence_en": "They genuinely got hands on it — 7 ClickUp tickets after the 5/14 demo, 4 of them from bug/quality feedback. But on 7/24 Martin Rodrigue declined a paid subscription by email, citing an immature French-language experience, an AI that often fails to understand requests, and an unsatisfactory conversation flow. Glenn closed the loop on 7/29.",
   "lost_reason_en": "The French-language experience was the deciding factor: Precicom runs a French-speaking operation and, after testing, judged that the AI often fails to understand requests and that the conversation flow does not meet their operational requirements — so they would not take a paid subscription in its current state. They are open to reassessing if French comprehension, conversational accuracy and overall UX improve significantly.",
   "next_action_en": "Mark Closed Lost and stop pursuing; Glenn to re-approach once French-language capability has moved on materially (he committed to that on 7/29). Note: this loss was not previously on the board, and 7 tickets are still open against them — re-triage them as a departed client.",
   "ticket_match": [
    "precicom"
   ]
  },
  {
   "track": "alpha",
   "name": "Nomerel",
   "contact": "Rhonda Rush",
   "cadence": "周五 12:30 · 7/17 后退出试点",
   "status": "已流失",
   "events": [
    {
     "date": "2026-05-22",
     "time": "12:30",
     "state": "norecord",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase"
    },
    {
     "date": "2026-05-29",
     "time": "12:30",
     "state": "held",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/689385513"
    },
    {
     "date": "2026-06-05",
     "time": "12:30",
     "state": "held",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/697958352"
    },
    {
     "date": "2026-06-12",
     "time": "12:30",
     "state": "held",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/706787802"
    },
    {
     "date": "2026-06-19",
     "time": "12:30",
     "state": "norecord",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase"
    },
    {
     "date": "2026-06-26",
     "time": "12:30",
     "state": "held",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/723688088"
    },
    {
     "date": "2026-07-03",
     "time": "12:30",
     "state": "cancelled",
     "title": "Canceled: MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase",
     "reason": "美国独立日假期(Glenn 7/2 发出取消)",
     "requested_by": "MSPbots",
     "email": "emails/nomerel.com/2026-07-02_Canceled - Nomerel AI Ticket Intake Weekly Touchbase.md",
     "reason_en": "US Independence Day holiday (Glenn sent the cancellation on 7/2)"
    },
    {
     "date": "2026-07-10",
     "time": "12:30",
     "state": "held",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/739892994"
    },
    {
     "date": "2026-07-17",
     "time": "12:30",
     "state": "held",
     "title": "MSPbots - Nomerel | AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/748563712"
    }
   ],
   "pipeline_key": "Nomerel",
   "ticket_keys": [
    "Nomerel"
   ],
   "email_domain": "nomerel.com",
   "lost_reason": "因业务/合同原因退出试点（其客户要求 intake 之外的真人交互），转向外包 help desk。不是产品质量问题：下班后话务量极低，转接开启后除 Glenn 自测外零通话，试点本身无结论。门没关死。",
   "next_action": "下线处理：确认 Rhonda 已取消转接，Glenn/Mandy 回收 Twilio 号码，加入 reject/no-pay 租户名单。",
   "stage": "lost",
   "stage_evidence": "因客户要求 intake 之外的真人交互而退出试点，转外包 help desk。曾接入真实来电（下班后 6PM–7AM 转接），但 Twilio 显示一周仅约 2 通，试点无结论。",
   "rejection": {
    "channel": "meeting",
    "date": "2026-07-20",
    "who": "Rhonda Rush",
    "quote": "因客户要求 intake 之外的真人交互而退出试点，转向外包 help desk。下班后话务量极低（Twilio 显示一周约 2 通），试点无结论。",
    "ref": "pipeline.json risk_reason（来源为周会纪要）· 无拒绝邮件 —— emails/nomerel.com 最后一封是 7/2 的取消通知",
    "who_en": "Rhonda Rush",
    "quote_en": "Exited the pilot because their clients require human interaction beyond intake; moved to an outsourced help desk. After-hours volume was near zero (~2 calls a week per Twilio), so the trial was inconclusive.",
    "ref_en": "pipeline.json risk_reason (sourced from weekly notes) · no decline email — the last item in emails/nomerel.com is the 7/2 cancellation"
   },
   "cadence_en": "Fri 12:30 · exited the pilot after 7/17",
   "stage_evidence_en": "Reached live caller traffic (after-hours forwarding 6PM–7AM), but Twilio showed only ~2 calls a week, so the pilot was inconclusive. Exited for business/contract reasons.",
   "lost_reason_en": "Exited the pilot for business/contract reasons — their clients require human interaction beyond intake — and moved to an outsourced help desk. Not a product-quality loss; very low after-hours volume made the trial inconclusive. Door left open.",
   "next_action_en": "Offboard: confirm Rhonda removed forwarding, decommission the Twilio number, add to the reject/no-pay tenant list.",
   "ticket_match": [
    "nomerel"
   ]
  },
  {
   "track": "alpha",
   "name": "Valeo Networks",
   "contact": "Erik Svendsen · Cymric Cramer · Paul G (CloudScale365)",
   "cadence": "周三 15:00 · 8/4 邮件终止 · 8/12 周会撤销、时段转给 SOP Agent",
   "status": "已流失",
   "note": "日历标题不含客户名(\"MSPbots AI Ticket Intake - Weekly Touchbase\"),只能靠参会人邮箱识别。Grace 未被邀请。",
   "events": [
    {
     "date": "2026-05-27",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/686485266"
    },
    {
     "date": "2026-06-03",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/694850398"
    },
    {
     "date": "2026-06-10",
     "time": "15:00",
     "state": "cancelled",
     "title": "Canceled: MSPbots AI Ticket Intake - Weekly Touchbase",
     "reason": "Erik:当天支援电话量过大,临时取消",
     "requested_by": "客户",
     "email": "emails/valeonetworks.com/2026-06-10-Canceled-MSPbots-AI-Ticket-Intake-Weekly-Touchbase.md",
     "reason_en": "Erik: unusually heavy support call volume that day, cancelled at short notice"
    },
    {
     "date": "2026-06-17",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/711824691"
    },
    {
     "date": "2026-06-24",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/720178846"
    },
    {
     "date": "2026-07-01",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase | ValeoNetworks",
     "fathom": "https://fathom.video/calls/728576804"
    },
    {
     "date": "2026-07-08",
     "time": "15:00",
     "state": "cancelled",
     "title": "Canceled: MSPbots AI Ticket Intake - Weekly Touchbase",
     "reason": "Erik:会议冲突。本周无产品反馈",
     "requested_by": "客户",
     "email": "emails/valeonetworks.com/2026-07-08-Canceled-AI-Ticket-Intake-Weekly-Touchbase.md",
     "reason_en": "Erik: meeting conflict. No product feedback this week"
    },
    {
     "date": "2026-07-15",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/745633953"
    },
    {
     "date": "2026-07-22",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase | Valeo Networks",
     "fathom": "https://fathom.video/calls/753713064"
    },
    {
     "date": "2026-07-29",
     "time": "15:00",
     "state": "norecord",
     "silent": true,
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase",
     "note": "日历上这一场已不存在,也没有取消邮件——需要向 Glenn 确认",
     "note_en": "This occurrence no longer exists on the calendar and there is no cancellation email — needs confirming with Glenn"
    },
    {
     "date": "2026-08-05",
     "time": "15:00",
     "state": "held",
     "title": "MSPbots AI Ticket Intake - Weekly Touchbase",
     "fathom": "https://fathom.video/calls/770850417",
     "note": "周末工单循环烧掉全部 AI credits,约 $2,000 缺口 → 触发定价复盘",
     "note_en": "A weekend ticket loop burned all AI credits, ~$2,000 shortfall → triggered the pricing review"
    },
    {
     "date": "2026-08-12",
     "time": "15:00",
     "state": "cancelled",
     "title": "Canceled: MSPbots AI Ticket Intake - Weekly Touchbase",
     "requested_by": "客户",
     "reason": "ATI 周会整条 recurring 系列已撤销。2026-08-13 复查 Glenn 日历：周三 15:00 起再无任何 ATI 场次，同一时段、同一批客户参会人（Erik Svendsen、Cymric Cramer、Paul Glazewski）改挂「SOP Agent Weekly Touchbase - Valeo Networks」（8/19、8/26 都在）。",
     "reason_en": "The whole ATI weekly series has been withdrawn. Re-checking Glenn's calendar on 2026-08-13: there is no ATI occurrence at Wed 15:00 any more, and the same slot with the same client attendees (Erik Svendsen, Cymric Cramer, Paul Glazewski) now carries \"SOP Agent Weekly Touchbase - Valeo Networks\" on both 8/19 and 8/26.",
     "note": "本次改判：此前记为「未来排期」。没有取消邀请邮件 —— Grace 从未被邀请进这个系列，所以邮箱里查不到；唯一的文字痕迹是 8/12 16:09 UTC 内部 Teams 的一句「Valeo Networks has cancelled the weekly AI Ticket Intake call and is okay with transitioning to…」，按口径 Teams 只作旁证。本次判定的依据是日历本身。",
     "note_en": "Reclassified this run; previously logged as \"Scheduled\". There is no cancellation invite — Grace was never on this series, so nothing reaches her mailbox — and the only written trace is an internal Teams line at 8/12 16:09 UTC: \"Valeo Networks has cancelled the weekly AI Ticket Intake call and is okay with transitioning to…\", which counts as corroboration only. The finding rests on the calendar itself."
    },
    {
     "date": "2026-08-19",
     "time": "15:00",
     "state": "cancelled",
     "title": "Canceled: MSPbots AI Ticket Intake - Weekly Touchbase",
     "requested_by": "客户",
     "reason": "ATI 周会整条 recurring 系列已撤销。2026-08-13 复查 Glenn 日历：周三 15:00 起再无任何 ATI 场次，同一时段、同一批客户参会人（Erik Svendsen、Cymric Cramer、Paul Glazewski）改挂「SOP Agent Weekly Touchbase - Valeo Networks」（8/19、8/26 都在）。",
     "reason_en": "The whole ATI weekly series has been withdrawn. Re-checking Glenn's calendar on 2026-08-13: there is no ATI occurrence at Wed 15:00 any more, and the same slot with the same client attendees (Erik Svendsen, Cymric Cramer, Paul Glazewski) now carries \"SOP Agent Weekly Touchbase - Valeo Networks\" on both 8/19 and 8/26.",
     "note": "本次改判：此前记为「未来排期」。8/13 复查，这一场在 Glenn 日历上已不存在，同时段是 SOP Agent 周会。",
     "note_en": "Reclassified this run; previously \"Scheduled\". A re-check on 8/13 shows no such occurrence on Glenn's calendar — the slot is the SOP Agent weekly."
    }
   ],
   "pipeline_key": "Valeo Networks",
   "ticket_keys": [
    "Valeo Networks"
   ],
   "email_domain": "valeonetworks.com",
   "stage": "lost",
   "stage_evidence": "曾是最深度的 alpha：18 张工单、17 条 bug/质量反馈、已接入真实来电（周末工单循环产生约 25,000 单、烧掉约 20,000 credits）。7/15 一度接受 6 credits=1 分钟的新模型，但 8/4 因转接计费问题以邮件明确终止。",
   "lost_reason": "转接计费是 dealbreaker：通话经 Twilio 桥接，转给真人技术员后仍按分钟计费。Lite Transfer（1 credit/分钟）和改用回拨（不桥接、零分钟费）两个方案都被拒。Valeo 通话时长 30 分钟–2.5 小时、约 150 名技术员，成本不可接受；Erik 在评估 Nextiva，偏好统一不限量定价。",
   "rejection": {
    "channel": "email",
    "date": "2026-08-04",
    "who": "Erik Svendsen（Director of Commercial Service Delivery）",
    "quote": "I understand the reasoning behind the need for credits as the call stays connected. However, neither option will really work for us so we're going to cease the AI Intake on our account. Please do let me know if further enhancements come.",
    "ref": "Outlook · RE: MSPbots | Update on Call Transfer Billing Investigation + Call Transfer \"Beep\" Enhancement（2026-08-04 21:36 UTC，Grace 在 Cc）",
    "who_en": "Erik Svendsen (Director of Commercial Service Delivery)",
    "ref_en": "Outlook · RE: MSPbots | Update on Call Transfer Billing Investigation + Call Transfer \"Beep\" Enhancement (2026-08-04 21:36 UTC, Grace on Cc)"
   },
   "next_action": "① 【本次已解决】ATI 周会不再挂着了：8/13 复查 Glenn 日历，周三 15:00 的 ATI 系列已整条撤销，8/19、8/26 同一时段同一批客户参会人改成了「SOP Agent Weekly Touchbase - Valeo Networks」。也就是说 ATI 这条线在 Valeo 这边确实关了，客户被转到了 SOP Agent 产品线。看板上 8/12、8/19 两场已相应改判为「已取消」。② 注意区分产品线：Valeo 还在跟 MSPbots 合作，只是不再是 ATI 的客户 —— 后续 Valeo 的会议不要再算进 ATI 的会议卫生。③【8/22 更正】转接计费的重连由头有人碰过了，但客户没回：8/18 02:09 UTC Daniel Wang 亲自回了这条线程（emails/valeonetworks.com/2026-08-18_Re- Call Transfer Billing Investigation + Beep Enhancement (Nextiva comparison).md，正文本轮已读），收件人 Erik Svendsen 与 Paul Glazewski，问的是竞品 —— 原话 \"just want to check if you get chance to review if Nextiva has PSA connections that can intelligently having a conversation with your client and create tickets in your PSA? Also started solve the L1 issues later? From my research, they don't have any of those features.\"。也就是说上一轮写的「至今没有被回应」已经不准确，该改成「我方 8/18 已由 CEO 亲自跟进，客户至今没有回信」。注意这封信打的是差异化，不是成本 —— 而 Erik 8/4 终止的理由正是转接计费；8/6 的回拨方案已被 Paul Glazewski 以 \"the callback method won't net us enough to make that worthwhile\" 拒绝。下一次接触需要拿出真正降低分钟成本的方案，而不是换一种转接形态；AST-20255（转接遇 auto attendant 失败）仍在 in development，做完可以当由头。",
   "cadence_en": "Wed 15:00 · terminated by email 8/4 · weekly withdrawn 8/12, slot handed to SOP Agent",
   "stage_evidence_en": "Was the deepest alpha: 18 tickets, 17 bug/quality items, live caller traffic (a weekend ticket loop produced ~25,000 tickets and burned ~20,000 credits). Accepted the 6-credits-per-minute model on 7/15, then terminated by email on 8/4 over transfer billing.",
   "lost_reason_en": "Transfer billing was the deal-breaker: calls stay bridged through Twilio, so per-minute charges continue after handoff to a human tech. Both Lite Transfer (1 credit/min) and the callback alternative (no bridge, no per-minute cost) were rejected. Valeo's calls run 30 min–2.5 hrs across ~150 techs, making the cost unacceptable; Erik is evaluating Nextiva and wants flat unlimited pricing.",
   "next_action_en": "1. (resolved this run) The ATI weeklies are no longer hanging: a re-check of Glenn's calendar on 8/13 shows the Wed 15:00 ATI series withdrawn in full, and the 8/19 and 8/26 slots with the same client attendees now carry \"SOP Agent Weekly Touchbase - Valeo Networks\". ATI really is closed at Valeo and the client has moved to the SOP Agent product line. The 8/12 and 8/19 cells have been reclassified as Cancelled accordingly. 2. Mind the product line: Valeo is still working with MSPbots, just not as an ATI client — do not count their future meetings toward ATI meeting hygiene. 3. [Corrected 8/22] The transfer-billing reconnection hook has now been touched, but the client has not replied: at 02:09 UTC on 8/18 Daniel Wang answered the thread himself (emails/valeonetworks.com/2026-08-18_Re- Call Transfer Billing Investigation + Beep Enhancement (Nextiva comparison).md, body read this run), addressed to Erik Svendsen and Paul Glazewski, and the question is competitive — verbatim: \"just want to check if you get chance to review if Nextiva has PSA connections that can intelligently having a conversation with your client and create tickets in your PSA? Also started solve the L1 issues later? From my research, they don't have any of those features.\" So last run's wording, that this was never answered, is no longer accurate; it should read that MSPbots followed up at CEO level on 8/18 and the client has not written back. Note that the mail argues differentiation, not cost — while the reason Erik terminated on 8/4 was transfer billing; and the callback proposal of 8/6 was rejected by Paul Glazewski — \"the callback method won't net us enough to make that worthwhile\". The next approach needs a genuine reduction in per-minute cost, not a different shape of transfer; AST-20255 (transfer fails at an auto attendant) is still in development and would be a hook.",
   "ticket_match": [
    "valeo"
   ],
   "note_en": "The calendar title carries no client name (\"MSPbots AI Ticket Intake - Weekly Touchbase\"), so the sessions can only be identified by attendee address. Grace was never invited."
  },
  {
   "track": "alpha",
   "name": "Big Fish Technology",
   "contact": "Chris",
   "cadence": "一次性 touchbase · 6/3 后无会议",
   "status": "已停更",
   "events": [
    {
     "date": "2026-06-03",
     "time": "06:00",
     "state": "held",
     "title": "MSPBots | AI Ticket Intake - Touchbase",
     "fathom": "https://fathom.video/calls/694850397"
    }
   ],
   "pipeline_key": "Big Fish Technology",
   "ticket_keys": [],
   "email_domain": "bigfishtech.com.au",
   "stage": "selftest",
   "stage_evidence": "真的测过：12 张 ClickUp 工单，其中 3 个 bug 来自真实通话（通话中重复建单、写错 Autotask 工单号、澳洲口音与延迟导致语音质量差），另有 8 条 enhancement（来电号码识别问候语、通话录音附到工单、下班后 SMS/Teams 通知 on-call、未确认时升级给经理、Autotask 字段读取 VIP 状态、PIN 零信任验证）。会议侧确实 6/3 之后就停了，但工单侧的参与度远超「表示兴趣」。",
   "cadence_en": "One-off touchbase · no meetings after 6/3",
   "stage_evidence_en": "They did test: 12 ClickUp tickets, 3 of them bugs found on real calls (duplicate tickets created during a call, wrong Autotask ticket number, poor voice quality from Australian accent and latency), plus 8 enhancements (caller-ID smart greeting, transcript attached to ticket, after-hours SMS/Teams to on-call, escalation to a manager when unacknowledged, Autotask VIP field lookup, PIN zero-trust validation). The meetings did stop after 6/3, but the ticket record shows engagement well beyond mere interest.",
   "ticket_match": [
    "big fish",
    "bigfish"
   ],
   "next_action": "9 张未开工的 enhancement 挂着，客户两个月没被联系。要么重启节奏，要么明确回告哪些不做 —— 这是所有客户里「提了最多、我们动得最少」的一家。",
   "next_action_en": "Nine untouched enhancements are sitting open and the client has not been contacted in two months. Either restart a cadence or tell them plainly what will not be built — this is the widest gap between what a client asked for and what we did."
  },
  {
   "track": "alpha",
   "name": "Metro Sales",
   "contact": "Dan Olsen · D. Ulbrich · James Eubanks",
   "cadence": "周四 14:30 · 8/20 那场无记录 · 8/20 之后无邀请 · 8/13 三人到齐",
   "status": "活跃",
   "events": [
    {
     "date": "2026-06-09",
     "time": "15:00",
     "state": "held",
     "title": "AI Ticket Intake Touchbase | Metro Sales",
     "fathom": "https://fathom.video/calls/701840529"
    },
    {
     "date": "2026-06-18",
     "time": "14:30",
     "state": "held",
     "title": "AI Ticket Intake Touchbase | Metro Sales",
     "fathom": "https://fathom.video/calls/713487396"
    },
    {
     "date": "2026-06-25",
     "time": "14:30",
     "state": "cancelled",
     "title": "Canceled: AI Ticket Intake - Weekly Call w/ Metro Sales",
     "reason": "\"As per Client request\" — Dan Olsen 在测试质量不佳后质疑周会频率",
     "requested_by": "客户",
     "email": "emails/metrosales.com/2026-06-25_Canceled- AI Ticket Intake - Weekly Call w- Metro Sales.md",
     "reason_en": "\"As per Client request\" — Dan Olsen questioned the weekly cadence after poor test quality"
    },
    {
     "date": "2026-07-02",
     "time": "14:30",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales",
     "fathom": "https://fathom.video/calls/730210747"
    },
    {
     "date": "2026-07-09",
     "time": "14:30",
     "state": "cancelled",
     "title": "Canceled: AI Ticket Intake - Weekly Call w/ Metro Sales",
     "reason": "James:会议冲突 + 无更新",
     "requested_by": "客户",
     "email": "emails/metrosales.com/2026-07-09_Canceled- AI Ticket Intake - Weekly Call w- Metro Sales.md",
     "reason_en": "James: meeting conflict plus no updates"
    },
    {
     "date": "2026-07-16",
     "time": "14:30",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales",
     "fathom": "https://fathom.video/calls/746817893"
    },
    {
     "date": "2026-07-23",
     "time": "14:30",
     "state": "norecord",
     "silent": true,
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales",
     "note": "Glenn 和 Grace 的日历都没有这一场,且无取消邮件——第 3 次断档但完全没有书面记录",
     "note_en": "Absent from both Glenn's and Grace's calendars with no cancellation email — the third gap, and the only one with no written trace"
    },
    {
     "date": "2026-07-30",
     "time": "14:30",
     "state": "norecord",
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales"
    },
    {
     "date": "2026-08-06",
     "time": "14:30",
     "state": "cancelled",
     "title": "Canceled: AI Ticket Intake - Weekly Call w/ Metro Sales",
     "reason": "Dan Olsen 当天以邮件请假：David 休假、James 在参加会议。本周无产品讨论。",
     "requested_by": "客户",
     "email": "emails/metrosales.com/2026-08-06_Re- AI Ticket Intake - Weekly Call w- Metro Sales.md",
     "reason_en": "Dan Olsen sent regrets by email that morning — David Ulbrich out, James Eubanks at a conference. No product discussion this week.",
     "note": "本次修正：此前记为「无记录」，实际有书面取消。Dan Olsen 原话：\"I won't make it today. David is out and James is at a conference, so unsure of his availability.\"（2026-08-06 22:28 UTC，Grace 在 Cc；Glenn 22:35 回复 \"No worries!\"）",
     "note_en": "Corrected this run: previously logged as \"no record\", but there is a written cancellation. Dan Olsen: \"I won't make it today. David is out and James is at a conference, so unsure of his availability.\" (2026-08-06 22:28 UTC, Grace on Cc; Glenn acknowledged at 22:35 with \"No worries!\")"
    },
    {
     "date": "2026-08-13",
     "time": "14:30",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales",
     "fathom": "https://fathom.video/calls/781050095",
     "note": "本次改判：由「未来排期」变为「已开」。客户方三人（Dan Olsen、David Ulbrich、James Eubanks）全部出席，是 6/18 以来第一次三人到齐。会上定位了转接失败的根因：AI 把 Metro Sales 的 Zoom auto attendant 当成语音信箱，接通瞬间就挂断，技术员根本来不及按 1。Glenn 当天 17:15 UTC 的纪要邮件原话：\"We confirmed that this is the final blocker before moving forward with the paid plan.\"",
     "note_en": "Reclassified this run from Scheduled to Held. All three client-side people (Dan Olsen, David Ulbrich, James Eubanks) attended — the first full turnout since 6/18. The call root-caused the transfer failure: the AI reads Metro Sales' Zoom auto attendant as voicemail and hangs up the instant it answers, before the technician can press 1. Glenn's summary email at 17:15 UTC that day states: \"We confirmed that this is the final blocker before moving forward with the paid plan.\""
    },
    {
     "date": "2026-08-20",
     "time": "14:30",
     "state": "norecord",
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales",
     "note": "本轮（8/21）改判：由「未来排期」改为「无记录」，而且不是自动降级，是查过三个渠道之后的结论。① 邀请确实存在且没被取消：8/21 复查 Glenn 日历，2026-08-20 14:30–15:00 UTC 的 \"AI Ticket Intake - Weekly Call w/ Metro Sales\" 在，organizer 是 Glenn，isCancelled=false，受邀人 dolsen@ / dulbrich@ / jeubanks@metrosales.com 加我方 6 人。② 没有任何开会证据：Fathom 按 \"Metro Sales\" 全文搜 8/13–8/20（50 场）只命中三场内部会，8/20 当天 21 场录像里没有 Metro Sales 的客户场；meetings/Metro Sales/ 下最新的纪要仍是 8/13；会后也没有任何纪要邮件。③ 当天唯一的对客动作发生在会前 47 分钟：13:43 UTC Glenn 发信「I've re-enabled your 14-day AI Trial so you can continue testing」，通篇没有一句提到这场会。所以这一格既不是「开了没录」也不是「取消了」，是查不出来 —— 已列入 open_questions。",
     "note_en": "Re-judged this run (8/21) from scheduled to no-record — and not by the automatic downgrade, but after checking three channels. (1) The invite existed and was not cancelled: re-reading Glenn's calendar on 8/21, \"AI Ticket Intake - Weekly Call w/ Metro Sales\" sits at 14:30–15:00 UTC on 2026-08-20, organised by Glenn, isCancelled=false, with dolsen@, dulbrich@ and jeubanks@metrosales.com invited alongside six of ours. (2) There is no evidence it happened: a full-text Fathom search for \"Metro Sales\" over 8/13–8/20 (50 meetings) matched only internal calls, and none of the 21 recordings from 8/20 is a Metro Sales client session; the newest note under meetings/Metro Sales/ is still 8/13; and no summary email followed. (3) The only client-facing action that day came 47 minutes before the slot: at 13:43 UTC Glenn wrote \"I've re-enabled your 14-day AI Trial so you can continue testing\", without mentioning the call at all. So this cell is neither \"held but unrecorded\" nor \"cancelled\" — it cannot be established, and it is raised in the open questions."
    },
    {
     "date": "2026-08-27",
     "time": "14:30",
     "state": "noinvite",
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales",
     "note": "周四 14:30 的周会应该有这一场，但 8/20 复查 Glenn 日历（按 \"Metro Sales\" 全文查 8/20–9/30）只剩 8/20 一场，之后再无任何 occurrence —— 邀请没发或系列已终止，没有取消邮件。",
     "note_en": "The Thursday 14:30 weekly calls for this slot, but rechecking Glenn's calendar on 8/20 (full-text \"Metro Sales\", 8/20–9/30) returns only the 8/20 occurrence and nothing after it — the invite was never sent or the series was ended, with no cancellation email."
    },
    {
     "date": "2026-09-03",
     "time": "14:30",
     "state": "noinvite",
     "title": "AI Ticket Intake - Weekly Call w/ Metro Sales",
     "note": "同上：8/20 复查时 9/3 这一场在 Glenn 日历上不存在。这家判在 90%、只差一个 bug 就付费，周会却在 8/20 之后断了 —— 请确认是有意停还是漏发。",
     "note_en": "Same as above: on the 8/20 recheck there is no 9/3 occurrence on Glenn's calendar. This client sits at 90% and is one bug away from paying, yet the weekly stops after 8/20 — confirm whether that is deliberate or an oversight."
    }
   ],
   "pipeline_key": "Metro Sales (MSI)",
   "ticket_keys": [],
   "email_domain": "metrosales.com",
   "stage": "pricing",
   "stage_evidence": "7/15 Dan Olsen 给出分阶段上线方案（先只用于下班后紧急支援）；7/16 James 确认新 credits 定价在预算内并带出 TicketQA 交叉销售。技术侧也确实测了：15 张工单，6 个 bug 出自真实测试通话（3 通里有 2 通建单失败、转接时误判语音信箱挂断真人工程师、无技能时静默忽略排障请求、身份核验陷入 NATO 拼读循环、重复建单且工单号对不上）。AST-20618（来电匹配不到联系人时回退到公司名匹配）已 released & live。\n\n本次补充（档位不动，仍为 90%）：2026-08-13 的周会开成了（Fathom 781050095，客户方 Dan Olsen、David Ulbrich、James Eubanks 三人全到，Grace 在参会人里；本条取自 Fathom 摘要与 Glenn 当天的纪要邮件，纪要邮件正文已逐字读过，未逐字读 transcript，故不作档位依据）。这一场没有新的商务进展，谈的是唯一一个挡在付费转化前面的技术问题：AI 把 Metro Sales 的 Zoom auto attendant 当成语音信箱，接通瞬间挂断，Zoom 侧录音显示 AI 在 0:00 秒就断开。Glenn 当天 17:15 UTC 的纪要邮件（emails/metrosales.com/2026-08-13_Metro Sales — AI Ticket Intake Weekly Call Summary (Aug 13, 2026)...md）原话：\"We confirmed that this is the final blocker before moving forward with the paid plan.\" 注意这与 Valeo 的 AST-20255（转接遇 auto attendant 被误判为语音信箱）是同一个失败类别，那张单自 6 月起仍是 in development。另：James 说过去一个半到两个月里，验证循环、语速节奏这些粗糙处已经解决，skill 现在能正确转接了 —— 也就是说 bug 面在收敛，只剩这一个。",
   "cadence_en": "Thu 14:30 · no record of the 8/20 session · no invite after 8/20 · full turnout 8/13",
   "stage_evidence_en": "On 7/15 Dan Olsen laid out a phased go-live (after-hours emergency support first); on 7/16 James confirmed the new credits pricing fits the budget and opened a TicketQA cross-sell. The technical side is real too: 15 tickets, 6 of them bugs from live test calls (ticket creation failed on 2 of 3 calls, false voicemail detection hanging up on a live engineer, troubleshooting requests silently ignored with no skill, a NATO-spelling loop in identity verification, duplicate tickets with mismatched numbers). AST-20618 — falling back to company-name matching when contact match fails — is released & live.\n\nAdded this run (the rung is unchanged at 90%): the 2026-08-13 weekly went ahead (Fathom 781050095, with Dan Olsen, David Ulbrich and James Eubanks all present and Grace on the invitee list). This entry comes from the Fathom summary plus Glenn's own summary email, whose body was read verbatim; the transcript was not read verbatim, so it does not carry the rung. There was no new commercial movement — the call was about the one technical problem standing between them and paid conversion: the AI reads Metro Sales' Zoom auto attendant as voicemail and disconnects the moment it answers, with the Zoom-side recording showing the AI dropping at 0:00. Glenn's summary email at 17:15 UTC (emails/metrosales.com/2026-08-13_Metro Sales — AI Ticket Intake Weekly Call Summary (Aug 13, 2026)...md) says: \"We confirmed that this is the final blocker before moving forward with the paid plan.\" Note that this is the same failure class as Valeo's AST-20255 (a transfer reaching an auto attendant misread as voicemail), which has sat in development since June. Also worth recording: James said the rough edges of the past six to eight weeks — verification cycling, pacing — are resolved and skills now transfer correctly, so the bug surface has narrowed to this one item.",
   "ticket_match": [
    "metro sales"
   ],
   "next_action": "【8/27 更新：试用期第一次有了明确的到期日，而客户已经连续两封信没回】① 2026-08-26 10:04 UTC Glenn 给 James Eubanks 去信（正文逐字读过，追加在 emails/metrosales.com/2026-08-13_... 线程里）：\"Just checking in — you still have 9 days remaining on your free trial. I wanted to see if you've had a chance to test the fix from our team.\" —— 按这句话，8/20 重开的 14 天试用大约 9/4 到期。客户对 8/20 与 8/26 这两封信都没有回复，James 最后一次实质回复仍停在 8/17 之前。② 8/20 14:30 那场周会至今查不出是否开过（见该格的注与 open_questions），8/27、9/3 两场在 Glenn 日历上仍然不存在 —— 一家判在 90%、只差一个 bug 就付费的客户，现在既没有例会也没有回信，而试用有到期日。③ 挡在付费前面的仍是同一件事：转接遇 Zoom auto attendant 被误判为语音信箱而挂断，与 Valeo 的 AST-20255（86e20pbz1，本轮复查仍 in development）是同一失败类别，两张单应合到一个修复里。④ 还需要 James 交出专用的 Zoom 测试号码/分机。",
   "next_action_en": "[8/27 update: the trial now has a concrete expiry date, and the client has gone two emails without replying] (1) At 10:04 UTC on 2026-08-26 Glenn wrote to James Eubanks (body read verbatim; appended to the thread in emails/metrosales.com/2026-08-13_...md): \"Just checking in — you still have 9 days remaining on your free trial. I wanted to see if you've had a chance to test the fix from our team.\" On that sentence, the 14-day trial re-enabled on 8/20 runs out around 9/4. The client has answered neither the 8/20 nor the 8/26 mail, and James's last substantive reply still predates 8/17. (2) Whether the 8/20 14:30 weekly happened is still unestablished (see the note on that cell and open_questions), and neither 8/27 nor 9/3 exists on Glenn's calendar — so a client at 90%, one bug away from paying, currently has no weekly, no replies, and a trial with an expiry date. (3) The blocker is unchanged: the transfer to their Zoom auto attendant is misread as voicemail and disconnected, the same failure class as Valeo's AST-20255 (86e20pbz1, re-checked this run and still in development); the two should be fixed together, not separately. (4) James still owes us a dedicated Zoom test number/extension."
  },
  {
   "track": "alpha",
   "name": "Essential Tech",
   "contact": "Michael · Simon · Nidhi Patel",
   "cadence": "周三 06:00 → 7/31 起周五 01:00 · 8/14 已开 · 下次口头定在 9/4",
   "status": "活跃",
   "events": [
    {
     "date": "2026-06-10",
     "time": "06:00",
     "state": "norecord",
     "title": "MSPbots | AI Ticket Intake - Toucbhase"
    },
    {
     "date": "2026-06-17",
     "time": "06:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "fathom": "https://fathom.video/calls/713270554"
    },
    {
     "date": "2026-06-24",
     "time": "06:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "fathom": "https://fathom.video/calls/720178844"
    },
    {
     "date": "2026-07-01",
     "time": "06:00",
     "state": "norecord",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech"
    },
    {
     "date": "2026-07-08",
     "time": "06:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "fathom": "https://fathom.video/calls/736583434"
    },
    {
     "date": "2026-07-15",
     "time": "06:00",
     "state": "norecord",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech"
    },
    {
     "date": "2026-07-22",
     "time": "06:00",
     "state": "norecord",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech"
    },
    {
     "date": "2026-07-31",
     "time": "01:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "fathom": "https://fathom.video/calls/765857227",
     "note": "改到周五 11am AEST(Nidhi Patel 7/29 确认)",
     "note_en": "Moved to Friday 11am AEST (confirmed by Nidhi Patel on 7/29)"
    },
    {
     "date": "2026-08-07",
     "time": "01:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "fathom": "https://fathom.video/calls/775402465",
     "note": "2 分钟的短会。Nidhi Patel 明确说还没测：\"But I haven't tested the system yet. I will test it, and I'll get back to you for the feedback as well for this week.\" 节奏说法前后不一致（先说「every fourth night Friday…for this month」，随后又确认「Next week, Friday, same time」）。Glenn 已发口音样本待她反馈。",
     "note_en": "A two-minute call. Nidhi Patel stated plainly that she has not tested yet: \"But I haven't tested the system yet. I will test it, and I'll get back to you for the feedback as well for this week.\" Her cadence wording was self-contradictory (first \"every fourth night Friday… for this month\", then confirming \"Next week, Friday, same time\"). Glenn sent an accent sample awaiting her feedback."
    },
    {
     "date": "2026-08-14",
     "time": "01:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "fathom": "https://fathom.video/calls/782689046",
     "note": "本次改判：由「未来排期」变为「已开」。Nidhi Patel 出席、Simon Edmed 缺席（纪要 meetings/Essential Tech/2026-08-14-AI-Ticket-Intake-Weekly-Touchbase.md，transcript 已逐字读过）。这是这家第一次拿到 Nidhi 亲自打测试电话后的反馈——她在下班时段扮成难缠客户打进来，原话 \"I did some of the calls that after hours... I was trying to be a nasty customer.\"。三个问题：① AI 抢话，音调忽高忽低，\"one moment, please\" 听起来像第二个更机械的声音，她判断是 TTS 合成加延迟；② 一通电话报了打印机和 VPN 两个问题，AI 中途把打印机那个丢了；③ 听不懂「已经试过什么」的叙述——她说已重连 Wi-Fi、热点、以太网并重配过 VPN，AI 仍回到「有没有重连 Wi-Fi」。建单功能仍未开启：需要 Essential Tech 在账号上授予 PSA 权限（Simon 决定），Nidhi 明说质量改善前不想开。Glenn 演示了新的轮值 / 排班 / 通知能力，但排班还不能对接他们在用的 Shift，只能手工改。节奏改到 9/4，购买决定在 Simon 手里。",
     "note_en": "Reclassified this run from Scheduled to Held. Nidhi Patel attended and Simon Edmed did not (notes at meetings/Essential Tech/2026-08-14-AI-Ticket-Intake-Weekly-Touchbase.md; transcript read verbatim). It is the first session carrying feedback from test calls Nidhi placed herself — she rang in after hours playing a difficult caller: \"I did some of the calls that after hours... I was trying to be a nasty customer.\" Three problems: (1) the agent talks over her, the pitch wanders, and \"one moment, please\" sounds like a second, more robotic voice — she reads it as TTS synthesis plus latency; (2) she reported a printer fault and a VPN fault on one call and the agent silently dropped the printer one mid-conversation; (3) it cannot follow an account of what has already been tried — she had reconnected Wi-Fi, a hotspot and ethernet and reconfigured the VPN, and the agent still looped back to \"have you reconnected the Wi-Fi\". Ticket creation is still off: it needs Essential Tech to grant PSA permission on the account (Simon's call), and Nidhi said plainly she does not want it on until the quality improves. Glenn demoed the new rotation / scheduling / notification capabilities, though the rosters cannot yet read from Shift, which they use, so changes are manual. The cadence moves to 4 September and the purchase decision sits with Simon."
    },
    {
     "date": "2026-08-21",
     "time": "01:00",
     "state": "cancelled",
     "title": "Canceled: AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "reason": "Glenn 8/18 撤会，按 Nidhi 8/14 会上的要求改期到 9/4",
     "reason_en": "Withdrawn by Glenn on 8/18 and moved to 4 September, per Nidhi's request on the 8/14 call",
     "requested_by": "客户",
     "email": "emails/essentialtech.com.au/2026-08-18_AI Ticket Intake - Weekly Touchbase.md",
     "note": "本次改判：由「未来排期」改为「已取消」，上一轮挂了 3 天的口径矛盾就此消解。2026-08-18 13:15 UTC Glenn 在同一线程发信（Outlook 原件已逐字读过；收件人 npatel@、simon@、product@、Grace、Leonard），正文第一句原话：\"Cancelling this meeting - New schedule on September 4 as per Nidthi.,\"（Nidhi 的名字他拼错了）。复查 Glenn 日历：8/21 01:00 这一场已经不在日历上了（单次取消会被 Outlook 抹掉，见 README 的 gotcha），取而代之的是 2026-09-04 01:00 UTC 的「AI Ticket Intake - Weekly Touchbase」，受邀人 npatel@、simon@、product@ —— 与 8/14 会上两人口头约定的 9/4 对上了。9/4 那一场已作为「未来排期」记进格子（本轮把看板窗口标签从 8/23 改到 9/6，周格子本来就画到今天+14 天所在周）。另注意：仓库里 emails/essentialtech.com.au/2026-08-18 那份导出只留下了 Teams 加入信息，把「Cancelling this meeting」这句正文丢掉了，只看仓库文件会以为这是一封普通的会议邀请。",
     "note_en": "Reclassified this run from Scheduled to Cancelled, which closes the contradiction the board has carried since 8/15. At 13:15 UTC on 2026-08-18 Glenn wrote on the same thread (the original was read verbatim in Outlook; to npatel@, simon@, product@, Grace and Leonard) and its first line reads: \"Cancelling this meeting - New schedule on September 4 as per Nidthi.,\" (he misspells Nidhi). A re-check of Glenn's calendar confirms the 8/21 01:00 occurrence is no longer there — a single cancelled occurrence is erased outright by Outlook, per the gotcha in the runbook — and in its place sits \"AI Ticket Intake - Weekly Touchbase\" on 2026-09-04 at 01:00 UTC with npatel@, simon@ and product@ invited, matching the 4 September the two of them agreed verbally on the 8/14 call. The 9/4 slot is now recorded as a scheduled cell (this run corrected the window label from 8/23 to 9/6; the week grid has always run to the week containing today plus fourteen days). Note also that the repo copy at emails/essentialtech.com.au/2026-08-18 kept only the Teams join block and dropped the \"Cancelling this meeting\" line, so the repo file alone reads like an ordinary invite."
    },
    {
     "date": "2026-09-04",
     "time": "01:00",
     "state": "upcoming",
     "title": "AI Ticket Intake - Weekly Touchbase | Essential Tech",
     "note": "8/18 Glenn 撤掉 8/21 那场时改期到这里，受邀人 npatel@、simon@、product@（8/19 复查 Glenn 日历）。",
     "note_en": "Glenn moved the cadence here when he withdrew the 8/21 slot on 8/18; invitees npatel@, simon@ and product@ (Glenn's calendar re-checked 8/19)."
    }
   ],
   "pipeline_key": "Essential Tech",
   "ticket_keys": [
    "Essential Tech",
    "essentialtech.com.au"
   ],
   "email_domain": "essentialtech.com.au",
   "stage": "selftest",
   "stage_evidence": "11 张工单（含 1 张 onboarding），5 条 bug/质量反馈。未见真实来电接入证据，也没有定价讨论。\n\n本次补充（档位不动，仍为 55%，但 55% 的依据换了人）：2026-08-14 的周会开成了（Fathom 782689046，transcript 已逐字读过），Nidhi Patel 第一次亲自打了测试电话并给出逐条反馈 —— 她在下班时段扮成难缠客户打进来，原话 \"I did some of the calls that after hours... I was trying to be a nasty customer.\"，并当场复述了三类失败：抢话与机械音（\"It's over talking to me when I'm talking... it sounds more robotic than anything else\"）、两个问题只处理一个（\"in a midway, she dropped the second issue\"）、以及听不懂已做过的排障（\"it did not log thing, it just said I'm doing the advanced troubleshooting, but then it back to the Wi-Fi reconnecting\"）。这条把 8/7 那句「I haven't tested the system yet」带来的疑问关掉了：这家确实处在 MSP 自测阶段，只是测试人从 Michael/Simon 换成了 Nidhi。不能再往上走的理由也很清楚：**建单功能至今没开**（需要 Essential Tech 授予 PSA 权限，Simon 决定，Nidhi 明说质量改善前不想开），因此没有真实来电接入，也没有任何定价讨论 —— 购买决定在 Simon 手里，Nidhi 说 ATI \"is a priority, but... we do have some really, really high priority stuff going on\"。当天开出并当天上线三张 bug 单（86e2u63ny 忽略已做过的排障、86e2u63tb「one moment please」音频拼接、86e2u63uz 通话中延迟）。",
   "cadence_en": "Wed 06:00 → Fri 01:00 from 7/31 · held 8/14 · next agreed verbally for 9/4",
   "stage_evidence_en": "11 tickets (incl. 1 onboarding) and 5 bug/quality items. No evidence of live caller traffic and no pricing discussion yet.\n\nAdded this run (the rung is unchanged at 55%, but the evidence behind it now rests on a different person): the weekly of 2026-08-14 went ahead (Fathom 782689046, transcript read verbatim) and Nidhi Patel had placed her own test calls for the first time, walking through them item by item — she rang in after hours playing a difficult caller, \"I did some of the calls that after hours... I was trying to be a nasty customer.\", and described three failure modes on the call: talking over her in a robotic voice (\"It's over talking to me when I'm talking... it sounds more robotic than anything else\"), handling only one of two reported issues (\"in a midway, she dropped the second issue\"), and failing to register troubleshooting already done (\"it did not log thing, it just said I'm doing the advanced troubleshooting, but then it back to the Wi-Fi reconnecting\"). That closes the question opened by her 8/7 \"I haven't tested the system yet\": this client really is in MSP self-test, the tester has simply changed from Michael/Simon to Nidhi. Why it cannot climb higher is equally clear: **ticket creation is still not switched on** — it needs Essential Tech to grant PSA permission, which is Simon's call, and Nidhi said outright she does not want it on until quality improves — so there is no live caller traffic and no pricing conversation at all. The buying decision sits with Simon; Nidhi's words were that ATI \"is a priority, but... we do have some really, really high priority stuff going on\". Three bug tickets were raised and shipped the same day (86e2u63ny — ignoring troubleshooting the caller has already done; 86e2u63tb — spliced audio on \"one moment, please\"; 86e2u63uz — latency mid-call).",
   "ticket_match": [
    "essential tech",
    "essentialtech"
   ],
   "next_action": "【8/19 更新】上一轮挂着的日历矛盾解决了，档位不动（55%）：8/18 13:15 UTC Glenn 撤掉了 8/21 那一场并改期到 9/4 01:00 UTC，邀请已经发出（受邀人 npatel@、simon@、product@），8/21 因此由「未来排期」改判为「已取消」。真正的后果是排期本身：从今天到 9/4 有 16 天没有任何一场会，而 8/14 提出的三个问题对应的三张单（AST-21484 / 21486 / 21487）8/14 当天就上线了 —— 没有会可以当面验，就必须书面回告 Nidhi「哪三条已经改好、怎么验」，并请她在 9/4 之前再打一轮测试电话；否则等到 9/4 才发现没修好，这家等于白等三周。PSA 建单权限（Simon 决定）也要在这 16 天里推，而不是留到会上再提。\n\n①（本次最要紧）Nidhi 现在是这家唯一的测试人，而她提的三条都是通话体验的根：抢话/机械音、多问题只处理一个、听不懂已做过的排障。三张单 8/14 当天开当天上线（86e2u63ny / 86e2u63tb / 86e2u63uz）—— 但 9/4 之前没有任何会可以当面验证，所以修完必须书面回告并请她再打一轮，别等到 9/4 才发现没修好。② 她主动提出可以直接和开发聊后端（\"if your developer wants to speak to me or your developer need help, let me know\"）—— 她自己做过同类产品，这是免费的专家反馈，Glenn 应该真的安排一次，别只当客气话。③ 建单权限这件事要去找 Simon，不是 Nidhi：授予 PSA 权限是 Simon 的决定，而 Nidhi 还想先弄清是测试环境还是生产环境。在这之前这家不可能进到「真实来电接入」，档位也就卡在 55%。④ 日历要改：8/21 那一场还挂在 Glenn 日历上，而双方口头已经把下一次定在 9/4，日历上又没有 9/4 —— 两边对不上，客户会收到一个他们已经说过开不了的邀请。⑤ AST-20986 / AST-20987（多步排障跳回上一步、明确要求转人时的共情话术）8/6、8/4 就完成了，8/14 这场会上仍然一句没提 —— 现在已经躺了 9 天和 11 天，而下一次见面在 9/4。别再等会议，直接发一封书面回告。",
   "next_action_en": "[Update 8/19] The calendar contradiction carried from the last run is resolved and the rung is unchanged at 55%: at 13:15 UTC on 8/18 Glenn withdrew the 8/21 session and moved it to 4 September at 01:00 UTC, with the invite already out (npatel@, simon@, product@), so 8/21 is reclassified from Scheduled to Cancelled. The consequence that matters is the schedule itself: there is now no session at all for 16 days, while the three tickets raised from her 8/14 feedback (AST-21484 / 21486 / 21487) all shipped that same day. With no meeting to verify them face to face, Nidhi needs a written report-back naming which three things were fixed and how to check them, plus a request that she run another round of test calls before 4 September — otherwise a failed fix will not surface until 9/4 and this client will have waited three weeks for nothing. The PSA ticket-creation permission (Simon's decision) has to be chased inside those 16 days too, not saved for the meeting.\n\n1. (most urgent this run) Nidhi is now the only tester at this client, and all three things she raised go to the core of the call experience: talking over the caller with a robotic voice, handling only one of several issues, and failing to follow troubleshooting already done. Three tickets were raised and shipped on 8/14 (86e2u63ny / 86e2u63tb / 86e2u63uz) — but there is no meeting before 4 September at which to verify them, so the fixes need a written report-back and a request that she run another round of calls, rather than waiting three weeks to discover they missed. 2. She offered to talk to the developers directly about the backend (\"if your developer wants to speak to me or your developer need help, let me know\") — she has built products like this herself, so this is free expert feedback and Glenn should actually arrange it instead of treating it as politeness. 3. The ticket-creation permission has to be chased with Simon, not Nidhi: granting PSA permission is his decision, and Nidhi also wants to know first whether this is a test or the live environment. Until that happens this client cannot reach live caller traffic and the rung stays at 55%. 4. Fix the calendar: the 8/21 slot is still sitting on Glenn's calendar while the two of them agreed verbally on 4 September, which is not on the calendar at all — the client will receive an invite for a session they have already said they cannot make. 5. AST-20986 and AST-20987 (jumping back a step in multi-step troubleshooting, and the empathetic hand-off when a caller asks for a human) were completed on 6 and 4 August and still did not come up on the 8/14 call — that is now 9 and 11 days with no word, and the next meeting is 4 September. Stop waiting for a meeting and send a written update."
  },
  {
   "track": "alpha",
   "name": "ACTS360",
   "contact": "J. Mejia · R. Austin · B. Ussery",
   "cadence": "ATI 周会 7/7 后停 · 8/12 在 CSM 月度例会里重新谈起",
   "status": "风险",
   "events": [
    {
     "date": "2026-06-18",
     "time": "15:30",
     "state": "cancelled",
     "title": "Canceled: AI Ticket Intake - Acts360",
     "reason": "\"To reschedule\" —— 唯一一场在日历上真的留下 isCancelled 痕迹的取消",
     "requested_by": "MSPbots",
     "reason_en": "\"To reschedule\" — the only cancellation that actually left an isCancelled trace on the calendar"
    },
    {
     "date": "2026-06-23",
     "time": "—",
     "state": "held",
     "title": "AI Ticket Intake Product Demo with ACTS360",
     "fathom": "https://fathom.video/calls/718816204"
    },
    {
     "date": "2026-07-07",
     "time": "15:00",
     "state": "held",
     "title": "AI Ticket Intake Touchbase w/ ACTS360",
     "fathom": "https://fathom.video/calls/735721553"
    },
    {
     "date": "2026-08-12",
     "time": "—",
     "state": "held",
     "title": "MSPbots | Acts360 - Monthly Catch Up",
     "fathom": "https://fathom.video/calls/781056252",
     "note": "本次新增。注意口径：这是 Jazz Laban 的 CSM 月度例会，不是 ATI 周会 —— ATI 周会自 7/7 起就没再开过。把它记进来是因为会上确实实质讨论了 ATI（定价档位、ROI、credit 耗尽时的行为），参会人只有 Joshua Mejia 和 Jazz。本条内容取自 Fathom 摘要，未逐字读 transcript，因此只用于记录接触事实，不用于任何档位判定。**8/6–8/7 上线的三个升级能力（AST-20245/20246/20247，ACTS360 正是原始提出方）在这一场里没有被提到。**",
     "note_en": "Added this run. Read the scope carefully: this is Jazz Laban's CSM monthly, not an ATI touchbase — the ATI weekly has not run since 7/7. It is recorded because ATI was genuinely discussed (pricing tiers, ROI, what happens when credits run out), with only Joshua Mejia and Jazz present. The content here comes from the Fathom summary rather than a verbatim transcript, so it is used only to record that contact happened, never to assign a rung. **The three escalation capabilities shipped on 6–7 Aug (AST-20245/20246/20247, which ACTS360 themselves asked for) did not come up on this call.**"
    }
   ],
   "pipeline_key": "ACTS360",
   "ticket_keys": [
    "ACTS360"
   ],
   "email_domain": "acts360.com",
   "stage": "pricing",
   "stage_evidence": "定价讨论已具体到分钟经济学：Ryan 引用 591 通电话、约 2,000 通/月 × 约 10 秒路由 ≈ 333 分钟，指出 200 分钟基础套餐会卡住白天自助场景。7 张工单、5 项已交付。\n\n本次补充（来源为 Fathom 摘要，非逐字 transcript，故不作档位依据，档位维持 90%）：2026-08-12 的 CSM 月度例会上 ATI 重新上桌。Jazz 给出了更新后的档位 —— Basic $399/月含 3,000 credits、Starter $699/月含 7,000 credits，credits 可在 Ticket Intake 与 TicketQA 之间通用；Joshua 之前拿到的是 $399/月约 500 分钟的旧口径，要求重算。真正的新阻力不在价格而在 ROI：ACTS360 没有面向客户的 SOP 或知识库（现有 SOP 是内部的、且是图片），AI 无法自主解决问题，那么 ATI 就只剩接电话、建单、路由，而这些事他们的人本来就在做 —— Joshua 在权衡「建知识库要投入的时间人力」是否划算。他另外问了 credits 在通话中途耗尽会怎样，Jazz 只能确认 80%/90%/95% 会有提醒、耗尽后的行为需要回去确认。",
   "cadence_en": "ATI weekly stopped after 7/7 · picked back up on the 8/12 CSM monthly",
   "stage_evidence_en": "Pricing has reached unit economics: Ryan cited 591 calls and ~2,000 calls/month × ~10s routing ≈ 333 minutes, arguing the 200-minute base plan blocks the daytime self-service case. 7 tickets, 5 delivered.\n\nAdded this run (sourced from the Fathom summary rather than a verbatim transcript, so it does not carry the rung, which stays at 90%): ATI was back on the table at the CSM monthly of 2026-08-12. Jazz gave the updated tiers — Basic at $399/month for 3,000 credits and Starter at $699/month for 7,000, with credits fungible between Ticket Intake and TicketQA; Joshua had been quoted the older $399-for-~500-minutes shape and asked to recalculate. The real new obstacle is ROI rather than price: ACTS360 has no customer-facing SOPs or knowledge base (theirs are internal and image-based), so the AI cannot resolve anything autonomously, which leaves ATI answering calls, creating tickets and routing them — work their own people already do. Joshua is weighing that against the time and labour of building a suitable knowledge base. He also asked what happens if AI credits run out mid-call; Jazz could only confirm the 80/90/95% warnings and had to take the depletion behaviour away to check.",
   "ticket_match": [
    "acts360",
    "acts 360"
   ],
   "next_action": "①（本次新增的坏消息）8/13 03:14 UTC Jazz 给 Joshua 发了 8/12 例会的跟进信（emails/acts360.com/2026-08-13_AI Widget Builder Resources & Additional AI Initiatives...md，正文已读）—— 内容是 AI Widget Builder、MCP Server、SOP Agent 三件事的材料，**AST-20245/20246/20247 这三张他自己提的、已经上线一周的单，在这封跟进信里同样一个字都没提。** 也就是说 8/12 见面没提、8/13 书面跟进也没提，看板的「已回告？」列却会因为这两次接触显示为「上线后已有接触」。这条现在是全板最典型的「接触发生了但没回告」。② 最要紧的一条：ACTS360 是 AST-20245/20246/20247 的原始提出方，三张单 8/6–8/7 就上线了，而 8/12 的例会上一句都没提到。看板的「已回告？」列现在会因为 8/12 这场会显示为「已接触」—— 那只证明接触发生过，不证明讲了这三张单。Glenn 仍然欠 ACTS360 一封正式回告：上线了什么、怎么配、请验证。回告前先读「数据存疑」里 AST-20245 划掉 AC-3/AC-5 那条。② ROI 才是新的阻力，不是价格。Joshua 卡在「没有面向客户的 SOP/KB，AI 就只能接电话建单，省不下人力」。这正好是三个升级能力（分时段路由、自动轮值、挂断通知）能回答的问题 —— 它们替代的是 Answer Connect 的人工值守成本，不依赖知识库。把 ROI 叙事从「AI 自助解决」换成「替掉 Answer Connect」。③ Jazz 欠 Joshua 两件事：更新后的档位与语音分钟换算、以及 credits 中途耗尽时通话会怎样 —— 后者对一个准备把主号指过来的客户是硬问题，别拖。",
   "next_action_en": "1. (bad news added this run) At 03:14 UTC on 8/13 Jazz sent Joshua the follow-up to the 8/12 monthly (emails/acts360.com/2026-08-13_AI Widget Builder Resources & Additional AI Initiatives...md, body read) — covering the AI Widget Builder, the MCP Server and the SOP Agent. **AST-20245/20246/20247 — the three tickets ACTS360 themselves asked for, live for a week — are not mentioned once in that follow-up either.** So they came up neither on the 8/12 call nor in the written follow-up the next day, while the board's \"client told?\" column reads as contact-made on the strength of both. This is now the clearest case on the board of contact happening without the client being told. 2. The most important item: ACTS360 originally asked for AST-20245/20246/20247, all three shipped on 6–7 Aug, and not one of them came up on the 8/12 monthly. The board's \"client told?\" column will now read as contact-made because of that meeting — which proves contact happened, not that these tickets were discussed. Glenn still owes ACTS360 a proper write-up: what shipped, how to configure it, please verify. Read the open question about AST-20245's struck-through AC-3/AC-5 before sending it. 2. ROI, not price, is the new obstacle. Joshua is stuck on having no customer-facing SOPs or KB, which leaves the AI answering calls and creating tickets with no labour saved. That is exactly what the three shipped capabilities answer — time-based routing, automated rotation and hang-up notification replace the cost of Answer Connect's manned cover and need no knowledge base at all. Move the ROI story from \"the AI resolves it\" to \"this replaces Answer Connect\". 3. Jazz owes Joshua two things: the updated tiers with voice-minute equivalents, and what happens to a call when AI credits run out mid-conversation — the latter is a hard question for a client about to point their main number at us, so do not let it drift."
  },
  {
   "track": "alpha",
   "name": "ExperaIT",
   "contact": "Glenn Freeman",
   "cadence": "周五 16:00 · 7/17 重发邀请后无场次",
   "status": "已流失",
   "events": [
    {
     "date": "2026-06-19",
     "time": "—",
     "state": "held",
     "title": "Expera IT | MSPbots AI Ticket Intake Demo",
     "fathom": "https://fathom.video/calls/716538027"
    },
    {
     "date": "2026-06-26",
     "time": "16:00",
     "state": "norecord",
     "title": "AI Ticket Intake - Weekly Call w/ ExperaIT"
    },
    {
     "date": "2026-07-03",
     "time": "16:00",
     "state": "cancelled",
     "title": "Canceled: AI Ticket Intake - Weekly Call w/ ExperaIT",
     "reason": "美国独立日假期(Glenn 7/2 发出取消)",
     "requested_by": "MSPbots",
     "email": "emails/experait.com/2026-07-02_Canceled - AI Ticket Intake Weekly Call w- ExperaIT.md",
     "reason_en": "US Independence Day holiday (Glenn sent the cancellation on 7/2)"
    },
    {
     "date": "2026-07-10",
     "time": "16:00",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Call w/ ExperaIT.com",
     "fathom": "https://fathom.video/calls/741383726"
    },
    {
     "date": "2026-07-17",
     "time": "16:00",
     "state": "norecord",
     "silent": true,
     "title": "AI Ticket Intake - Weekly Call w/ ExperaIT",
     "note": "Glenn 7/17 重新发出 recurring 邀请想恢复节奏,但日历上不存在任何后续场次,也无录像——邀请很可能从未被接受",
     "note_en": "Glenn re-sent the recurring invite on 7/17 to restart the cadence, but no later occurrence exists on the calendar and there is no recording — the invite was probably never accepted"
    }
   ],
   "pipeline_key": "Expera IT",
   "ticket_keys": [
    "ExperaIT.com"
   ],
   "email_domain": "experait.com",
   "stage": "lost",
   "stage_evidence": "7/13 确认流失：已上线竞品 NeoAgent 同时做 triage 和 intake，理由是单平台整合 + 约 1 小时即可配好。可能在 MSPbots intake 更成熟后回头看。",
   "lost_reason": "转投竞品 NeoAgent（triage + intake 一体），看重单平台整合与约 1 小时的配置速度。",
   "next_action": "等 MSPbots intake 更成熟后再接触；竞品对比点已同步给 CSM（$199 vs NeoAgent 约 $1,300/月核心 + $300/月电话模块）。",
   "rejection": {
    "channel": "meeting",
    "date": "2026-07-13",
    "who": "Glenn Freeman",
    "quote": "已上线竞品 NeoAgent 同时做 triage 和 intake，理由是单平台整合 + 约 1 小时即可配好。",
    "ref": "feedback.json FB（来源为 CSM 通话纪要）· 无拒绝邮件 —— emails/experait.com 最后一封是 7/17 的重发邀请",
    "who_en": "Glenn Freeman",
    "quote_en": "Went live on competitor NeoAgent for triage and intake together, citing single-platform consolidation and ~1-hour setup.",
    "ref_en": "feedback.json (sourced from CSM call notes) · no decline email — the last item in emails/experait.com is the 7/17 re-invite"
   },
   "cadence_en": "Fri 16:00 · no sessions after the 7/17 re-invite",
   "stage_evidence_en": "Churn confirmed 7/13: went live on competitor NeoAgent for both triage and intake, citing single-platform consolidation and ~1-hour setup. May look again once MSPbots intake matures.",
   "lost_reason_en": "Moved to competitor NeoAgent for triage and intake together, valuing single-platform consolidation and ~1-hour setup.",
   "next_action_en": "Re-approach once MSPbots intake is more mature; competitive points already shared with the CSM team ($199 vs NeoAgent ~$1,300/mo core + $300/mo phone add-on).",
   "ticket_match": [
    "expera"
   ]
  },
  {
   "track": "alpha",
   "name": "EstesGroup",
   "contact": "B. McCord · K. Topor",
   "cadence": "一次性 · 8/12 内部审批全部通过 · 8/13 内部宣布已付费（待核实）",
   "status": "活跃",
   "events": [
    {
     "date": "2026-06-25",
     "time": "15:00",
     "state": "held",
     "title": "AI Ticket Intake - EstesGroup",
     "fathom": "https://fathom.video/calls/721795745"
    }
   ],
   "pipeline_key": "EstesGroup",
   "ticket_keys": [
    "EstesGroup",
    "Estesgrp.com"
   ],
   "email_domain": "estesgrp.com",
   "stage": "pricing",
   "stage_evidence": "本次升档 55%→90%。2026-08-10 17:42 UTC Glenn 去信 Bill McCord，一是通报「your trial has 7 days remaining」并提出可以延长，二是问「do you have a rough sense of when you'll be through the sign-off conversations with leadership?」。同日 19:45 UTC Bill 回信，原话只有一句：\"Got it past the high hurdle, now some back office sweeping up to do... very close. More to follow.\" 结合他回答的正是「领导层签字何时走完」这个问题，这句话读作换供应商的内部审批已经通过、只剩后台收尾。商务条件此前已经书面给到：Glenn 8/4 的信写明 ATI 已进入付费墙、账号上开了 14 天 / 3,000 credits 的免费试用、ATI 按 6 credits/分钟计费、试用结束后可购买 credits 继续用 —— Bill 收到这些条件后没有提出任何价格异议，而是继续推内部签字。按阶梯定义（进入定价 / 合同讨论）判为 90%。技术侧证据不变：7/30 已确认自测完成（\"We're through the testing (great timing, KT was able to test today).\"），内部正负面反馈至今没有落成工单，所以 bug/enhancement 区仍是空的。\n\n本次补充（证据从「推断」变成「明说」）：2026-08-12 16:07 UTC Bill McCord 在同一线程里又回了一封，正文已逐字读过，原话是\"Approvals are in place, is there any contract work to do here?\"，并补了两句：\"I have given MSPBots permission to create a ticket (that's it, no delete, modify, etc.) and tested.\" 以及 \"Looking into how to get AITI to call our tech hotline when handoff is needed.\" 这直接把 8/10 那句「the high hurdle 到底指哪一关」的疑问解掉了 —— 他自己说的是 approvals 已经到位，并主动问合同要不要走。Glenn 同日 17:06 UTC 回复：不需要签新合同，走现有协议；唯一剩下的动作是到 MarketPlace 选一个 AI Credit Subscription 套餐，选完即生效（ATI 计费 6 credits = 1 分钟），并把 Accounting 的 Anushree Fomra 拉进了线程。档位仍判 90%（询价/商务）而不是 100% —— 阶梯的 100% 是「已付费」，套餐还没选、也还没产生账单。\n\n本次补充（重要，档位仍不动）：2026-08-13 02:30 UTC 的内部 Product-Platform L10（Fathom 780677829，纪要 meetings/internal/2026-08-13-Product-Platform-L10.md，取自逐字 transcript）披露这一单差点因为报价口径不一致丢掉。Glenn 在 [46:52] 的原话：\"I sent out a follow-up asking their sentiment on the pricing, based on our initial pricing — $199/month including 200 minutes, additional usage billed at $0.50/minute. But we shifted to the credit base, same as the other apps, and I was not able to update this client. ... when I emailed him yesterday about the credit-subscription pricing, he was confused. The AI ticket intake is 6 credits per minute, so $199/1,000 credits is only around 166 minutes — way down from the 200 minutes mentioned earlier.\" Daniel 的评价是 \"this kind of stuff kills the deals.\" 会上定的解法是做一个不公开的 $1.99 / 1,200 credits 套餐（公开基准价仍为 $3.99），等客户确认后在后台手动开通。也就是说截至 8/13 凌晨这一单尚未成交。当天 10:56 UTC Glenn 在内部 Teams 宣布 \"EstesGrp.com has become our first paying customer for AI Ticket Intake\" —— 按本看板口径 Teams 不作为证据，且 ClickUp 与 Outlook 里都查不到对应的订阅记录或账单，Bill 本人也没有再来信，因此本次不升到 100%，改为在 open_questions 里请人补一份可采信的凭证。阶梯的 100% 是「已付费」，需要的是账单/订阅记录或客户书面确认，不是内部庆祝。",
   "next_action": "【8/19 更新：8/12 之后第一次有客户回信，但内容读不出来，档位维持 90%】8/18 09:55 UTC Glenn 给 Bill McCord 发信「AI Ticket Intake Transcript Note - Write Failed」，说他们账号上写通话记录到工单 note 时报权限错误，并给了 ConnectWise 侧改 API Member 权限（Service Desk → Service Ticket Comments / Internal Analysis 的 Add 设为 All）的五步操作。Bill 当天 20:53 UTC 回信了，正文逐字只有两行：\"Glenn,\" 与 \"So, about that.\"，另附 8 张内嵌图片，其中两张是 202 KB 与 175 KB 的整屏截图。也就是说这封信的实质内容全在截图里，本轮无法读取图片，因此不作为改档依据（见 open_questions 新增的一条）。可以确定的只有三件事：① 这是 8/12 之后第一次有 estesgrp.com 的来信，「查不到任何对客沟通」的判断到此为止；② 8/19 再查 Outlook，订阅 / 账单 / 收入提醒里依然没有 EstesGroup，14 天试用已在 8/17 到期；③ 一家判在 90%、内部已宣布成交的客户，现在同时挂着「PSA 权限报错没解决」「试用已过期」「没有任何付费凭证」三件事。动作：今天有人去 Outlook 打开那两张截图，确认 Bill 说的是「权限我改好了」还是「这事我们得谈谈」，然后再决定升到 100% 还是往下走。\n\n【8/15 状态：凭证仍然没有，而试用后天到期】本轮把三个渠道又查了一遍：Outlook 里 8/12 之后没有任何来自 estesgrp.com 的信（Bill 最后一封仍是 8/12 16:07 那封 \"Approvals are in place\"），Chargebee 的 8/12–8/14 每日报表和「New Revenue Alert」里都没有 EstesGroup —— 8/12 那条首次开票提醒对应的是 cytek-itops，不是这家；ClickUp 侧也查不到订阅记录。也就是说自 8/13 10:56 UTC 内部 Teams 宣布「第一个付费客户」以来已过 2 天，仍然没有一份可采信的凭证，看板继续维持 90%。同时试用 8/17 到期，只剩 2 天，而套餐还等着 Bill 自己去 MarketPlace 点。这两件事撞在一起：如果订阅其实没生效、试用又断掉，客户会在「我们已经对内宣布成交」的同一周失去服务。今天必须二选一 —— 要么拿出订阅/账单凭证，要么先把试用延期。\n\n①（本次最要紧）请补一份可采信的付费凭证。8/13 10:56 UTC 你在内部 Teams 宣布 EstesGrp.com 成为 ATI 第一个付费客户 —— 如果属实，这是本项目的里程碑，但看板不能靠内部 Teams 改档。需要的是三者之一：MarketPlace 的订阅记录截图、Accounting 出的账单/发票，或 Bill 本人书面确认已订阅。拿到当天就把这家改成 100%。② 报价口径这件事要立刻收口，不只对 EstesGroup。8/13 的 L10 已经确认：$199/200 分钟的旧口径发出去过，而实际是 6 credits/分钟、$199/1,000 credits ≈ 166 分钟，客户当场被搞糊涂，Daniel 的原话是「this kind of stuff kills the deals」。所有还拿着旧口径的客户（ACTS360 手里是 $399/月约 500 分钟的旧版）都要主动更正一次，别等他们自己发现。③ 不公开的 $1.99 / 1,200 credits 套餐要落到后台并留下记录 —— 一个只存在于口头的特殊定价，下一次续费时会变成新的争议。④ 试用 8/17 到期。若订阅尚未生效，今天就延期，别让「已经宣布成交」和「试用断档」同一周发生。⑤ 7/30 提到的 \"a couple of negative points\" 至今仍然一条都没有落成工单 —— 这家马上要把现有答录服务换掉，上线前必须知道那两条是什么。⑥ 他提的「转人时打技术热线」先确认是配置能做还是要开单，能配就当场配掉。",
   "cadence_en": "One-off · approvals all cleared 8/12 · internally announced as paying on 8/13 (unverified)",
   "stage_evidence_en": "Upgraded 55% → 90% this run. On 2026-08-10 at 17:42 UTC Glenn wrote to Bill McCord, both to flag that \"your trial has 7 days remaining\" (offering an extension) and to ask, \"do you have a rough sense of when you'll be through the sign-off conversations with leadership?\" Bill replied the same day at 19:45 UTC with a single line: \"Got it past the high hurdle, now some back office sweeping up to do... very close. More to follow.\" Read against the question he was answering, that says the internal approval to switch vendors has cleared and only back-office work remains. The commercial terms were already on the record: Glenn's 4 Aug email states that ATI is now behind the paywall, that a complimentary 14-day / 3,000-credit trial is active on their account, that ATI consumes 6 AI credits per minute of call time, and that they can buy further credits to continue after the trial — Bill raised no pricing objection to any of it and instead carried on pushing for sign-off. That is the pricing/contract rung, hence 90%. The technical evidence is unchanged: self-testing was confirmed complete on 7/30 (\"We're through the testing (great timing, KT was able to test today).\"), and the internal positives and negatives still have no tickets, which is why the bug/enhancement columns are empty.\n\nAdded this run (the evidence went from inferred to explicit): on 2026-08-12 at 16:07 UTC Bill McCord replied again on the same thread; the body was read verbatim. His words: \"Approvals are in place, is there any contract work to do here?\", followed by \"I have given MSPBots permission to create a ticket (that's it, no delete, modify, etc.) and tested.\" and \"Looking into how to get AITI to call our tech hotline when handoff is needed.\" That settles the 8/10 question of what \"the high hurdle\" referred to — he says outright that approvals are in place, and asks about contract work unprompted. Glenn replied the same day at 17:06 UTC: no new contract to sign, it falls under their existing agreement; the only remaining step is choosing an AI Credit Subscription plan in the Marketplace, after which it is active (ATI bills at 6 credits per minute), and he looped in Anushree Fomra from Accounting. The rung stays at 90% (pricing/commercial) rather than 100% — the ladder's 100% is \"paying\", and no plan has been selected and no invoice exists yet.\n\nAdded this run (material, but the rung is unchanged): the internal Product-Platform L10 of 2026-08-13 02:30 UTC (Fathom 780677829; notes at meetings/internal/2026-08-13-Product-Platform-L10.md, taken from the verbatim transcript) reveals this deal nearly died on a quote-versus-model mismatch. Glenn at [46:52]: \"I sent out a follow-up asking their sentiment on the pricing, based on our initial pricing — $199/month including 200 minutes, additional usage billed at $0.50/minute. But we shifted to the credit base, same as the other apps, and I was not able to update this client. ... when I emailed him yesterday about the credit-subscription pricing, he was confused. The AI ticket intake is 6 credits per minute, so $199/1,000 credits is only around 166 minutes — way down from the 200 minutes mentioned earlier.\" Daniel's verdict: \"this kind of stuff kills the deals.\" The fix agreed on the call was an unlisted $1.99 / 1,200-credit plan (the public baseline stays $3.99) to be activated manually on the backend once the client confirms — meaning that as of the small hours of 8/13 the deal had not closed. At 10:56 UTC that day Glenn announced on the internal Teams channel that \"EstesGrp.com has become our first paying customer for AI Ticket Intake\". Teams is not admissible evidence on this board, no subscription or invoice record turns up in ClickUp or Outlook, and Bill has not written again — so they are not moved to 100% here; instead the open questions ask a human to produce an admissible record. The ladder's 100% is \"paying\", which needs an invoice, a subscription record or the client's own confirmation, not an internal celebration.",
   "next_action_en": "[Update 8/19: the first client reply since 8/12, but its content cannot be read, so the rung holds at 90%] At 09:55 UTC on 8/18 Glenn wrote to Bill McCord under \"AI Ticket Intake Transcript Note - Write Failed\", reporting a permission error when writing call transcripts into their ticket notes and giving the five ConnectWise steps to fix it (Service Desk → Service Ticket Comments / Internal Analysis, Add level set to All). Bill replied the same day at 20:53 UTC, and the body is, verbatim and in full, two lines — \"Glenn,\" and \"So, about that.\" — accompanied by eight inline images, two of which are full screenshots of 202 KB and 175 KB. The substance of that reply lives entirely in the screenshots, which this run cannot read, so it is not used to move the rung (see the new entry in open_questions). Three things are certain: (1) it is the first message from estesgrp.com since 8/12, which ends the \"no client contact on record\" reading; (2) a fresh Outlook check on 8/19 still turns up no subscription, invoice or revenue alert for EstesGroup, and the 14-day trial expired on 8/17; (3) a client scored at 90%, already announced internally as the first paying customer, is now simultaneously carrying an unresolved PSA permission error, a lapsed trial and no payment record whatsoever. Action: someone opens those two screenshots in Outlook today and establishes whether Bill is saying \"permissions are fixed\" or \"we need to talk about this\", and only then decide between 100% and a step down.\n\n[Status on 8/15: still no record, and the trial expires the day after tomorrow] Three channels were checked again this run: Outlook has nothing from estesgrp.com since 8/12 (Bill's last message is still the 16:07 \"Approvals are in place\" one), the Chargebee daily reports for 12–14 Aug and the \"New Revenue Alert\" carry no EstesGroup — the first-invoice alert of 8/12 was for cytek-itops, not them — and no subscription record turns up in ClickUp. Two days after the internal Teams announcement of 8/13 10:56 UTC that they are ATI's first paying customer, there is still nothing admissible, so the board holds at 90%. Meanwhile the trial expires on 8/17, two days away, with the plan still waiting for Bill to select it in the Marketplace. Those two facts collide: if the subscription never activated and the trial lapses, the client loses service in the same week we announced the win internally. Today it has to be one or the other — produce the subscription/invoice record, or extend the trial.\n\n1. (most urgent this run) Produce an admissible record of payment. At 10:56 UTC on 8/13 you announced on the internal Teams channel that EstesGrp.com is ATI's first paying customer — if that is right it is the project's milestone, but this board cannot move a rung on an internal Teams post. One of three things is needed: the Marketplace subscription record, an invoice from Accounting, or Bill's own written confirmation that he has subscribed. The day it lands, this client goes to 100%. 2. Close the quote-versus-model gap immediately, and not only for EstesGroup. The 8/13 L10 confirmed the old $199-for-200-minutes quote went out while the real model is 6 credits per minute — $199 for 1,000 credits is about 166 minutes — and the client was left confused; Daniel's words were \"this kind of stuff kills the deals\". Every client still holding an old quote (ACTS360 has the $399-for-~500-minutes version) should be corrected proactively rather than discovering it themselves. 3. The unlisted $1.99 / 1,200-credit plan needs to be created on the backend and written down — a special price that exists only verbally becomes an argument at renewal. 4. The trial expires on 8/17. If the subscription is not yet live, extend it today; do not let \"we announced the win\" and \"the trial lapsed\" happen in the same week. 5. The \"couple of negative points\" from 7/30 still have no ticket between them — they are about to replace their answering service with us and we need to know what those are before go-live. 6. On his tech-hotline handoff question, first establish whether it is configuration or a ticket; if it is configuration, just do it.",
   "ticket_match": [
    "estes"
   ]
  },
  {
   "track": "alpha",
   "name": "Titanium.Red",
   "contact": "Natalie Zieger · Yamin",
   "cadence": "周五 18:00 · 7/31 客户拒绝",
   "status": "已流失",
   "events": [
    {
     "date": "2026-07-08",
     "time": "—",
     "state": "held",
     "title": "AI Ticket Intake Product Demo w/ Titanium.red",
     "fathom": "https://fathom.video/calls/738235124"
    },
    {
     "date": "2026-07-17",
     "time": "18:00",
     "state": "held",
     "title": "AI Ticket Intake Weekly Touchbase - Titanium.Red",
     "fathom": "https://fathom.video/calls/748563717"
    },
    {
     "date": "2026-07-24",
     "time": "18:00",
     "state": "held",
     "title": "AI Ticket Intake Weekly Touchbase - Titanium.Red",
     "fathom": "https://fathom.video/calls/758992002"
    },
    {
     "date": "2026-07-31",
     "time": "18:00",
     "state": "cancelled",
     "churn": true,
     "title": "Declined: AI Ticket Intake Weekly Touchbase - Titanium.Red",
     "reason": "客户终止:Natalie Zieger 拒绝周会邀请 —— \"we do not have a clear business need to justify the expense. We will revisit as a team next quarter.\"",
     "requested_by": "客户",
     "email": "emails/titanium.red/2026-07-31_Re- AI Ticket Intake Weekly Touchbase - Titanium.Red (Declined - revisit next quarter).md",
     "reason_en": "Client terminated: Natalie Zieger declined the recurring invite — \"we do not have a clear business need to justify the expense. We will revisit as a team next quarter.\""
    }
   ],
   "pipeline_key": "Titanium (Titanium.Red)",
   "ticket_keys": [
    "Titanium.Red"
   ],
   "email_domain": "titanium.red",
   "lost_reason": "2026-07-31 拒绝试用。预算/业务必要性决策，不是产品质量拒绝（未提新 bug）。软关单：Glenn 已提供 120 天退款保障，Q4-2026 重新接触。",
   "next_action": "【8/27 更新：重连由头已经用出去了，现在是等回信】2026-08-26 18:28 UTC Glenn 给 Natalie Zieger 发了重连信（emails/titanium.red/2026-08-26_MSPbots - AI Ticket Intake - Update- Pre-Transfer Ticket Creation Now Live.md，正文逐字读过），正是本看板上一轮写的那个由头 —— 转接前建单已上线：\"The enhancement we discussed — creating the PSA ticket at the moment the AI begins transferring a call to an engineer, rather than after the call ends — is now available.\"，并明确回到她 7/31 的拒绝理由上：\"I know your team decided to hold off last quarter since there wasn't a clear business need at the time... I wanted to loop back and see if you'd be open to testing it out again, even informally.\" 信里还附了另外五项新功能。截至本轮（8/27 01:10 UTC）客户方没有任何回复，档位不动，仍 0%（Closed Lost）—— 一封我方去信不构成复活。下一步：给这封信定一个跟进日期，Natalie 若在 9 月初仍无回应，就按 Q4 再谈处理。注意 AST-20803（86e2g5kt1，Titanium 当初提的那张单）自身仍是 new，是靠挂在 AST-18104 下面才算「已交付」—— 对客说「已上线」时用的是载体单的能力，不等于 Titanium 那张单被单独验收过。",
   "stage": "lost",
   "stage_evidence": "7/31 拒绝试用。预算/业务必要性决策，非产品质量问题（未提新 bug）。曾深度参与：10 条 bug/质量反馈、2 条定价反对（$199/mo 读作「definitely high」）。",
   "rejection": {
    "channel": "email",
    "date": "2026-07-31",
    "who": "Natalie Zieger",
    "quote": "Thank you for the opportunity to trial the AI ticket intake. Unfortunately at this time we do not have a clear business need to justify the expense. We will revisit as a team next quarter.",
    "ref": "emails/titanium.red/2026-07-31_Re- AI Ticket Intake Weekly Touchbase - Titanium.Red (Declined - revisit next quarter).md",
    "who_en": "Natalie Zieger",
    "ref_en": "emails/titanium.red/2026-07-31_Re- AI Ticket Intake Weekly Touchbase - Titanium.Red (Declined - revisit next quarter).md"
   },
   "cadence_en": "Fri 18:00 · client declined 7/31",
   "stage_evidence_en": "Was deeply engaged — 10 bug/quality items and 2 pricing objections ($199/mo read as \"definitely high\") — then declined on 7/31 over business need and budget, not product quality.",
   "lost_reason_en": "Declined the trial on 7/31. A business-need/budget decision, not a product-quality rejection (no new bugs raised). Soft close: Glenn offered the 120-day money-back guarantee.",
   "next_action_en": "[8/27 update: the reconnection hook has been used — now it is a matter of waiting for a reply] At 18:28 UTC on 2026-08-26 Glenn emailed Natalie Zieger (emails/titanium.red/2026-08-26_MSPbots - AI Ticket Intake - Update- Pre-Transfer Ticket Creation Now Live.md, body read verbatim) with exactly the hook this board named last run — pre-transfer ticket creation has shipped: \"The enhancement we discussed — creating the PSA ticket at the moment the AI begins transferring a call to an engineer, rather than after the call ends — is now available.\" — and went straight back to her 7/31 reason for declining: \"I know your team decided to hold off last quarter since there wasn't a clear business need at the time... I wanted to loop back and see if you'd be open to testing it out again, even informally.\" Five further feature updates were listed in the same mail. As of this run (01:10 UTC on 8/27) there is no reply from the client, so the rung is unchanged at 0% (Closed Lost) — an outbound email of ours is not a revival. Next: put a follow-up date on that email, and if Natalie is still silent in early September, treat it as the Q4 conversation. Note that AST-20803 (86e2g5kt1, the ticket Titanium originally raised) is itself still new and only counts as delivered by riding on AST-18104 — telling the client it \"shipped\" describes the vehicle's capability, not a separate acceptance of Titanium's own ticket.",
   "ticket_match": [
    "titanium"
   ]
  },
  {
   "track": "alpha",
   "name": "Layer 7 Systems",
   "contact": "Jacob Balson",
   "cadence": "周五 15:00 · 名义在跑，实际 7/17 之后一场没开 · 8/14–9/4 连续四格「应排未排」",
   "status": "活跃",
   "events": [
    {
     "date": "2026-07-09",
     "time": "—",
     "state": "held",
     "title": "AI Ticket Intake Product Demo between Glenn and Layer7Systems",
     "fathom": "https://fathom.video/calls/739892977",
     "note": "首次 demo:建单 + 转接两个 live test 都成功;caller-ID 未匹配到已有 Autotask 联系人",
     "note_en": "First demo: two live tests, ticket creation and transfer both succeeded; caller-ID did not match an existing Autotask contact"
    },
    {
     "date": "2026-07-17",
     "time": "15:00",
     "state": "held",
     "title": "AI Ticket Intake | Layer7Systems Weekly Touchbase",
     "fathom": "https://fathom.video/calls/748563714"
    },
    {
     "date": "2026-07-24",
     "time": "15:00",
     "state": "cancelled",
     "title": "Canceled: AI Ticket Intake | Layer7Systems Weekly Touchbase",
     "reason": "Jacob 要求取消本周",
     "requested_by": "客户",
     "email": "emails/layer7systems.com/2026-07-24_Canceled- AI Ticket Intake Layer7Systems Weekly Touchbase.md",
     "reason_en": "Cancelled this week at Jacob's request"
    },
    {
     "date": "2026-07-31",
     "time": "15:00",
     "state": "norecord",
     "title": "AI Ticket Intake | Layer7Systems Weekly Touchbase"
    },
    {
     "date": "2026-08-07",
     "time": "15:00",
     "state": "norecord",
     "title": "AI Ticket Intake | Layer7Systems Weekly Touchbase",
     "note": "排了期但既无录像也无纪要。同日上午 Glenn 在内部 Teams 通报 Layer7Systems 不再推进 ATI —— 该说法只有内部转述，没有客户侧邮件或纪要佐证，故本场只记为「无记录」，档位不动。",
     "note_en": "Scheduled, but there is neither a recording nor notes. On the morning of the same day Glenn reported internally on Teams that Layer7Systems would not move forward with ATI — that account is second-hand with no client-side email or transcript behind it, so this slot is logged as \"no record\" only and the rung is left alone."
    },
    {
     "date": "2026-08-14",
     "time": "15:00",
     "state": "noinvite",
     "title": "AI Ticket Intake | Layer7Systems Weekly Touchbase",
     "note": "周五 15:00 的周会应该有这一场，但 Glenn 日历上 8/7 之后再无任何 Layer7 场次——邀请没发",
     "note_en": "The Friday 15:00 weekly calls for this slot, but Glenn's calendar has no Layer7 occurrence after 8/7 — the invite was never sent"
    },
    {
     "date": "2026-08-21",
     "time": "15:00",
     "state": "noinvite",
     "title": "AI Ticket Intake | Layer7Systems Weekly Touchbase",
     "note": "周五 15:00 的周会应该有这一场，但 Glenn 日历上 8/7 之后再无任何 Layer7 场次——邀请没发",
     "note_en": "The Friday 15:00 weekly calls for this slot, but Glenn's calendar has no Layer7 occurrence after 8/7 — the invite was never sent"
    },
    {
     "date": "2026-08-28",
     "time": "15:00",
     "state": "noinvite",
     "title": "AI Ticket Intake | Layer7Systems Weekly Touchbase",
     "note": "周五 15:00 的周会应该有这一场，但 Glenn 日历上 8/7 之后再无任何 Layer7 场次——邀请没发（8/22 复查：以 Intake 全文查 8/20–9/7，14 场全部读过，无一场是 Layer7）",
     "note_en": "The Friday 15:00 weekly calls for this slot, but Glenn's calendar has no Layer7 occurrence after 8/7 — the invite was never sent (re-checked 8/22: a full-text search for Intake over 8/20–9/7 returned 14 events, all read, none of them Layer7)"
    },
    {
     "date": "2026-09-04",
     "time": "15:00",
     "state": "noinvite",
     "title": "AI Ticket Intake | Layer7Systems Weekly Touchbase",
     "note": "周五 15:00 的周会应该有这一场，但 Glenn 日历上 8/7 之后再无任何 Layer7 场次——邀请没发（8/22 复查：以 Intake 全文查 8/20–9/7，14 场全部读过，无一场是 Layer7）",
     "note_en": "The Friday 15:00 weekly calls for this slot, but Glenn's calendar has no Layer7 occurrence after 8/7 — the invite was never sent (re-checked 8/22: a full-text search for Intake over 8/20–9/7 returned 14 events, all read, none of them Layer7)"
    }
   ],
   "pipeline_key": "Layer 7 Systems",
   "ticket_keys": [
    "Layer 7 Systems"
   ],
   "email_domain": "layer7systems.com",
   "stage": "selftest",
   "stage_evidence": "7/9 demo 现场两次 live test：建单和转接都成功，属 MSP 自测。3 条 bug/质量反馈（caller-ID 未匹配到已有 Autotask 联系人）。未进入定价讨论。",
   "cadence_en": "Fri 15:00 · nominally running, but nothing held since 7/17 · four consecutive missing-invite slots, 8/14–9/4",
   "stage_evidence_en": "Two live tests during the 7/9 demo — ticket creation and transfer both succeeded — which counts as MSP self-testing. 3 bug/quality items (caller-ID not matching an existing Autotask contact). No pricing discussion yet.",
   "ticket_match": [
    "layer 7 ",
    "layer7"
   ],
   "next_action": "【待核实的流失】2026-08-07 10:24（内部 Teams，ATI 群）Glenn 写道 \"Hi Grace Guo Daniel Wang - To update, Layer7Systems will not move forward with AI Ticket Intake.\"，并在 11:48 附上一份 layer7-status-report.html 复盘。本看板没有据此改档：按口径 Teams 不能作为证据（仓库里只有内部频道导出），而这是内部转述而非客户原话 —— emails/layer7systems.com 最后一封是 8/3 的 paywall 通知，Jacob 没有回信；8/7 的周会没有录像；Fathom 上 7/28 以来查不到任何 Layer7 场次。动作：请 Glenn 补一份客户侧的书面依据（Jacob 的邮件或通话），确认后再一次性把档位改到 0% 并填 rejection。在那之前，8/14、8/21 两场「应排未排」先不要补发邀请 —— 如果客户真的走了，补邀请只会更尴尬。（8/13 第 6 次复查，四个渠道依旧全空：Glenn 日历到 8/26 为止没有任何 Layer7 场次，Outlook 里 layer7systems.com 自 7/20 起零来信，Fathom 自 7/27 起搜不到任何 Layer7 场次，仓库里 emails/layer7systems.com 最后一封仍是 8/3 的 paywall 通知 —— 客户侧沉默进入第 10 天。连续 6 天全空本身就是结论：这件事不该再靠等，Glenn 必须给个说法。）（8/14 第 7 次复查，四个渠道依旧全空：Glenn 日历到 8/28 为止没有任何 Layer7 场次，Outlook 里 layer7systems.com 自 7/20 起零来信，Fathom 自 7/27 起搜不到任何 Layer7 场次，emails/layer7systems.com 最后一封仍是 8/3 的 paywall 通知 —— 客户侧沉默第 11 天，连续 7 天全空。这条已经不适合再作为「每日复查项」滚下去：本轮起停止逐日复查，改为等 Glenn 给出客户侧依据；如果本周内仍无依据，建议下一轮把它标为「不再跟进」而不是继续挂在 55%。）（8/15：按上一轮的决定不再逐日复查，但本轮顺手查了两个成本最低的渠道，结论不变 —— Outlook 里 layer7systems.com 自 7/20 起零来信，Glenn 日历到 8/23 为止没有任何 Layer7 场次。客户侧沉默第 12 天。Glenn 仍未给出客户侧依据，建议本周内不给就直接标为「不再跟进」。）",
   "next_action_en": "[UNVERIFIED CHURN] On 2026-08-07 at 10:24 Glenn wrote on the internal ATI Teams channel: \"Hi Grace Guo Daniel Wang - To update, Layer7Systems will not move forward with AI Ticket Intake.\", followed at 11:48 by a layer7-status-report.html post-mortem. The rung has NOT been changed on that basis: Teams is not admissible evidence for this board (the repo holds only the internal channel export) and this is a second-hand account rather than the client's own words. The last item in emails/layer7systems.com is the 8/3 paywall notice, which Jacob never answered; the 8/7 weekly has no recording; and Fathom shows no Layer7 session at all since 7/28. Action: ask Glenn for the client-side written source (Jacob's email or a call), then move them to 0% with a filled-in rejection block in one go. Until that lands, do not send the 8/14 and 8/21 invites flagged as missing — chasing a client who has already walked would only make it worse. (Sixth re-check on 8/13: all four channels are still empty — no Layer7 occurrence anywhere on Glenn's calendar through 8/26, nothing at all from layer7systems.com in Outlook since 7/20, no Layer7 session in Fathom since 7/27, and the last item in emails/layer7systems.com is still the 8/3 paywall notice. That is the tenth day of client-side silence. Six consecutive empty days is itself the finding: this should no longer be waited out, and Glenn has to give an answer.) (Seventh re-check on 8/14: all four channels are still empty — no Layer7 occurrence on Glenn's calendar through 8/28, nothing from layer7systems.com in Outlook since 7/20, no Layer7 session in Fathom since 7/27, and the last item in emails/layer7systems.com is still the 8/3 paywall notice. Eleventh day of client-side silence, seven consecutive empty days. This should stop being a daily re-check item: from this run the daily sweep is dropped and the board simply waits on Glenn for the client-side basis. If nothing arrives this week, the recommendation for the next run is to mark them not-pursuing rather than leave them idling at 55%.) (8/15: per last run's decision the daily sweep has stopped, but the two cheapest channels were checked anyway and nothing changed — Outlook has had nothing from layer7systems.com since 7/20 and Glenn's calendar carries no Layer7 occurrence through 8/23. Twelfth day of client-side silence. Glenn has still not produced a client-side basis; if none arrives this week, mark them not-pursuing.)"
  },
  {
   "track": "alpha",
   "name": "CIO Landing",
   "contact": "German Dopazo · Ignacio Colombo · Mauro Cretari",
   "cadence": "周一 20:15 · Glenn 8/7 建系列 · 8/24 我方改到 8/28 · 8/27 又因 PTO 取消 8/28 与 8/31 · 替代场次 9/3 15:15，由客户侧预约页发起，周会系列本身已断",
   "status": "活跃",
   "events": [
    {
     "date": "2026-08-10",
     "time": "20:15",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | CIOLanding",
     "fathom": "https://fathom.video/calls/778774326",
     "note": "首场 ATI 周会（Glenn 8/7 建的系列，20:15 UTC）。本轮只读了 Fathom 摘要、没有逐字看 transcript，所以以下按「摘要转述」对待，未用于定档：50 通试用暂停（前 10 通没达到 80–90% 的成功率目标）；当场决定关掉 bot 的 troubleshooting skills、只做纯建单；ConnectWise 工单格式重做。会后 8/11 开出 Enhancement | CIOLanding | [Spike] Ticket lookup + update flow。",
     "note_en": "The first ATI weekly of the series Glenn created on 8/7 (20:15 UTC). Only the Fathom summary was read this run, not the transcript, so the following is treated as second-hand and was not used to assign the stage: the 50-call trial is paused (the first 10 calls missed the 80–90% success target); the bot's troubleshooting skills were disabled on the call so it does pure ticket creation; the ConnectWise ticket format is to be redesigned. The Enhancement | CIOLanding | [Spike] Ticket lookup + update flow ticket was raised on 8/11 out of this session."
    },
    {
     "date": "2026-08-17",
     "time": "20:15",
     "state": "held",
     "title": "AI Ticket Intake - Weekly Touchbase | CIOLanding",
     "fathom": "https://fathom.video/calls/786560121",
     "note": "本轮 transcript 已逐字读过（纪要 meetings/CIO Landing/2026-08-17-AI-Ticket-Intake-Weekly-Touchbase.md）。四件事：① 试用重启 —— Glenn 原话 \"I already enabled back the 14-day trial… it's another set of 14 days trial for you guys\"，8/10 暂停的试用又开了一轮 14 天。② 建单回归已修 —— Glenn 原话 \"German raised an issue about the Ticket Creature that is failing. So it's now fixed. As per review, it was due to a JSON, that string. So I tested last week and was able to create tickets as well.\"，对应工单 86e2u6nzh 已 released & live（8/14）。③ 四张 deal-breaker 单仍无 ETA —— Glenn 原话 \"I don't have yet the ATA[ETA] for some of these items here\"，上周开发被抽去别的优先级，本周才回来看需求；German 也确认自己没再动配置：\"I haven't really changed much since the last time I tested, since most of these issues that I was having are these that the development team has to take on.\"。④ 一条新的 UX 诉求 —— 关掉 skills 后每通电话开口都是 \"sorry, I'm unable to help you with this issue right now\"，German 原话 \"one of the things that we usually don't want to say to our clients is, hey, sorry, I can't do this. It's not that we can't, it's that we have to review… they are older people than me, and they may get frustrated when a machine says, okay, no, sorry, I cannot do this.\"，要求把「我做不到」这层话术去掉。另有两条早先报的 bug（通话结束后不挂断、一直在听并循环；\"one moment\" 之后回头重问问题）Glenn 说 dev 已修、待 German 复测。下一步：German 定在 8/19 再打 5 通验证建单修复并看回答是否有变化 —— 原话 \"I'll do five tests… I'll test it tomorrow, and I'll let you guys know\"。Ignacio 收尾：\"I think we have to do more testing and we'll see you by next Monday.\"",
     "note_en": "Transcript read verbatim this run (notes at meetings/CIO Landing/2026-08-17-AI-Ticket-Intake-Weekly-Touchbase.md). Four things. (1) The trial restarted — Glenn: \"I already enabled back the 14-day trial… it's another set of 14 days trial for you guys\", so the trial paused on 8/10 is running again for another fourteen days. (2) The ticket-creation regression is fixed — Glenn: \"German raised an issue about the Ticket Creature that is failing. So it's now fixed. As per review, it was due to a JSON, that string. So I tested last week and was able to create tickets as well.\" The matching ticket 86e2u6nzh went released & live on 8/14. (3) The four deal-breaker tickets still have no ETA — Glenn: \"I don't have yet the ATA[ETA] for some of these items here\"; dev was pulled onto another priority last week and only returns to the requirements this week. German confirmed he has not touched the configuration either: \"I haven't really changed much since the last time I tested, since most of these issues that I was having are these that the development team has to take on.\" (4) One new UX ask — with skills disabled every call opens with \"sorry, I'm unable to help you with this issue right now\". German: \"one of the things that we usually don't want to say to our clients is, hey, sorry, I can't do this. It's not that we can't, it's that we have to review… they are older people than me, and they may get frustrated when a machine says, okay, no, sorry, I cannot do this.\" He wants the \"I can't\" framing removed. Two previously reported bugs (the bot kept listening and would not hang up after the call; the \"one moment\" loop that went back and re-asked the questions) were reported fixed by dev, awaiting German's retest. Next step: German set 8/19 for another five test calls to confirm the ticket-creation fix and check the answers vary — \"I'll do five tests… I'll test it tomorrow, and I'll let you guys know\". Ignacio closed with \"I think we have to do more testing and we'll see you by next Monday.\""
    },
    {
     "date": "2026-08-24",
     "time": "20:15",
     "state": "cancelled",
     "title": "AI Ticket Intake - Weekly Touchbase | CIOLanding",
     "reason": "我方发起改期，客户书面同意 —— 不是无记录，是有据可查的取消。",
     "reason_en": "Rescheduled at our request and agreed in writing by the client — not a silent gap, a traceable cancellation.",
     "note": "本轮改判（原为「未来排期」）。8/25 复查 Glenn 日历（Intake 全文查 8/20–9/7）时这一格已经从日历上消失，而 emails/ciolanding.com 下没有任何 Canceled 邀请 —— 按 runbook 这本该记成 norecord + silent，但 Outlook 原件把它讲清楚了，所以判为「已取消」：2026-08-24 18:17 UTC Glenn 在 14-day trial 线程上写 \"The team is actively working on the enhancement items, targeting completion by the end of this week. Given that, would it be possible to reschedule our call to Friday, if you're both available?\"，并直说 \"I don't have any substantial updates to share yet since the team is still finalizing the work, so I wanted to check in on the reschedule before we meet.\"；18:27 UTC Ignacio Colombo 回 \"Sure Glenn, we can reschedule for next Friday, same time if that works for you.\"；18:31 UTC Glenn 发出新邀请（emails/ciolanding.com/2026-08-24_AI Ticket Intake - Weekly Touchbase - CIOLanding.md），日历上随即出现 8/28 20:15 这一场。也就是说这一格是我方因为「没有实质进展可讲」主动推掉的，不是客户流失，也不是 Glenn 漏发邀请。",
     "note_en": "Reclassified this run (it was \"scheduled\"). When Glenn's calendar was re-checked on 8/25 (full-text search for Intake over 8/20–9/7) this slot was gone, and there is no Canceled invite under emails/ciolanding.com — under the runbook that would normally be recorded as norecord + silent, but the Outlook originals settle it, so it is recorded as cancelled. At 18:17 UTC on 2026-08-24 Glenn wrote on the 14-day trial thread: \"The team is actively working on the enhancement items, targeting completion by the end of this week. Given that, would it be possible to reschedule our call to Friday, if you're both available?\", adding plainly \"I don't have any substantial updates to share yet since the team is still finalizing the work, so I wanted to check in on the reschedule before we meet.\" At 18:27 UTC Ignacio Colombo replied \"Sure Glenn, we can reschedule for next Friday, same time if that works for you.\" At 18:31 UTC Glenn sent the new invite (emails/ciolanding.com/2026-08-24_AI Ticket Intake - Weekly Touchbase - CIOLanding.md) and the 8/28 20:15 slot duly appeared on the calendar. So this cell is a session we pushed because we had nothing substantial to report — not a lost client, and not a missed invite."
    },
    {
     "date": "2026-08-28",
     "time": "20:15",
     "state": "cancelled",
     "title": "AI Ticket Intake - Weekly Touchbase | CIOLanding",
     "note": "本轮改判：上一轮记为「未来排期」，现判为「已取消」。2026-08-27 14:05:57 与 14:06:36 UTC Glenn 连发两封同文的取消邀请（发件人 glenn.bugtong@mspbots.ai，收件人 Ignacio Colombo 与 gdopazo@ciolanding.com，抄送 Mauro Cretari、Daniel Wang、product@mspbots.ai、Grace Guo；两封原件都已逐字读过）。注意：两封信都没有写明取消的是哪一场，把它们分别记到 8/28 与 8/31，依据是这两场现在都已从 Glenn 日历上消失 —— 以 attendee=ciolanding.com 在 8/20–9/20 区间检索 Glenn 日历，只剩 9/3 那一场。这一步是推断，不是邮件明说的，已写进 open_questions 待人复核。",
     "note_en": "Reclassified this run: recorded as scheduled last run, now cancelled. At 14:05:57 and 14:06:36 UTC on 2026-08-27 Glenn sent two identically worded cancellation invites (from glenn.bugtong@mspbots.ai to Ignacio Colombo and gdopazo@ciolanding.com, cc Mauro Cretari, Daniel Wang, product@mspbots.ai and Grace Guo; both originals were read verbatim). Note that neither message names the occurrence it cancels. Assigning one to 8/28 and one to 8/31 rests on both now being gone from Glenn's calendar — a search of it for attendee=ciolanding.com over 8/20–9/20 returns only the 9/3 session. That step is an inference rather than something the emails state, and it is recorded in open_questions for a human to check.",
     "reason": "我方 PTO 取消。取消邀请邮件正文原话：“Apologies for having to cancel this call due to PTO reasons. Meeting has been rescheduled for next week, September 3, from 10:15 AM to 10:45 AM.”",
     "reason_en": "Cancelled on our side for PTO. The cancellation invite reads, verbatim: \"Apologies for having to cancel this call due to PTO reasons. Meeting has been rescheduled for next week, September 3, from 10:15 AM to 10:45 AM.\""
    },
    {
     "date": "2026-08-31",
     "time": "20:15",
     "state": "cancelled",
     "title": "AI Ticket Intake - Weekly Touchbase | CIOLanding",
     "reason": "我方 PTO 取消。取消邀请邮件正文原话：“Apologies for having to cancel this call due to PTO reasons. Meeting has been rescheduled for next week, September 3, from 10:15 AM to 10:45 AM.”",
     "reason_en": "Cancelled on our side for PTO. The cancellation invite reads, verbatim: \"Apologies for having to cancel this call due to PTO reasons. Meeting has been rescheduled for next week, September 3, from 10:15 AM to 10:45 AM.\"",
     "note": "本轮改判，与 8/28 同一批取消 —— 见 8/28 那格的说明：两封同文取消信没有指明场次，判定依据是这两场都已不在 Glenn 日历上。两场都取消意味着周一 20:15 这条 recurring series 目前没有下一场。",
     "note_en": "Reclassified this run, cancelled in the same pair as 8/28 — see the note on the 8/28 cell: the two identically worded cancellations name no occurrence, and the assignment rests on both sessions being absent from Glenn's calendar. With both gone, the Monday-20:15 recurring series currently has no next occurrence."
    },
    {
     "date": "2026-09-03",
     "time": "15:15",
     "state": "upcoming",
     "title": "Teams Meeting (30 min.) with Ignacio Colombo, Mauro Cretari, and German Dopazo (CIO Landing)",
     "note": "本次新增。这是 8/27 取消 8/28、8/31 后的替代场次，日历原件已读：start 2026-09-03 15:15 UTC、end 15:45 UTC、isCancelled=false，时间与取消信里的 “September 3, from 10:15 AM to 10:45 AM”（美中时间 = 15:15 UTC）对得上。口径要注意一点：organizer 是 support@ciolanding.com，不是 Glenn —— 这一场是从客户侧的预约页发起的，Glenn 只是受邀人，跟 8/7 起 Glenn 自建的周一 20:15 recurring series 不是同一条线。也就是说周会系列本身现在断了，9/3 是一次性预约。档位不动，仍 55%。",
     "note_en": "New this run. It is the replacement for the 8/28 and 8/31 sessions cancelled on 8/27; the calendar entry itself was read: start 2026-09-03 15:15 UTC, end 15:45 UTC, isCancelled=false, which matches the \"September 3, from 10:15 AM to 10:45 AM\" in the cancellation note (US Central = 15:15 UTC). One thing to be careful about in the framing: the organizer is support@ciolanding.com, not Glenn — this session was booked from the client's own scheduling page with Glenn merely an invitee, so it is not part of the Monday-20:15 recurring series Glenn created on 8/7. The weekly series itself is therefore broken; 9/3 is a one-off booking. The rung is unchanged at 55%."
    }
   ],
   "pipeline_key": "CIO Landing",
   "ticket_keys": [
    "CIO Landing"
   ],
   "email_domain": "ciolanding.com",
   "stage": "selftest",
   "stage_evidence": "2026-08-19 本轮首次收进看板（此前 12 天一直只作为 open_questions 里的范围问题存在，见该条的收尾说明）。定档 55% 的依据只用逐字读过的原件，不用二手摘要：① 客户自己打测试电话并给出结构化反馈 —— 8/7 German 报 10 通只成功 1 通（emails/ciolanding.com/2026-08-07_Re- AI Ticket Intake Update – 14-Day Trial (German 10-call feedback).md）；8/13 21:10 UTC 又报 4 条，第一条是回归，原话 \"Before our Monday [call] the bot was able to create tickets; after it, it is unable to anymore\"，附截图与最近 5 通录音（emails/ciolanding.com/2026-08-14_Re- AI Ticket Intake Update - 14-Day Trial (post-Monday call regressions).md，正文已读）。② 因此累计开出 25 张客户单（本页已列），我方 8/14 修掉建单回归、8/18 上线 [Spike] 工单查询与更新流。③ 客户明确想上线但尚未上线 —— 8/7 Ignacio 原话 \"are genuinely interested in AI Ticket Intake and would like to explore the possibility of implementing it within our organization\"；8/17 会上仍在「试用 + 复测」阶段，没有任何把真实来电转给 AI 的证据（pipeline.json 记录他们仍在付 PATLive $807/月并做 A/B），所以不到 livecalls(75%)。④ 也没有定价或合同对话的证据，所以不到 pricing(90%)。本档需要人复核：这是新建条目的首次定档。\n\n本轮（2026-08-21）新增自测证据，档位不动，仍为 55%：8/17 会上定的「8/19 再打 5 通」真的做了。2026-08-20 18:59 UTC German Dopazo 回信报结果（Outlook 原件逐字读过），五通全部失败在同一点上 —— 原话 \"I was unable to gather a ticket number unless I ended the call\"，逐条是 TEST 1/2「Unable to provide the ticket number of the ticket created over the call, got stuck in a loop」、TEST 3「Repeated questions for no reason, Unable to provide status on the ticket」、TEST 4「Unable to leave notes on an already existing ticket」、TEST 5「Was able to add in the notes!! but added them in the discussion tab instead of internally, got stuck and looped」。这仍然是 55%（客户自己打测试电话并提 bug）的典型形态：客户在持续测、在提单，但没有把真实来电转过来，也没有任何定价/合同对话，所以既不升到 75% 也不降档。\n\n本轮（2026-08-25）复核：档位不动，仍为 55%。8/24 没有新的自测证据 —— 那天客户方唯一一封信是 Ignacio 同意改期，零产品内容；German 自 8/20 报完五通复测后没有再打。因此既没有「真实来电转接」的证据（不到 75%），也没有任何定价/合同对话（不到 90%），更没有任何拒绝表示（不掉到 0%）。\n\n本轮（2026-08-29）新增自测证据，档位不动，仍为 55%。2026-08-28 20:41 UTC German Dopazo （gdopazo@ciolanding.com）回了 Glenn 8/26 那封「四项 enhancement 已上线」的信，Outlook 原件逐字读过。他在新版本上又打了 5 通：\"we've done 5 more extra tests and sent you the recordings to your email directly, I'd like these calls to be reviewed as per my notes below, some of the actions the bot took were pretty out of the norm\"。逐条原话：TEST 1 \"Was able to understand the issue VERY well, did re-ask the question a few times though, ABLE TO PROVIDE THE TICKET N°! (Did everything just as we asked it to!)\"；TEST 2 \"Only took the name, hang up for whatever reason and did not complete the call as instructed\"；TEST 3 \"Midway through getting the details, an application occurred and hung up the call\"；TEST 4 \"Really weird moans at the start, interrupted too many times, unable to find open ticket\"；TEST 5 \"Stuck on a loop, unable to cancel adding a note, looked up a ticket it wanted instead of listening to me requesting to put in a specific ticket number\"。他自己的结论是 \"So far the bot has only done 1 out of 5 requests correctly\"。这仍是 55% 的典型形态 —— 客户自己打测试电话并逐条提问题，没有真实来电转接、没有定价或合同对话，因此既不升到 75% / 90%，也没有任何拒绝表示、不掉到 0%。反过来，同一封信里他主动要求延长试用：\"knowing our trial is ending soon, may we please extend it so that we may have more time to keep on testing this? As you'll hear on my first recording from these tests, the bot nailed exactly what needed to be done.\" —— 这是留存信号而不是流失信号，本轮据此把风险读法从「两周没会 = 可能要凉」收窄为「两周没会，但客户仍在主动要时间」。",
   "cadence_en": "Mon 20:15 · series created by Glenn on 8/7 · we moved 8/24 to 8/28 · on 8/27 both 8/28 and 8/31 were cancelled for PTO · replaced by a 9/3 15:15 session booked from the client's own scheduling page; the weekly series itself is now broken",
   "stage_evidence_en": "Brought onto the board on 2026-08-19, having existed for the previous twelve days only as a scope question in open_questions (see the closing note there). The 55% rung rests only on sources read verbatim, never on second-hand summaries. (1) The client places its own test calls and reports structured findings — on 8/7 German reported 1 success in 10 calls (emails/ciolanding.com/2026-08-07_Re- AI Ticket Intake Update – 14-Day Trial (German 10-call feedback).md); at 21:10 UTC on 8/13 he reported four more, the first a regression: \"Before our Monday [call] the bot was able to create tickets; after it, it is unable to anymore\", with screenshots and recordings of the last five calls (emails/ciolanding.com/2026-08-14_Re- AI Ticket Intake Update - 14-Day Trial (post-Monday call regressions).md, body read). (2) That has produced 25 dedicated tickets, listed on this page; we fixed the ticket-creation regression on 8/14 and shipped the [Spike] ticket lookup and update flow on 8/18. (3) They say plainly they want to implement but have not gone live — Ignacio on 8/7: \"are genuinely interested in AI Ticket Intake and would like to explore the possibility of implementing it within our organization\"; the 8/17 call is still trial-and-retest, with no evidence of real callers being forwarded to the AI (pipeline.json records them still paying PATLive $807/month and running an A/B), so this is short of livecalls (75%). (4) There is no evidence of a pricing or contract conversation either, so it is short of pricing (90%). This rung needs a human check: it is the first assignment for a newly created entry.\n\nNew self-test evidence this run (2026-08-21); the rung is unchanged at 55%. The \"five more calls on 8/19\" agreed on the 8/17 call actually happened. At 18:59 UTC on 2026-08-20 German Dopazo reported the results (the Outlook original was read verbatim) and all five failed on the same point — in his words, \"I was unable to gather a ticket number unless I ended the call\". Item by item: TEST 1 and 2, \"Unable to provide the ticket number of the ticket created over the call, got stuck in a loop\"; TEST 3, \"Repeated questions for no reason, Unable to provide status on the ticket\"; TEST 4, \"Unable to leave notes on an already existing ticket\"; TEST 5, \"Was able to add in the notes!! but added them in the discussion tab instead of internally, got stuck and looped\". This is still the classic shape of 55% (the client places their own test calls and raises bugs): they keep testing and keep filing, but no real caller traffic has been forwarded and there is no pricing or contract conversation, so the rung neither rises to 75% nor drops.\n\nRe-checked this run (2026-08-25); the rung is unchanged at 55%. There was no new self-test evidence on 8/24 — the only client-side message that day was Ignacio agreeing to the reschedule, with no product content, and German has not placed further calls since reporting the five retests on 8/20. So there is still no evidence of real caller traffic (short of 75%), no pricing or contract conversation (short of 90%), and no refusal of any kind (nothing that would drop it to 0%).\n\nNew self-test evidence this run (2026-08-29); the rung is unchanged at 55%. At 20:41 UTC on 2026-08-28 German Dopazo (gdopazo@ciolanding.com) replied to Glenn's 8/26 \"all four enhancements are released\" mail; the Outlook original was read verbatim. He placed five more calls against the new build: \"we've done 5 more extra tests and sent you the recordings to your email directly, I'd like these calls to be reviewed as per my notes below, some of the actions the bot took were pretty out of the norm\". Item by item, in his words: TEST 1 \"Was able to understand the issue VERY well, did re-ask the question a few times though, ABLE TO PROVIDE THE TICKET N°! (Did everything just as we asked it to!)\"; TEST 2 \"Only took the name, hang up for whatever reason and did not complete the call as instructed\"; TEST 3 \"Midway through getting the details, an application occurred and hung up the call\"; TEST 4 \"Really weird moans at the start, interrupted too many times, unable to find open ticket\"; TEST 5 \"Stuck on a loop, unable to cancel adding a note, looked up a ticket it wanted instead of listening to me requesting to put in a specific ticket number\". His own summary: \"So far the bot has only done 1 out of 5 requests correctly\". This is still the classic shape of 55% — the client places their own test calls and files findings one by one, with no real caller traffic forwarded and no pricing or contract conversation, so it neither rises to 75% / 90% nor drops, and there is no refusal of any kind. Read the other way, the same email asks for more time: \"knowing our trial is ending soon, may we please extend it so that we may have more time to keep on testing this? As you'll hear on my first recording from these tests, the bot nailed exactly what needed to be done.\" That is a retention signal, not a churn one, and it narrows this run's risk reading from \"two weeks without a meeting, probably cooling\" to \"two weeks without a meeting, but the client is asking us for more time.\"",
   "ticket_match": [
    "ciolanding",
    "cio landing"
   ],
   "next_action": "【8/29 更新：客户在 8/28 主动要求延长试用，这件事有时限，压过其它所有条目】① 2026-08-28 20:41 UTC German Dopazo 回信（Outlook 原件逐字读过）：\"knowing our trial is ending soon, may we please extend it so that we may have more time to keep on testing this?\" —— 到本次生成时（8/29）我方仍无回复。试用期的确切到期日没写在信里，请 Glenn 先确认到期日、再当天给出延或不延的答复；下一次实际接触要等 9/3，如果试用在 9/3 之前到期，客户会在没有答复的情况下断掉。这是本客户目前唯一带硬时限的事。② 同一封信里的 5 通复测结果要有人认领：1 通全对（能口播工单号，AST-21492 的诉求看起来真的被 AST-18104 带上线了），另外 4 通分别是中途挂断（TEST 2）、\"an application occurred and hung up the call\"（TEST 3）、开场异响 + 频繁打断 + 查不到已开工单（TEST 4）、加备注时卡循环且忽略指定工单号（TEST 5）。TEST 4/5 指向的是 8/18 上线的工单查询更新流（AST-18103）本身，不是这次新上的四项 —— 请判断是回归还是既有缺陷，并决定是否要新开单。录音已发到 Glenn 邮箱，需要有人真的听。③ 9/3 15:15 那一场仍是唯一的检查点，且是客户自己从预约页约的、周一 20:15 的 recurring series 至今没有下一场，请 Glenn 决定是补建系列还是改为按次预约。④ 上一轮的对账要求不变：8/26 对客宣布的四项里，AST-21419 8/26 上线、AST-21421 与 AST-21493 8/25 上线，而 AST-21420 与 AST-21492 自身仍是 new、只是继承载体状态 —— 「四项全部 released」对客成立、对单不完全成立，9/3 要逐项讲清。⑤ AST-21421 的 transcript 交付形态是不是 deal-breaker，Glenn 8/26 自己问的，客户 8/28 那封信没有回答，仍然待答。",
   "next_action_en": "[8/29 update: on 8/28 the client asked to extend the trial — that has a deadline and outranks everything else here] (1) At 20:41 UTC on 2026-08-28 German Dopazo wrote (Outlook original read verbatim): \"knowing our trial is ending soon, may we please extend it so that we may have more time to keep on testing this?\" As of this build (8/29) we have not replied. The exact expiry date is not stated in the mail, so Glenn should establish it first and answer yes or no the same day; the next actual contact is 9/3, and if the trial lapses before then the client drops out without ever getting an answer. It is the only hard-dated item on this client right now. (2) Somebody has to own the five re-test results in that same mail: one call was fully correct (it spoke the ticket number back, so AST-21492's ask does look genuinely satisfied by AST-18104 shipping), and the other four were a mid-call hang-up (TEST 2), \"an application occurred and hung up the call\" (TEST 3), odd noises at the open plus frequent interruptions plus failing to find an open ticket (TEST 4), and a loop while adding a note that ignored the ticket number he specified (TEST 5). TEST 4 and 5 point at the ticket lookup-and-update flow shipped on 8/18 (AST-18103) rather than at any of the four just released — someone needs to decide whether that is a regression or a pre-existing defect, and whether new tickets are warranted. The recordings went to Glenn's mailbox and somebody actually has to listen to them. (3) The 9/3 15:15 session is still the only checkpoint, it was booked from the client's own scheduling page, and the Monday-20:15 recurring series still has no next occurrence — Glenn should decide whether to rebuild the series or move to booking session by session. (4) Last run's reconciliation still stands: of the four announced to the client on 8/26, AST-21419 shipped 8/26 and AST-21421 and AST-21493 shipped 8/25, while AST-21420 and AST-21492 are still new in their own right and merely inherit a vehicle's status — \"all four released\" holds as a client-facing statement but not ticket by ticket, and 9/3 should say so item by item. (5) Whether AST-21421's transcript delivery shape is a deal-breaker is a question Glenn asked himself on 8/26; the 8/28 mail did not answer it and it is still open."
  },
  {
   "track": "prospect",
   "name": "Certified CIO",
   "contact": "Eric Lamdin · Mike Boteler — CSM: Crispin",
   "cadence": "月度例会 · 8/5 主动要 demo · 8/19 首次触达（第 14 天）",
   "status": "热",
   "events": [
    {
     "date": "2026-08-05",
     "time": "—",
     "state": "held",
     "title": "Certified CIO — Monthly Meeting (new ATI opportunity)",
     "fathom": "https://fathom.video/calls/771642309",
     "transcript": "meetings/Certified CIO/2026-08-05-Monthly-Meeting-ATI-Demo-Request.md",
     "note": "已是 Professional 订阅客户但未试用 ATI。Eric 主动问 \"Can you demo it for us?\" 痛点:下班后靠轮值工程师,漏接电话进语音信箱要人工听完再回拨。要求覆盖下班后 + 白天溢出话务,并能转接 on-call。拒绝付费 app(预算紧)但接受免费试用。下一步:Crispin 发 Aaron 预约链接,demo 当场激活 14 天 / 3,000 credits。",
     "note_en": "Already a Professional-subscription customer but not trialling ATI. Eric asked unprompted, \"Can you demo it for us?\" Pain point: after hours relies on a rotating on-call engineer, and missed calls drop to voicemail that someone must listen to and call back. Wants coverage for after-hours plus daytime overflow, with handoff to the on-call tech. Declined the paid apps (budget) but is open to the free trial. Next: Crispin sends Aaron's booking link; the demo activates the 14-day / 3,000-credit trial."
    }
   ],
   "pipeline_key": "Certified CIO",
   "ticket_keys": [],
   "email_domain": "certifiedcio.com",
   "stage": "interest",
   "stage_evidence": "8/5 月度例会上 Eric Lamdin 主动问 \"Can you demo it for us?\"，并问了成本与试用时长。demo 尚未排期，intake app 未配置。",
   "cadence_en": "Monthly · asked for a demo 8/5 · first outreach 8/19 (day 14)",
   "stage_evidence_en": "On the 8/5 monthly, Eric Lamdin asked outright \"Can you demo it for us?\" and asked about cost and trial length. The demo is not scheduled and the intake app is not configured.",
   "ticket_match": [
    "certified cio"
   ],
   "next_action": "【8/20 更新：连续 10 轮空白之后，8/19 终于有了动作 —— 但仍然没有会】8/19 这一天 Certified CIO 收到两封信，Grace 都在 Cc，原件已读：① 11:01 UTC Glenn 给 elamdin@certifiedcio.com：\"In one of your calls with our CSM You asked us for a dedicated demo of AI Ticket Intake covering both after-hours and daytime overflow calls. I wanted to follow up and see if now's a good time to move forward\"，附 HubSpot 预约链接，并说 \"feel free to send me your preferred date and time this week or next week\"。② 20:51 UTC Aaron Ver 发出 \"Let's get you set up with AI Intake — quick 2-week trial\"，正文承诺 \"full access to AI Intake for a 2-week testing window at no cost\"，并要 20–30 分钟做 demo 加环境配置。这解掉了「零触达」这个问题，但没有解掉商机本身：截至 8/20 复查，Glenn 日历上到 9/6 为止仍然没有任何 Certified CIO 场次，Eric 也还没有回信。档位维持 15%（未配置、未 demo）。动作：今天不要再发第三封信。Crispin 或 Glenn 直接给 Eric 打电话或在下一次 CSM 例会上当场定时间 —— 8/5 到今天已经 15 天，两封自助预约链接换来的仍然是零回复。若本周内仍无回音，请明确决定是继续跟进还是标为不再跟进，别让它继续挂在 15% 档。",
   "next_action_en": "[8/20 update: after ten consecutive empty checks, something finally happened on 8/19 — but there is still no meeting] Certified CIO received two emails on 8/19, both with Grace on Cc; both originals were read this run: (1) 11:01 UTC, Glenn to elamdin@certifiedcio.com: \"In one of your calls with our CSM You asked us for a dedicated demo of AI Ticket Intake covering both after-hours and daytime overflow calls. I wanted to follow up and see if now's a good time to move forward\", with his HubSpot booking link and \"feel free to send me your preferred date and time this week or next week\". (2) 20:51 UTC, Aaron Ver sent \"Let's get you set up with AI Intake — quick 2-week trial\", promising \"full access to AI Intake for a 2-week testing window at no cost\" and asking for 20–30 minutes for a demo plus environment configuration. That closes the \"nobody has contacted them\" finding but not the opportunity itself: rechecked on 8/20, Glenn's calendar still holds no Certified CIO session through 9/6, and Eric has not replied. The rung stays at 15% — nothing configured, no demo held. Action: do not send a third email today. Have Crispin or Glenn phone Eric, or fix a time live in the next CSM monthly — it is now 15 days since 8/5 and two self-service booking links have produced no reply. If there is still nothing by the end of this week, decide explicitly whether to keep chasing or mark it closed, rather than leaving it parked at 15%."
  },
  {
   "track": "prospect",
   "name": "My IT Crew",
   "contact": "Marlene Fanini · Yossi Levy — CSM: Kristine",
   "cadence": "8/6 邮件主动询问 · 8/17 demo 已开 · 14 天试用 8/17 起",
   "status": "热",
   "events": [
    {
     "date": "2026-08-13",
     "time": "17:00",
     "state": "norecord",
     "silent": true,
     "title": "MSPbots Product Demo with Glenn",
     "note": "本次改判：此前记为「未来排期」。8/14 复查 Glenn 日历，8/13 17:00 这一场已经从日历上消失，Fathom 上也搜不到任何 My IT Crew 场次；同时 8/17 16:00 那场仍在，受邀人是 marlenef@ 与 yossil@ 两位。没有取消邀请邮件，客户侧也没有任何书面痕迹，因此按口径记为「无记录 · 静默」。读起来像是改期到 8/17（此前两场并存的状态已经消失，只剩一场），但这是推断，需要 Glenn 一句话确认。",
     "note_en": "Reclassified this run; previously logged as Scheduled. A re-check of Glenn's calendar on 8/14 shows the 8/13 17:00 slot is gone, and Fathom has no My IT Crew session at all; the 8/17 16:00 slot is still there with marlenef@ and yossil@ invited. There is no cancellation invite and no client-side written trace, so it is logged as \"no record · silent\" per the rules. It reads as a reschedule to 8/17 — the two-conflicting-slots state has resolved to a single slot — but that is an inference and needs one sentence from Glenn to confirm."
    },
    {
     "date": "2026-08-17",
     "time": "16:00",
     "state": "held",
     "title": "MSPbots Product Demo with Glenn",
     "note": "本次改判：由「未来排期」改为「已开」。Fathom 787854106（recording 173928286，Glenn 录制），transcript 已逐字读过；Glenn 当天 12:53（美中部）发出会议纪要邮件，已归档在 emails/myitcrewny.com/2026-08-17_MSPbots - MyITCrewNy - AI Ticket Intake - Demo.md。Marlene Fanini 与 Yossi Levy 两人都到场，上一轮「8/13 那场静默消失」的疑问因此有了结果：8/17 这场真的开了，但 8/13 到底是改期还是被推掉，Glenn 仍未给过一句说明。会上当场开通 14 天试用、装好 app、接好 PSA、选定 phone intake skill 与语音，并给出号码 716-271-8542。",
     "note_en": "Reclassified this run from Scheduled to Held. Fathom 787854106 (recording 173928286, recorded by Glenn); the transcript was read verbatim, and Glenn's minutes went out the same day at 12:53 US Central, archived at emails/myitcrewny.com/2026-08-17_MSPbots - MyITCrewNy - AI Ticket Intake - Demo.md. Both Marlene Fanini and Yossi Levy attended, which settles last run's question only halfway: the 8/17 session did happen, but nobody has yet said whether 8/13 was moved by us or dropped by the client. On the call the 14-day trial was switched on, the app was installed, the PSA connected, the phone-intake skill and voice selected, and the number 716-271-8542 provisioned.",
     "fathom": "https://fathom.video/calls/787854106"
    }
   ],
   "pipeline_key": null,
   "ticket_keys": [
    "myitcrewny.com"
   ],
   "email_domain": "myitcrewny.com",
   "stage": "onboarded",
   "stage_evidence": "本次升档 15%→35%。2026-08-17 16:00 UTC 的 demo 开了（Fathom 787854106，transcript 已逐字读过），会上完成的动作正好落在阶梯 35% 的定义上「intake app 已配好、号码已开通」。Glenn 原话：\"I enabled your 14-day trial just earlier for the AI Ticket Intake.\"；讲配置时 \"I already installed the app here... So I have connected your PSA, we have, set up your voice\"，选完 phone intake skill 后 \"And that's a quick setup. So it's already live.\"；号码写在当天的纪要邮件里：\"Phone Number: 716-271-8542\"（emails/myitcrewny.com/2026-08-17_MSPbots - MyITCrewNy - AI Ticket Intake - Demo.md）。没有再往上判到 55%：客户自己还没打过测试电话。Yossi 会上问 \"We can start testing this as soon as we're ready, right?\"，Glenn 答 \"Actually, you can test it already right now.\"，但到本次运行为止，没有任何测试通话、bug 或需求的记录。会上客户明确提出、目前一张工单都没有的两个 gap：① 工单状态不能按来电内容动态设定 —— Glenn 原话 \"All the tickets are created as new.\"，而 Yossi 描述现有答录服务是按紧急程度分状态的（\"If the user will say it's urgent, they'll put it on one status\"）；② 不支持按键分流 —— Yossi 问 \"if you press 1, X, if you do press 2, then Y?\"，Glenn 答 \"We only provision one number for now.\"。商务上 Yossi 说要先拿现有答录服务（Answer First）的账单做成本对比。ClickUp 侧只有一张 onboarding 单 AST-21450，8/17 仍是 pm in progress。",
   "stage_evidence_en": "Raised this run from 15% to 35%. The demo on 2026-08-17 at 16:00 UTC went ahead (Fathom 787854106, transcript read verbatim), and what was done on it lands exactly on the ladder's 35% definition — intake app configured, number provisioned. Glenn: \"I enabled your 14-day trial just earlier for the AI Ticket Intake.\" On configuration: \"I already installed the app here... So I have connected your PSA, we have, set up your voice\", and after picking the phone-intake skill, \"And that's a quick setup. So it's already live.\" The number is in the minutes email the same day: \"Phone Number: 716-271-8542\" (emails/myitcrewny.com/2026-08-17_MSPbots - MyITCrewNy - AI Ticket Intake - Demo.md). It does not go higher than 35%: the client has not placed a test call of their own. Yossi asked \"We can start testing this as soon as we're ready, right?\" and Glenn answered \"Actually, you can test it already right now\" — but as of this run there is no record of any test call, bug or request. Two gaps the client named on the call have no ticket at all: (1) ticket status cannot be set dynamically from what the caller says — Glenn: \"All the tickets are created as new.\", while Yossi described their current answering service as assigning status by urgency (\"If the user will say it's urgent, they'll put it on one status\"); (2) no keypress routing — Yossi asked \"if you press 1, X, if you do press 2, then Y?\" and Glenn answered \"We only provision one number for now.\" Commercially, Yossi said he will pull the incumbent answering service's bill first to build a cost comparison. On the ClickUp side there is one onboarding ticket, AST-21450, still \"pm in progress\" as of 8/17.",
   "next_action": "① 两个 gap 今天落成工单并回告排期：动态工单状态（按来电紧急度写 status）与按键分流/多号码。这两条 Glenn 已经在纪要邮件里写了「MSPbots 会跟进」，写了就得有单，否则就是第二个 Unity IT 式的口径风险。② 试用 8/17 起 14 天，8/31 前后到期 —— 在窗口内主动约一次跟进，别等 Yossi 来找；他明确说要先算 Answer First 的成本对比，那次会就带着分钟数和实际用量去谈。③ AST-21450（MyITCrewNy onboarding）8/17 仍是 pm in progress，试用都开通了，这张单该推完。④ 盯第一通测试电话：有没有打、打了什么结果，决定这家是停在 35% 还是能进 55%。⑤ 顺手问一句 8/13 那场是谁改的期 —— 这条疑问已经挂了 4 轮。",
   "cadence_en": "Inbound email 8/6 · demo held 8/17 · 14-day trial running from 8/17",
   "next_action_en": "1. Log the two gaps as tickets today and tell the client the schedule: dynamic ticket status from caller urgency, and keypress routing across multiple numbers. Glenn's minutes already promise MSPbots will follow up on both, and a promise without a ticket is the same messaging risk that burned us at Unity IT. 2. The trial runs 14 days from 8/17, so it expires around 8/31 — book a check-in inside that window rather than waiting for Yossi; he said he will price up the Answer First comparison first, so bring real minutes and usage to that call. 3. AST-21450 (MyITCrewNy onboarding) was still \"pm in progress\" on 8/17 — the trial is live, so close it out. 4. Watch for the first test call: whether it happens and how it goes decides whether this client stays at 35% or moves to 55%. 5. While you are there, ask who moved the 8/13 slot — that question has now been open for four runs.",
   "ticket_match": [
    "myitcrewny",
    "my it crew"
   ]
  },
  {
   "track": "prospect",
   "name": "Dev-Source",
   "contact": "Brody Babyar · Mike Hopkins — CSM: Kristine",
   "cadence": "7/20 ATI demo · 有竞品在位",
   "status": "温",
   "events": [
    {
     "date": "2026-07-20",
     "time": "—",
     "state": "held",
     "title": "MSPbots Product Demo — AI Ticket Intake (Dev-Source)",
     "fathom": "https://fathom.video/calls/750236570",
     "transcript": "meetings/Dev-Source/2026-07-20-Dev-Source-ATI-Demo.md",
     "note": "86 家客户,ConnectWise。现用 Thread AI voice 做下班后+溢出,约 $1,000/月不限量。对 Skill Studio 灵活度感兴趣,但 Brody 认为 \"very similar to what we already have with Thread\",要 hands-on 才能判断。",
     "note_en": "86 clients, ConnectWise. Currently uses Thread AI voice for after-hours and overflow at ~$1,000/mo unlimited. Interested in Skill Studio's flexibility, but Brody finds it \"very similar to what we already have with Thread\" and needs hands-on to judge."
    },
    {
     "date": "2026-07-21",
     "time": "—",
     "state": "held",
     "title": "DEVsource — TicketQA support (non-ATI)",
     "fathom": "https://fathom.video/calls/755347884",
     "note": "与 ATI 无直接推进,但共享 AI credit 池,影响是否买 ATI。",
     "note_en": "No direct ATI movement, but the shared AI-credit pool bears on whether they buy ATI."
    }
   ],
   "pipeline_key": "Dev-Source",
   "ticket_keys": [
    "Dev-Source"
   ],
   "email_domain": "dev-source.com",
   "stage": "interest",
   "stage_evidence": "7/20 完成 ATI demo。现用竞品 Thread AI voice（约 $1,000/月不限量），Brody 认为「very similar to what we already have」，要 hands-on 才能判断。未配置。",
   "cadence_en": "ATI demo 7/20 · incumbent competitor",
   "stage_evidence_en": "ATI demo completed 7/20. Currently on Thread AI voice (~$1,000/mo unlimited); Brody found it \"very similar to what we already have\" and needs hands-on before judging. Nothing configured.",
   "ticket_match": [
    "dev-source",
    "devsource"
   ]
  },
  {
   "track": "prospect",
   "name": "The Virtual IT Department",
   "contact": "Liam Furlong — CSM: Leonard(澳洲)",
   "cadence": "月度例会 · 7/21 提出 ATI · 8/19 发试用邀请 · 8/21 Matt 回信但把球推回 Liam",
   "status": "温",
   "events": [
    {
     "date": "2026-07-21",
     "time": "—",
     "state": "held",
     "title": "IT Department — Monthly Catch Up (AI Call Answering thread)",
     "fathom": "https://fathom.video/calls/752886872",
     "transcript": "meetings/The Virtual IT Department/2026-07-21-IT-Department-Monthly-Catchup.md",
     "note": "Liam 看过 ATI 介绍视频,试用前要先拿到定价。诉求是 24×7 而不只是下班后。另有澳洲数据驻留的升级诉求需要先解决。",
     "note_en": "Liam watched the ATI intro video and wants pricing before trialling. The ask is 24×7, not just after-hours. An Australian data-residency escalation also needs resolving first."
    }
   ],
   "pipeline_key": "The Virtual IT Department (itdepartment.com.au)",
   "ticket_keys": [
    "itdepartment.com.au"
   ],
   "email_domain": "itdepartment.com.au",
   "stage": "interest",
   "stage_evidence": "7/21 月度例会提出 AI Call Answering 需求，Liam 看过介绍视频但要求先拿到定价才肯试用；想要 24×7 而不只是下班后。我方已开 1 张 onboarding 工单但尚未交付。",
   "cadence_en": "Monthly · raised ATI 7/21 · trial invitation 8/19 · Matt replied 8/21 but handed it back to Liam",
   "stage_evidence_en": "Raised AI Call Answering on the 7/21 monthly. Liam watched the intro video but wants pricing before trialling, and wants 24×7 rather than after-hours only. One onboarding ticket is open on our side, undelivered.",
   "ticket_match": [
    "itdepartment",
    "virtual it dep"
   ],
   "next_action": "【8/22 更新：试用邀请有回信了 —— 是一封礼貌的推回，不是同意，档位不动】2026-08-21 03:46 UTC（收件 03:47）Matt Tierney（IT Manager）回了 Aaron 8/19 那封试用邀请，Aaron 与 Roy Mulia 为收件人，Glenn 与 Grace 在 Cc，原件本轮已在 Outlook 里逐字读过（internetMessageId <SY4SPR01MB0024D6151DE4F596ADFF360FCCA32@SY4SPR01MB0024.AUSP282.PROD.OUTLOOK.COM>）。正文全文只有三句：\"This all sounds very exciting and appreciate the invite!\"、\"At this stage, I'm aware that Liam and the team are already investigating this as we speak. So I will leave it to them to do the initial investigations and report back on their findings.\"、\"Thanks otherwise for the invite.\"怎么读：① 他没有约那 20–30 分钟的 demo，也没有回答 Aaron 问的两件事（首批要交给 ATI 的工单量/渠道、还有谁该进 onboarding 会）；② 他把事情交回给 Liam Furlong —— 也就是 7/21 那位说「先看到定价才肯试用」的人；③ 全文没有任何拒绝措辞，所以这不是 0%。因此档位维持 15%：阶梯的 35% 要 intake app 配好、号码已开通，而这封信连 onboarding 会都还没排上。真正没动的仍是老问题：7/21 客户要的定价，以及澳洲数据驻留，两件都还没给答复 —— 一封「我们会给你开试用」的邀请回答不了它们，Matt 的回信正好证明了这一点。动作：别再对 matt.tierney@ 追这条线，直接回到 Liam（CSM 是 Leonard）；带着定价和数据驻留的答复去，而不是再发一次预约链接。\n\n【8/20 新增】2026-08-19 20:54 UTC Aaron Ver（Product Onboarding Specialist）发信 \"Let's get you set up with AI Intake — quick 2-week trial\"，收件人 matt.tierney@itdepartment.com.au / roy.mulia@itdepartment.com.au，Glenn 与 Grace 在 Cc，原件已读。正文承诺 \"full access to AI Intake for a 2-week testing window at no cost, so your team can see it handling real tickets before deciding whether it's worth adding to your plan.\"，并要 20–30 分钟做 demo 加环境配置，附自助预约链接。这家 7/21 明确说「先看到定价才肯试用」，还有澳洲数据驻留问题没答复 —— 只发试用邀请没有回答那两件事，很可能还是不动。 档位不动，仍为 15%：邮件承诺的是「将会开通」，不是「已经开通」—— 阶梯的 35% 要 intake app 配好、号码发出。动作：盯客户是否回信；一旦真的开了试用并发了号码，这家就该升到 35%，请把开通凭证（试用记录或号码）留在工单里。",
   "next_action_en": "[Updated 8/22: the trial invitation got a reply — a polite hand-off, not a yes; the rung is unchanged] At 03:46 UTC on 2026-08-21 (received 03:47) Matt Tierney (IT Manager) replied to Aaron's 8/19 trial invitation, addressed to Aaron and Roy Mulia with Glenn and Grace on Cc. The original was read verbatim in Outlook this run (internetMessageId <SY4SPR01MB0024D6151DE4F596ADFF360FCCA32@SY4SPR01MB0024.AUSP282.PROD.OUTLOOK.COM>). The body is three sentences in full: \"This all sounds very exciting and appreciate the invite!\"; \"At this stage, I'm aware that Liam and the team are already investigating this as we speak. So I will leave it to them to do the initial investigations and report back on their findings.\"; \"Thanks otherwise for the invite.\" How to read it: (1) he did not book the 20–30 minute demo and did not answer either of Aaron's questions (which ticket volume/channels to hand ATI first, who else should be on the onboarding call); (2) he hands it back to Liam Furlong — the person who said on 7/21 that they want pricing before they will trial; (3) nothing in the text is a refusal, so this is not 0%. The rung therefore stays at 15%: the 35% rung needs the intake app configured and a number issued, and this reply has not even produced an onboarding call. What still has not moved is the old blocker: the pricing the client asked for on 7/21, and Australian data residency — neither has been answered, and an invitation that says \"we will turn on a trial for you\" cannot answer them. Matt's reply is the evidence of that. Action: stop chasing this thread at matt.tierney@ and go back to Liam (CSM is Leonard), carrying answers on pricing and data residency rather than another booking link.\n\n[Added 8/20] On 2026-08-19 at 20:54 UTC Aaron Ver (Product Onboarding Specialist) sent \"Let's get you set up with AI Intake — quick 2-week trial\" to matt.tierney@itdepartment.com.au / roy.mulia@itdepartment.com.au, with Glenn and Grace on Cc; the original was read this run. It promises \"full access to AI Intake for a 2-week testing window at no cost, so your team can see it handling real tickets before deciding whether it's worth adding to your plan\", asks for 20–30 minutes for a demo plus environment configuration, and includes a self-booking link. On 7/21 this client said outright that they want pricing before they will trial, and the Australian data-residency question is still unanswered — a trial invitation that answers neither is likely to go nowhere. The rung is unchanged at 15%: the email promises provisioning, it is not evidence of it — the 35% rung needs the intake app configured and a number issued. Action: watch for a reply; the moment a trial is actually turned on and a number issued, this client moves to 35%, so keep the provisioning record (trial or number) on the ticket."
  },
  {
   "track": "prospect",
   "name": "Unity IT",
   "contact": "— CSM: Aaron",
   "cadence": "7/21 一次性 ATI demo · 8/13 Kip 回信 · 8/17 月度例会上当面退出定价讨论",
   "status": "温",
   "events": [
    {
     "date": "2026-07-21",
     "time": "—",
     "state": "held",
     "title": "AI Ticket Intake DEMO w/ unityit.com",
     "fathom": "https://fathom.video/calls/755405837",
     "transcript": "meetings/Unity IT/2026-07-21-Unity-IT-ATI-Demo.md"
    },
    {
     "date": "2026-08-17",
     "time": "—",
     "state": "held",
     "title": "Unity IT — Monthly Meeting with Kip Haroldsen (CSM Crispin; ATI discussed)",
     "fathom": "https://fathom.video/calls/784901107",
     "note": "本次新增。Crispin Casipit 的月度例会（Fathom 784901107，recording 174094813），transcript 已逐字读过。会议主体是 Ninja 报表与 AI widget builder，末尾 Crispin 主动问 ATI 反馈，Kip 当面给出了自 7/30 以来最清楚的一次表态 —— 这是本轮把 Unity IT 从 90% 降到 55% 的依据，原话见 stage_evidence。",
     "note_en": "Added this run. Crispin Casipit's monthly (Fathom 784901107, recording 174094813); the transcript was read verbatim. Most of the call is about Ninja reports and the AI widget builder, but at the end Crispin asks for ATI feedback and Kip gives his clearest position since 7/30 — the basis for moving Unity IT from 90% to 55% this run. The quotes are in stage_evidence."
    }
   ],
   "pipeline_key": "Unity IT",
   "ticket_keys": [
    "Unity IT",
    "Unityit.com"
   ],
   "email_domain": "unityit.com",
   "stage": "selftest",
   "stage_evidence": "7/21 demo 后进入成本谈判：ATI 约 $400/月是现有下班后供应商（约 $160–170/月）的约 2.5 倍。7/23 邮件跟进时又叠加了公司级「no development without…」政策。7 张工单。 本次补充：8/7 12:47 UTC Glenn 去信 Kip，通报 On-Call Technician Rotation、Business Hours、Team Notification 三个 skill 已完成，\"we've completed nearly all of the deal-breaker requests you previously raised\"，并约下周做 demo；唯一未完成的是 AST-20756（AI 用 skill 解决问题时创建 time entry），仍在进行中。档位不动 —— 这是我方交付进度，不是客户改口；Kip 7/30 的 holding off 至今没有被撤回。\n\n本次补充：2026-08-12 两张单同日上线 —— AST-20756（AI 用 skill 解决问题时创建 time entry，Kip 说没有它就没法向终端客户计费）由 for qa 转 released & live，AST-20755（Autotask 合约类别分级话术）转 waiting for client。Glenn 当天 13:31 UTC 去信 Kip，正文已逐字读过，原话是 \"Which means every deal-breaker you raised is now live\"，并给出商务条件：14 天 / 3,000 credits 试用还剩 6 天，alpha 价 $199/月含 1,000 credits（约 166 分钟），叠加 Daniel 的 120 天退款保障；同时提出建立 ATI 周会并请求本周或下周做 Time Entry 的 walkthrough。档位不动，仍判 90% —— 这全是我方的交付与报价动作，Kip 尚未回信，7/30 那句 holding off 至今没有被撤回。\n\n本次补充（Kip 回信了，档位仍判 90%）：2026-08-13 17:47 UTC Kip Haroldsen 回了 Glenn 8/12 那封信（RE: MSPbots - AI Ticket Intake | Confirmation of AI Ticket Intake Enhancement Requests，Grace 在 Cc，正文已逐字读过）。原话：\"Hi Glenn. I appreciate the update. To start, we would consider using this for our after-hours on-call. We would need an easy way to assign the on-call technician based on a schedule. Additionally, we would need the system to call the on-call technician multiple times if the initial call isn't connected (in addition to PSA, and SMS alerts). However, all of that being said, this cost comes in higher than our current cost for a live operator. I'm not sure that I am seeing the benefit of using this after-hours. Are you finding most people using this during regular business hours, or after hours?\" 两件事因此由客户自己确认了：**① 8/12 那句「every deal-breaker you raised is now live」是错的** —— Kip 在回信里原样重申了两条尚未交付的诉求：按排班指派 on-call 技术员（对应 AST-21143，仍是 new）、初次未接通时多次重呼并叠加 SMS 告警（对应 AST-21144 与 AST-20757，都仍是 new，SMS 能力至今不存在）。**② 阻力从「功能没做完」升级成了「价值不成立」** —— 他明说成本高于现有真人接线员，且看不出下班后使用的好处。Daniel 当天 19:40 UTC 在同一线程回信解释了 AI 相对真人接线的价值。档位维持 90%：按阶梯定义这仍然属于定价/商务讨论（他在比成本，没有拒绝），但这是这家第一次把「看不到价值」写下来 —— 已在 open_questions 里请 Aaron/Glenn 复核这个 90%。\n\n【本次降档 90%→55%，依据是 8/17 的通话录音】2026-08-17 Crispin Casipit 的月度例会（Fathom 784901107，recording 174094813，transcript 已逐字读过）。Crispin 问 \"you have the ticket intake. Any, any feedback on that one?\"，Kip Haroldsen 的回答原话：\"No, I don't know that we're ready to give that a go.\"；成本：\"right now I have a live body that answers the phone and it costs me half of what you guys are going to start at.\"；排班仍未解决：\"my technicians rotate on call every week. There's not an easy way for them to go in there and update their schedule in MSPbots. And so that was one thing, one of the issues I had with it.\"；一条新的、更根本的疑虑：\"I'm also, I'm not 100% that people are going to enjoy talking to AI when they call my office.\"；实际使用量：\"we tried it out one time and it was kind of glitching out on me... besides one time, I haven't tried it out again since then.\"。为什么不再是 90%：阶梯的 90% 是「在谈定价/合同」，而 8/13 那封信里他还在比成本、8/17 他已经退到「还没准备好试」，并把反对理由从价格扩展到「客户愿不愿意跟 AI 说话」—— 这不是商务谈判的状态。为什么不是 0%：他没有拒绝，同一通电话里还说 \"Well, I'll give the number a call. I'll see what it does.\"。为什么落在 55% 而不是 15%：阶梯的 55% 是「客户自己打过测试电话、提出 bug/需求」，Unity IT 两件都做过（至少一通自测电话，7 张单，含 AST-21143 / AST-21144 / AST-20757 三条 deal-breaker），行为事实不会因为态度回落而消失。注意 8/17 这通电话里 Kip 从头到尾没有提 8/12 通报的 time entry 与合约分级已上线 —— 我方两周的交付他没有感知到。",
   "cadence_en": "One-off ATI demo 7/21 · Kip replied 8/13 · stepped back from the pricing discussion on the 8/17 monthly",
   "stage_evidence_en": "Moved into cost negotiation after the 7/21 demo: ATI at ~$400/mo is ~2.5× their current after-hours vendor (~$160–170/mo). A company-wide \"no development without…\" policy was added in the 7/23 email follow-up. 7 tickets. Added this run: on 8/7 at 12:47 UTC Glenn wrote to Kip that three skills are complete — On-Call Technician Rotation, Business Hours and Team Notification — that \"we've completed nearly all of the deal-breaker requests you previously raised\", and asked for a demo next week. The one outstanding item is AST-20756 (a time entry when the AI resolves an issue via a skill), still in progress. The rung is unchanged: this is our delivery progress, not the client changing position, and Kip's 7/30 \"holding off\" has not been withdrawn.\n\nAdded this run: two tickets shipped on the same day, 2026-08-12 — AST-20756 (a time entry when the AI resolves an issue via a skill; without it, Kip cannot bill the end customer) moved from \"for qa\" to \"released & live\", and AST-20755 (Autotask contract-category tiered prompts) moved to \"waiting for client\". Glenn wrote to Kip at 13:31 UTC that day; the body was read verbatim and states \"Which means every deal-breaker you raised is now live\", together with the commercial terms: 6 days left on the 14-day / 3,000-credit trial, alpha pricing of $199/month for the 1,000-credit plan (roughly 166 minutes), plus Daniel's 120-day money-back guarantee — and a request to start an ATI weekly and to walk through Time Entry this week or next. The rung is unchanged at 90%: this is all our delivery and our quote, Kip has not replied, and his 7/30 \"holding off\" has not been withdrawn.\n\nAdded this run (Kip replied; the rung stays at 90%): at 2026-08-13 17:47 UTC Kip Haroldsen answered Glenn's 8/12 email (RE: MSPbots - AI Ticket Intake | Confirmation of AI Ticket Intake Enhancement Requests, Grace on Cc; body read verbatim). His words: \"Hi Glenn. I appreciate the update. To start, we would consider using this for our after-hours on-call. We would need an easy way to assign the on-call technician based on a schedule. Additionally, we would need the system to call the on-call technician multiple times if the initial call isn't connected (in addition to PSA, and SMS alerts). However, all of that being said, this cost comes in higher than our current cost for a live operator. I'm not sure that I am seeing the benefit of using this after-hours. Are you finding most people using this during regular business hours, or after hours?\" Two things are now confirmed by the client himself. **1. The 8/12 claim that \"every deal-breaker you raised is now live\" was wrong** — Kip restates two undelivered asks word for word: assigning the on-call technician from a schedule (AST-21143, still \"new\") and retrying the on-call technician repeatedly with SMS alerts when the first call fails (AST-21144 and AST-20757, both still \"new\"; SMS does not exist yet). **2. The obstacle has moved from missing features to missing value** — he states plainly that the cost is higher than their current live operator and that he cannot see the benefit of using this after hours. Daniel replied on the same thread at 19:40 UTC that day setting out the value of AI over a live answering service. The rung stays at 90%: under the ladder this is still a pricing/commercial discussion (he is comparing cost, not declining) — but it is the first time this client has written down that they cannot see the value, and Aaron/Glenn are asked to review that 90% in the open questions.\n\n[DOWNGRADED THIS RUN, 90% to 55%, on the 8/17 recording] The monthly with Crispin Casipit on 2026-08-17 (Fathom 784901107, recording 174094813; transcript read verbatim). Crispin asks, \"you have the ticket intake. Any, any feedback on that one?\" Kip Haroldsen's answer, verbatim: \"No, I don't know that we're ready to give that a go.\" On cost: \"right now I have a live body that answers the phone and it costs me half of what you guys are going to start at.\" Scheduling is still unresolved: \"my technicians rotate on call every week. There's not an easy way for them to go in there and update their schedule in MSPbots. And so that was one thing, one of the issues I had with it.\" A newer and more fundamental doubt: \"I'm also, I'm not 100% that people are going to enjoy talking to AI when they call my office.\" And on actual usage: \"we tried it out one time and it was kind of glitching out on me... besides one time, I haven't tried it out again since then.\" Why it is no longer 90%: that rung means an active pricing or contract discussion, and while the 8/13 email still compared costs, by 8/17 he has stepped back to not being ready to try it at all and widened the objection from price to whether callers will accept an AI. That is not a commercial negotiation. Why not 0%: he has not declined — in the same call he says, \"Well, I'll give the number a call. I'll see what it does.\" Why 55% rather than 15%: the ladder's 55% is \"client placed their own test calls, raised bugs/requests\", and Unity IT has done both (at least one self-placed test call, 7 tickets, including the three deal-breakers AST-21143 / AST-21144 / AST-20757). Behaviour already performed does not un-happen when sentiment falls back. Note also that Kip never mentions the time entry and contract-tiering work reported to him on 8/12 — two weeks of our delivery has not registered with him.",
   "ticket_match": [
    "unity it",
    "unityit"
   ],
   "next_action": "① 本轮的档位已经从 90% 降到 55%，请 Aaron/Glenn 复核这个判断（依据见 open_questions）。② 8/17 Kip 说 \"I'll give the number a call. I'll see what it does.\" —— 这是两周里唯一一个可执行的钩子。查号码是否还通、试用有没有到期，他真打了就当天跟进，别让这次自测又变成「glitching out」。③ 排班仍是第一阻力，且他 8/17 又说了一遍：AST-21143（按排班指派 on-call、技术员无需登录 MSPbots）必须给一个日期，它至今还是 new。④ 8/12 通报的 time entry 与合约分级他毫无印象 —— 说明我们的交付通报没有到达。下次接触用一句话讲清「你提的哪几条已经能用了」，别再发功能清单。⑤ 新出现的是产品价值疑虑（\"not 100% that people are going to enjoy talking to AI\"），这不是功能能回答的，要用其他客户的真实来电数据回答。⑥ 这家已经从「在谈价」退回「还没准备好试」，把它从定价名单里拿掉，别再按 90% 做预测。\n\n【8/19 补充】Glenn 已经动了，但方式正好撞在客户拒绝过的那一点上：8/18 12:59 UTC 他在「Confirmation of AI Ticket Intake Enhancement Requests」线程上回了 Kip，原话是 \"Yes. The app can handle both business hours and after hours. We already have a skill to assign the on-call technician based on schedule. If you have the schedule, please send it to me I'll update the skill and you can test it out.\" —— 业务时段的问题答对了，但「把排班表发给我、我来改 skill」正是 Kip 7/21 明确拒绝的做法（他的原话是不能让技术员登录 MSPbots 改 escalation skill，这就是 AST-21143 的由来，那张单至今还是 new）。截至 8/19 01:00 UTC Kip 没有回信。下一步别再问排班表，先给 AST-21143 一个日期。",
   "next_action_en": "1. The rung has been cut from 90% to 55% this run — Aaron/Glenn to review the call (rationale in open_questions). 2. On 8/17 Kip said, \"I'll give the number a call. I'll see what it does.\" That is the only actionable hook in two weeks: check the number is still live and the trial has not lapsed, and follow up the day he calls so this self-test does not end in another \"glitching out\". 3. Scheduling is still the first blocker and he raised it again on 8/17 — AST-21143 (assign the on-call tech from a schedule without technicians logging into MSPbots) needs a date; it is still \"new\". 4. He has no recollection of the time entry and contract tiering reported on 8/12, which means our delivery updates are not landing. Next contact should say in one sentence which of his own asks now work, not send another feature list. 5. The new objection is about value, not features (\"not 100% that people are going to enjoy talking to AI\") — answer it with real caller data from other clients, not with a roadmap. 6. This account has moved from negotiating price back to not being ready to test; take it off the pricing list and stop forecasting it at 90%.\n\n[Added 8/19] Glenn has re-engaged, but in the exact shape the client already rejected: at 12:59 UTC on 8/18 he replied to Kip on the \"Confirmation of AI Ticket Intake Enhancement Requests\" thread, verbatim: \"Yes. The app can handle both business hours and after hours. We already have a skill to assign the on-call technician based on schedule. If you have the schedule, please send it to me I'll update the skill and you can test it out.\" The business-hours question is answered correctly, but \"send me the schedule and I'll update the skill\" is precisely what Kip ruled out on 7/21 — he will not have technicians editing the escalation skill inside MSPbots, which is why AST-21143 exists, and that ticket is still \"new\". Kip had not replied as of 01:00 UTC on 8/19. The next move is a date for AST-21143, not another request for the roster."
  },
  {
   "track": "prospect",
   "name": "TeamLogic IT (LBMH)",
   "contact": "— CSM: Aaron",
   "cadence": "7/24 + 7/29 · sales intake 用例 · 8/27 CSM 月度例会上客户表示正在考虑砍掉平台的 AI 部分",
   "status": "风险",
   "events": [
    {
     "date": "2026-07-24",
     "time": "—",
     "state": "held",
     "title": "Team Logic IT — AI Sales Intake + Triage",
     "transcript": "meetings/Team Logic IT (Little Bellemont)/2026-07-24-Team_Logic_IT-AI_Sales_Intake-Triage.md"
    },
    {
     "date": "2026-07-29",
     "time": "—",
     "state": "held",
     "title": "MSPbots | Ticket Intake - TeamlogicIT LBMH",
     "fathom": "https://fathom.video/calls/765799954",
     "transcript": "meetings/Team Logic IT (Little Bellemont)/2026-07-29-Team_Logic_IT-Ticket_Intake-Sales_Intake_Use_Case.md",
     "note": "用例偏向 sales intake(接销售来电)而不是 support intake —— 与当前 ATI 定位有偏差。",
     "note_en": "The use case leans toward sales intake (inbound sales calls) rather than support intake — a divergence from ATI's current positioning."
    },
    {
     "date": "2026-08-27",
     "time": "—",
     "state": "held",
     "title": "MSPbots | Team Logic IT (Little Bellemont) Monthly Catch Up (CSM Jazz; ATI de-adoption signal)",
     "fathom": "https://fathom.video/calls/800061413",
     "transcript": "meetings/Team Logic IT (Little Bellemont)/2026-08-27-Team_Logic_IT-Monthly-Catch-Up.md",
     "note": "本次新增。这不是 ATI 周会，是 Jazz Laban 的 CSM 月度例会，Apeksha 在会上做 SOP Agent 的探索式 demo；ATI 只出现在开场几分钟里，但那几分钟是这条线本轮最重要的证据。transcript 已逐字读过（Fathom recording 177487569 / calls/800061413），不是转述：Randall Wilson 开场就说 \"The whole AI usage thing that I am considering getting rid of because I'm not using it. The voice thing I'm not using.\"，随后 \"we're not moving away from the platform. We're just going to probably just going to move away from the AI part of the platform. Unless you guys got something super fancy that I don't know about coming down the pipe.\"，收尾又补了一句 \"as far as the AI stuff, like I said, might just end up removing that. I'll let you know.\" 同一场里 sales intake 用例被当场否掉：他说 \"my sales guy does not want AI answering the phone at all for his incoming calls, which was what we were told we would do.\"，Jazz 接 \"So we're going to put that off the table now, the sales intake.\" 档位本轮不动，仍 35% —— 见 stage_evidence 里的理由。",
     "note_en": "New this run. This is not an ATI weekly; it is Jazz Laban's CSM monthly, with Apeksha running a discovery demo of SOP Agent. ATI appears only in the first few minutes, but those minutes are the most important evidence on this thread this run. The transcript was read verbatim (Fathom recording 177487569 / calls/800061413), not paraphrased: Randall Wilson opens with \"The whole AI usage thing that I am considering getting rid of because I'm not using it. The voice thing I'm not using.\", then \"we're not moving away from the platform. We're just going to probably just going to move away from the AI part of the platform. Unless you guys got something super fancy that I don't know about coming down the pipe.\", and closes with \"as far as the AI stuff, like I said, might just end up removing that. I'll let you know.\" In the same session the sales-intake use case is killed outright: he says \"my sales guy does not want AI answering the phone at all for his incoming calls, which was what we were told we would do\", and Jazz answers \"So we're going to put that off the table now, the sales intake.\" The rung does not move this run and stays at 35% — the reasoning is in stage_evidence."
    }
   ],
   "pipeline_key": "Team Logic IT (Little Bellemont)",
   "ticket_keys": [
    "Littlebellemont.com"
   ],
   "email_domain": "teamlogicit.com",
   "stage": "onboarded",
   "stage_evidence": "7/24、7/29 两场会 + 1 张 onboarding 工单（已完成）。用例偏 sales intake（接销售来电）而非 support intake，与当前 ATI 定位有偏差。\n\n本轮（2026-08-29）新增第一手证据，档位不动，仍为 35%，但状态由「温」改为「风险」。2026-08-27 的 CSM 月度例会 transcript 已逐字读过（Fathom recording 177487569 / https://fathom.video/calls/800061413，另有仓库纪要 meetings/Team Logic IT (Little Bellemont)/2026-08-27-Team_Logic_IT-Monthly-Catch-Up.md）。Randall Wilson 的原话是：\"The whole AI usage thing that I am considering getting rid of because I'm not using it. The voice thing I'm not using.\"；\"we're not moving away from the platform. We're just going to probably just going to move away from the AI part of the platform. Unless you guys got something super fancy that I don't know about coming down the pipe. But that would make me change my mind on that.\"；收尾 \"as far as the AI stuff, like I said, might just end up removing that. I'll let you know.\" 为什么不降到 0%：阶梯里 lost(0%) 的定义是「明确拒绝，书面或会上」，而这三句都是「正在考虑」「大概会」「我再告诉你」，而且他自己留了改变主意的条件。按 runbook 第 3 条与 Valeo 那一课的口径，证据要支撑判定本身，不能拿倾向当拒绝，因此本轮只记录信号、不降档，并把这条放进 open_questions 让人去要一个明确答复。同一场里唯一称得上「明确」的是用例层面：sales intake 被当场否掉 —— Randall \"my sales guy does not want AI answering the phone at all for his incoming calls, which was what we were told we would do.\"，Jazz \"So we're going to put that off the table now, the sales intake.\" 这家从 7/24 起就是 sales intake 用例，所以这条线现在没有支撑它的用例了。另外两个事实供人判断：他给的理由是客户端不接受（\"our clients hate it. hang up on it\"，并说连真人接听服务也有约 90% 挂断），而 QA 与 sentiment 已经被他自建的 Roost → Claude API 流程替掉。",
   "cadence_en": "7/24 + 7/29 · sales-intake use case · on the 8/27 CSM monthly the client said he is considering dropping the AI part of the platform",
   "stage_evidence_en": "Two meetings plus 1 onboarding ticket (completed). The use case leans toward sales intake (inbound sales calls) rather than support intake, which diverges from ATI's current positioning.\n\nFirst-hand evidence added this run (2026-08-29); the rung is unchanged at 35%, but the status moves from warm to at-risk. The transcript of the 2026-08-27 CSM monthly was read verbatim (Fathom recording 177487569 / https://fathom.video/calls/800061413; there is also a repo note at meetings/Team Logic IT (Little Bellemont)/2026-08-27-Team_Logic_IT-Monthly-Catch-Up.md). Randall Wilson's own words: \"The whole AI usage thing that I am considering getting rid of because I'm not using it. The voice thing I'm not using.\"; \"we're not moving away from the platform. We're just going to probably just going to move away from the AI part of the platform. Unless you guys got something super fancy that I don't know about coming down the pipe. But that would make me change my mind on that.\"; and, closing, \"as far as the AI stuff, like I said, might just end up removing that. I'll let you know.\" Why this is not a drop to 0%: the ladder defines lost (0%) as explicitly declined, in writing or on a call, and all three of those are \"considering\", \"probably\" and \"I'll let you know\" — he even names the condition that would change his mind. Under rule 3 of the runbook and the Valeo lesson, the evidence has to support the verdict itself; an inclination is not a refusal. So this run records the signal, leaves the rung alone, and puts the question into open_questions so somebody goes and gets a definite answer. The one thing that is explicit is at the use-case level: sales intake was killed on the call — Randall, \"my sales guy does not want AI answering the phone at all for his incoming calls, which was what we were told we would do\"; Jazz, \"So we're going to put that off the table now, the sales intake.\" This client has been a sales-intake use case since 7/24, so the thread no longer has a use case underneath it. Two further facts for whoever judges this: his stated reason is end-user rejection (\"our clients hate it. hang up on it\", and he puts the hang-up rate at roughly 90% even against a live answering service), and QA and sentiment have already been replaced by his own Roost → Claude API pipeline.",
   "ticket_match": [
    "teamlogic",
    "team logic",
    "littlebellemont"
   ],
   "next_action": "【8/29 更新：这条线现在需要的是一个明确答复，不是又一次功能推送】① 2026-08-27 会上 Randall 说 \"might just end up removing that. I'll let you know.\" —— 请 Jazz（CSM，本场主持）在下一次接触时把这句变成一个是/否：AI/voice 部分是留还是砍，砍的话是否含 ATI。拿到答复之前档位停在 35%，拿到之后按 runbook 第 3 条填 rejection（channel/date/who/quote/ref）再降档。② sales intake 用例已被客户当场否掉（他的销售负责人不接受 AI 接听来电），这家从 7/24 起就只有这一个用例 —— 请 Glenn 决定：是就此把 TeamLogic 从 ATI 线上摘掉、只留 BI/NextTicket，还是换 support intake 重新立一个用例。这个决定不做，8/7 那封功能通报（分时段路由 / 自动轮值 / 挂断通知）就会继续对着一个已经不存在的用例发。③ 8/7 19:16 UTC Glenn 那封信至今没有回信，本轮不建议再补发同样内容 —— Randall 明确说了会让他改变主意的是 \"something super fancy... coming down the pipe\"，而不是已有转接能力的增量。④ 与 ATI 无关但同场承诺、别漏：Randall 会把 Thread inbox 的 URL / ticket-ID 映射发给 Jazz，用来把 NextTicket 深链从 Autotask 改指 Thread。",
   "next_action_en": "[8/29 update: what this thread needs now is a definite answer, not another feature push] (1) On the 8/27 call Randall said \"might just end up removing that. I'll let you know.\" Jazz (the CSM who ran the session) should turn that into a yes or no at the next contact: is the AI/voice part staying or going, and if going, does that include ATI? Until there is an answer the rung stays at 35%; once there is one, fill in rejection (channel / date / who / quote / ref) per rule 3 of the runbook and then drop the rung. (2) The sales-intake use case was killed on the call (his sales lead will not have AI answering inbound calls), and sales intake has been this client's only use case since 7/24 — Glenn should decide whether to take TeamLogic off the ATI thread entirely and keep them on BI/NextTicket, or stand up a fresh support-intake use case instead. Until that decision is made, the 8/7 feature note (time-based routing / automated rotation / hang-up notification) keeps being pitched at a use case that no longer exists. (3) Glenn's 8/7 19:16 UTC mail is still unanswered, and re-sending the same content is not advised this run — Randall said plainly that what would change his mind is \"something super fancy... coming down the pipe\", not an increment on the escalation features he already knows about. (4) Unrelated to ATI but promised on the same call, so it should not be dropped: Randall will send Jazz the Thread inbox URL / ticket-ID mapping so the NextTicket deep link can be repointed from Autotask to Thread."
  },
  {
   "track": "prospect",
   "name": "ISG Technology",
   "contact": "— CSM: Jazz",
   "cadence": "月度例会 · 6/29 demo 后无进展 · 8/17 例会已开但未谈 ATI",
   "status": "温",
   "events": [
    {
     "date": "2026-06-15",
     "time": "—",
     "state": "held",
     "title": "ISG Technology — Monthly Catch Up",
     "fathom": "https://fathom.video/calls/711848582",
     "transcript": "meetings/ISG Technology/2026-06-15-ISG-Technology-Monthly-Catchup.md"
    },
    {
     "date": "2026-06-29",
     "time": "—",
     "state": "held",
     "title": "AI Ticket Intake Product Demo with ISG Technology",
     "fathom": "https://fathom.video/calls/727242322",
     "transcript": "meetings/ISG Technology/2026-06-29-ISG-Technology-ATI-Demo.md",
     "note": "6/30 发出会议纪要 + 定价更新邮件",
     "note_en": "Minutes and a pricing-update email went out on 6/30"
    },
    {
     "date": "2026-07-20",
     "time": "—",
     "state": "held",
     "title": "ISG Technology — Monthly Catch Up",
     "fathom": "https://fathom.video/calls/752887563",
     "transcript": "meetings/ISG Technology/2026-07-20-ISG-Technology-Monthly-Catchup.md",
     "note": "demo 三周后的例会,ATI 未推进到试用",
     "note_en": "The monthly three weeks after the demo; ATI did not progress to a trial"
    },
    {
     "date": "2026-08-17",
     "time": "21:00",
     "state": "held",
     "title": "MSPbots | ISG Technology - Monthly Catch Up",
     "note": "本次改判：由「未来排期」改为「已开」（Fathom 787445651，recording 174090268，Kristine Gadayan 录制；客户方 Jennifer Griswold、Jeff Rankin、Katelyn Nguyen、Lee Johnson、Sean Fleming，Glenn 在场）。但这场会没有推进 ATI：按 Fathom 摘要，议题是 NextTicket 派单采用率（MSP 团队约 95% 新单已由系统派）与 SOP Agent 演示，ATI 既不在讨论要点里，也不在 next steps 里。这里只读了摘要、没有逐字看 transcript，因此按「摘要转述」对待，不作为任何档位判定的依据 —— 但「7 张未开工工单又一次没有当面回告」这件事需要 Glenn 一句话确认。",
     "note_en": "Reclassified this run from Scheduled to Held (Fathom 787445651, recording 174090268, recorded by Kristine Gadayan; Jennifer Griswold, Jeff Rankin, Katelyn Nguyen, Lee Johnson and Sean Fleming from the client, with Glenn present). The session did not move ATI forward: per the Fathom summary the agenda was NextTicket dispatch adoption (roughly 95% of new Managed Services tickets now dispatched by the system) and an SOP Agent demo, with ATI appearing neither in the discussion points nor in the next steps. Only the summary was read, not the transcript, so this is treated as a second-hand account and is not used to judge any rung — but Glenn needs to confirm in one sentence that the 7 untouched tickets went unreported face to face once again.",
     "fathom": "https://fathom.video/calls/787445651"
    }
   ],
   "pipeline_key": "ISG Technology",
   "ticket_keys": [
    "ISG Technology"
   ],
   "email_domain": "isgtech.com",
   "stage": "onboarded",
   "stage_evidence": "6/29 demo + 6/30 发出纪要与定价更新邮件，10 张工单（7 张未开始）。7/20 月度例会未推进到试用，已 18 天无沟通。",
   "cadence_en": "Monthly · no progress since the 6/29 demo · the 8/17 monthly went ahead without ATI on the agenda",
   "stage_evidence_en": "Demo 6/29 plus a minutes-and-pricing email on 6/30; 10 tickets, 7 of them not started. The 7/20 monthly did not move it to a trial, and there has been no contact for 18 days.",
   "ticket_match": [
    "isg technology",
    "isgtech"
   ],
   "next_action": "8/17 21:00 的月度例会开了（Fathom 787445651），但按 Fathom 摘要，全场谈的是 NextTicket 派单与 SOP Agent 演示，ATI 一句没提 —— 上一轮写的「别浪费这次机会，会前先发工单状态邮件」并没有发生：7 张未开工的单第二次无声挂过一次接触，而这家是本板上最大的单客户积压。动作：① 今天补一封状态邮件，逐条说明 7 张 enhancement 做/不做/延后，并把 8 月上线的三个升级能力（AST-20245/20246/20247）写清楚；② 摘要口径请 Glenn 复核 —— 如果会上其实提了 ATI，请提供片段，本板据实修正；③ 下一次月度例会前，把 ATI 明确写进议程，否则 SOP Agent 会继续占满这条线。",
   "next_action_en": "The 8/17 21:00 monthly did take place (Fathom 787445651), but per the Fathom summary the whole call was NextTicket dispatch and an SOP Agent demo — ATI never came up. Last run's instruction, send the ticket-status email before the call and do not waste the slot, did not happen: seven untouched tickets have now passed a second contact in silence, and this is the largest single-client backlog on the board. Actions: (1) send the status email today, saying for each of the 7 enhancements whether it is being built, dropped or deferred, and spelling out the three escalation capabilities that shipped in August (AST-20245/20246/20247); (2) Glenn to check the summary — if ATI was in fact discussed, provide the excerpt and this board will correct itself; (3) put ATI explicitly on the agenda of the next monthly, or SOP Agent will keep taking the whole slot."
  },
  {
   "track": "prospect",
   "name": "KRS-IT",
   "contact": "Joe Krstinovski · Kevin Obello — CSM: Leonard",
   "cadence": "月度例会 · 6/18 浮现商机 · 8/24 转交同事 · 8/25 Kevin Obello 表态愿意试 · 9/3 配置会已排期，Josiv 已接受",
   "status": "温",
   "events": [
    {
     "date": "2026-06-18",
     "time": "—",
     "state": "held",
     "title": "KRS IT — AI Triage Review (ATI OPPORTUNITY)",
     "fathom": "https://fathom.video/calls/714412117",
     "transcript": "meetings/KRS-IT/2026-06-18-KRS-IT_AI_Triage_Review.md",
     "note": "Joe 问能否自动化 L1 工单/新用户开通(跑 PowerShell、加 license、改密码、加通讯组)。现用 Pia。诉求超出当前 ATI 能力(要能 act on tickets,不只是接电话)。",
     "note_en": "Joe asked whether L1 tickets and new-user provisioning could be automated (run PowerShell, add licences, reset passwords, add to distribution groups). They run Pia today. The ask exceeds ATI's current scope — it needs to act on tickets, not just answer calls."
    },
    {
     "date": "2026-06-24",
     "time": "—",
     "state": "held",
     "title": "KRS-IT — NextTicket + AI Triage Review",
     "transcript": "meetings/KRS-IT/2026-06-24-KRS-IT-NextTicket-AI-Triage-Review.md"
    },
    {
     "date": "2026-07-08",
     "time": "—",
     "state": "held",
     "title": "KRS-IT — ConnectWise / NextTicket / AI Triage",
     "transcript": "meetings/KRS-IT/2026-07-08-KRS-IT-ConnectWise-NextTicket-AI-Triage.md"
    },
    {
     "date": "2026-09-03",
     "time": "16:30",
     "state": "upcoming",
     "title": "Next Ticket x Intake Configuration",
     "note": "本次新增。日历原件已读（Glenn 日历，calendarOwnerEmail=glenn.bugtong@mspbots.ai）：createdDateTime 2026-08-27 17:02:16 UTC、start 2026-09-03 16:30 UTC、end 17:30 UTC、organizer 是 Aaron Ver（aaron.ver@mspbots.ai）、isCancelled=false。客户方三名受邀人：Josiv Krstinovski（josiv@krsit.com，responseStatus=accepted）、Josef Muertegui（josef@krsit.com，未答复）、Kevin Obello（kevin@krsit.com，未答复）；我方 Glenn 受邀，Leonard Narvaza 为 optional 且已 declined。这是 8/25 Kevin 说愿意试之后第一件真正落到日历上的动作，也是这条线自 7/8 以来的第一场会。档位不动，仍 15% —— 阶梯里 35% 要求「intake app 已配置、号码已开通」，这一场是去做配置的，不是配置已完成的凭证。",
     "note_en": "New this run. The calendar entry was read in full (Glenn's calendar, calendarOwnerEmail=glenn.bugtong@mspbots.ai): createdDateTime 2026-08-27 17:02:16 UTC, start 2026-09-03 16:30 UTC, end 17:30 UTC, organiser Aaron Ver (aaron.ver@mspbots.ai), isCancelled=false. Three client-side invitees: Josiv Krstinovski (josiv@krsit.com, responseStatus=accepted), Josef Muertegui (josef@krsit.com, no response) and Kevin Obello (kevin@krsit.com, no response); Glenn is invited on our side and Leonard Narvaza is optional and has declined. This is the first thing to actually reach the calendar since Kevin said on 8/25 that he was willing to try it, and the first session on this thread since 7/8. The rung is unchanged at 15%: the ladder puts 35% at \"intake app configured, number provisioned\", and this is the session that goes to do the configuring — not proof that it is done."
    }
   ],
   "pipeline_key": null,
   "ticket_keys": [],
   "email_domain": null,
   "stage": "interest",
   "stage_evidence": "6/18 例会上 Joe 问能否自动化 L1 工单与新用户开通（跑 PowerShell、加 license、改密码）。诉求超出当前 ATI 能力（要能 act on tickets，不只是接电话）。现用 Pia。\n\n本轮（2026-08-26）补充，档位不动，仍为 15%：2026-08-25 13:01 UTC 运营经理 Kevin Obello（kevin@krsit.com）回复了 Josiv 8/24 的转交（Outlook 原件逐字读过，Grace 在 Cc），原话 \"AI Intake for Afterhours would be nice to try out. I'm not too fond of our current answering service since the CW integration isn't great.\" —— 这是这家客户第一次由客户方自己明确表达试用意愿，此前 6/18 的证据是 Joe 问能不能自动化 L1 工单。但阶梯的 35% 要 intake app 配好、号码已发出，这封信只是「愿意试」，没有任何开通凭证，因此不升档。",
   "cadence_en": "Monthly · need surfaced 6/18 · handed to colleagues 8/24 · Kevin Obello said yes to trying it 8/25 · a configuration session is booked for 9/3 and Josiv has accepted",
   "stage_evidence_en": "On the 6/18 monthly Joe asked whether L1 tickets and new-user provisioning could be automated (run PowerShell, add licences, reset passwords). That exceeds what ATI does today — it needs to act on tickets, not just answer calls. Currently on Pia.\n\nAdded this run (2026-08-26); the rung is unchanged at 15%. At 13:01 UTC on 2026-08-25 the Operations Manager, Kevin Obello (kevin@krsit.com), answered the hand-off Josiv made on 8/24 (the Outlook original was read verbatim; Grace was on Cc): \"AI Intake for Afterhours would be nice to try out. I'm not too fond of our current answering service since the CW integration isn't great.\" That is the first time anyone on the client side has expressed a willingness to trial it in their own words — the 6/18 evidence was Joe asking whether L1 tickets could be automated. But the 35% rung requires the intake app configured and a number issued; this email is a willingness, with no provisioning record of any kind, so there is no promotion.",
   "ticket_match": [
    "krs-it",
    "krs it"
   ],
   "next_action": "【8/28 更新：Kevin 的「愿意试」落地成了一场配置会 —— 但他 8/25 问的定价问题到现在还是没人回答】① 本轮唯一的新证据是一条日历记录：2026-08-27 17:02:16 UTC Aaron Ver 建了 “Next Ticket x Intake Configuration”，9/3 16:30–17:30 UTC，客户方 Josiv、Josef、Kevin 三人受邀，Josiv 已 accepted（日历原件逐字读过）。这是这条线自 7/8 以来的第一场会，8/25 那封信终于有了下一步。② 档位不动，仍 15%：会排上不等于配好。9/3 那场如果真的配好 app、发出号码，就可以升 35%，请把开通凭证（号码、app 配置截图或工单）留在单里再升。③ 仍然没人做的一件事：Kevin 8/25 13:01 UTC 的原话 “I'm not sure how the pricing model works but if it uses the credit model as the other AI modules, we could fit it into our stack.” —— 复查 Outlook 到 8/28，MSPbots 一方仍无任何回信，已经压了 3 天。配置会安排在报价之前，顺序是反的：他给的量级是每月不到 10–30 通夜间来电，按 5 分钟一通估约 150 分钟，落在 $199/月含 200 分钟的额度内 —— 这个数字现在就能给他，不必等到 9/3 当面说。④ 范围问题仍未确认：这家最早要的是自动跑 PowerShell、开新用户、改密码，超出 ATI 能力；Kevin 8/25 把范围收窄到「夜间接听 + CW 集成」。9/3 的配置会是确认这一点的最好时机 —— 会名里带 “Next Ticket”，需要有人先弄清这一场到底配哪个产品、ATI 占多少。",
   "next_action_en": "[8/28 update: Kevin's \"willing to try\" has turned into a booked configuration session — but the pricing question he asked on 8/25 still has no answer] (1) The only new evidence this run is a calendar record: at 17:02:16 UTC on 2026-08-27 Aaron Ver created \"Next Ticket x Intake Configuration\" for 9/3 16:30–17:30 UTC, with Josiv, Josef and Kevin invited on the client side and Josiv already accepted (the calendar entry was read verbatim). It is the first session on this thread since 7/8, and it finally gives the 8/25 email a next step. (2) The rung is unchanged at 15%: a booked session is not a configured app. If 9/3 genuinely configures the app and issues a number, it can go to 35% — keep the provisioning record (the number, a config screenshot or the ticket) on the ticket before promoting. (3) One thing still nobody has done: Kevin's own words at 13:01 UTC on 8/25 were \"I'm not sure how the pricing model works but if it uses the credit model as the other AI modules, we could fit it into our stack.\" Re-checking Outlook through 8/28, there is still no reply from anyone at MSPbots — three days now. Booking the configuration session ahead of the quote gets the order backwards: the volume he gave is fewer than 10–30 after-hours calls a month, roughly 150 minutes at five minutes a call, inside the $199/month 200-minute allowance — that number can be sent to him today rather than waited on until 9/3. (4) The scope question is still unconfirmed: this client originally wanted PowerShell runs, user provisioning and password resets, which exceed what ATI does, and Kevin's 8/25 mail narrowed it to after-hours answering plus CW integration. The 9/3 session is the best moment to nail that down — the meeting is named \"Next Ticket x Intake Configuration\", so somebody should establish first which product it actually configures and how much of it is ATI."
  },
  {
   "track": "prospect",
   "name": "Keeran Networks",
   "contact": "Richard Kephart（运营负责人）· Patrick（NOC，待拉入） — CSM: Leonard",
   "cadence": "无 ATI 固定周期 · 8/27 续约 + AI roadmap 合并会上首次浮现 · 测试环境待排期，无日期",
   "cadence_en": "No ATI cadence yet · surfaced on the combined 8/27 renewal + AI-roadmap call · a test environment is to be scheduled, no date set",
   "status": "温",
   "pipeline_key": "Keeran Networks",
   "ticket_keys": [],
   "email_domain": "keeran.ca",
   "stage": "interest",
   "stage_evidence": "本轮（2026-08-29）新建条目，定档 15%（interest：诉求已提出或已看过介绍，但没有任何配置）。依据是逐字读过的原件：Leonard Narvaza 2026-08-27 17:20 的会后 recap 邮件（emails/keeran.ca/2026-08-27_Recap - AI Roadmap & Renewal Right-Sizing (AI Phonetic after-hours eval).md，正文已读，Glenn 在收件人里）。三处直接证据：① 触发点是他们的 OpsGenie 要停用 —— \"OpsGenie is sunsetting on your end; we discussed AI Ticket Intake as a potential after-hours replacement with on-call rotation and alerting.\"；② 会上写进 Decisions 的一条是 \"Plan to migrate off OpsGenie toward AI Phonetic for after-hours alerting and on-call rotation.\"；③ 我方待办写明 \"@Glenn Bugtong: Share AI Ticket Intake details (caller ID match, L1 skills, ticket creation, summaries, sentiment; supports weekly rotation and Teams/email alerts; no SMS yet) and set up a test environment. No date set.\" 为什么不到 35%：阶梯里 35% 要 intake app 已配置、号码已开通，而这里连测试环境都还没排期（\"No date set\"），客户侧还要先把 Patrick（NOC）拉进来做迁移调研。为什么值得单列而不是留在 open_questions：这是一家现有 MSPbots 客户由自己的 after-hours 缺口主动提出的诉求，且已经写进会议决议，不是我方外呼。两个要注意的前提：一是它挂在续约上 —— 同一场会的主线是从 Pro bundle（18 人 / $14,798 年）降到 BI-only（约 $5K 年），ATI 的任何动作都在续约谈定之后；二是 SMS —— recap 的 Open Questions 第一条就是 \"SMS support for AI Ticket Intake (currently Teams/email only). @Glenn Bugtong\"，而 SMS 至今未做，是 Unity IT 停测的三个卡点之一。本档需要人复核：这是新建条目的首次定档。",
   "stage_evidence_en": "New entry this run (2026-08-29), placed at 15% (interest: a need raised or an overview seen, nothing configured). The basis is a source read verbatim: Leonard Narvaza's post-meeting recap email of 2026-08-27 17:20 (emails/keeran.ca/2026-08-27_Recap - AI Roadmap & Renewal Right-Sizing (AI Phonetic after-hours eval).md; body read, Glenn on the To line). Three direct pieces of evidence. (1) The trigger is their OpsGenie going away — \"OpsGenie is sunsetting on your end; we discussed AI Ticket Intake as a potential after-hours replacement with on-call rotation and alerting.\" (2) One of the recorded Decisions is \"Plan to migrate off OpsGenie toward AI Phonetic for after-hours alerting and on-call rotation.\" (3) Our own next step reads \"@Glenn Bugtong: Share AI Ticket Intake details (caller ID match, L1 skills, ticket creation, summaries, sentiment; supports weekly rotation and Teams/email alerts; no SMS yet) and set up a test environment. No date set.\" Why not 35%: that rung requires the intake app configured and a number provisioned, and here even the test environment is unscheduled (\"No date set\"), with the client still to loop in Patrick (NOC) for the migration discovery. Why it earns its own row rather than sitting in open_questions: this is an existing MSPbots client raising an after-hours gap in their own words, written into the meeting's decisions — it is not one of our outbound pushes. Two conditions to keep in view. First, it is gated on the renewal: the main thread of that same call is dropping from the Pro bundle (18 users, $14,798/yr) to BI-only (~$5K/yr), and anything on ATI comes after that lands. Second, SMS: the first line of the recap's Open Questions is \"SMS support for AI Ticket Intake (currently Teams/email only). @Glenn Bugtong\" — SMS is still unbuilt and is one of the three blockers that stopped Unity IT testing. This rung needs a human check: it is the first assignment for a newly created entry.",
   "ticket_match": [
    "keeran"
   ],
   "next_action": "① 先把续约做完再谈 ATI：recap 里 Leonard 的待办标了 \"Today — urgent to prevent the old $14,798 annual charge from hitting\"，在 BI-only 报价发出去之前推 ATI 会显得我们在加价。② 续约一落地，Glenn 有两件写死在 recap 里的事：把 ATI 的能力清单发给 Richard，并把测试环境搭起来（目前 \"No date set\"，请先给一个日期）；同时请 Richard 把 Patrick（NOC）拉进来做 after-hours 迁移调研 —— 真正决定这家能不能用起来的是 Patrick，不是 Richard。③ SMS 要提前讲清楚，别等到测试里被发现：Richard 已经问了，recap 的 Open Questions 第一条就是它，而 SMS 至今未做。Unity IT 就是卡在这里停测的（AST-21144 依赖 SMS，AST-20757 是它的 go-live blocker），同样的坑不要再踩一次 —— 现在就告诉他 Teams/邮件是当前能力、SMS 没有时间表，让他自己判断够不够替掉 OpsGenie。④ 这家目前 ClickUp 上没有任何 ATI 工单，所以看板上工单区是空的；测试真的开起来之后记得建单，否则这条线在「工单」维度上是隐形的。",
   "next_action_en": "(1) Close the renewal before pushing ATI: Leonard's action in the recap is flagged \"Today — urgent to prevent the old $14,798 annual charge from hitting\", and pitching ATI before the BI-only quote goes out reads as us adding cost back. (2) Once the renewal lands, Glenn has two items written into the recap: send Richard the ATI capability rundown, and stand up the test environment (currently \"No date set\" — put a date on it); and ask Richard to loop in Patrick (NOC) for the after-hours migration discovery, since Patrick, not Richard, is who decides whether this gets used. (3) Say the SMS position out loud now rather than letting testing discover it: Richard already asked, it is the first line of the recap's Open Questions, and SMS is still unbuilt. Unity IT stopped testing over exactly this (AST-21144 depends on SMS; AST-20757 is their go-live blocker) — do not repeat it. Tell him plainly that Teams/email is what exists today and SMS has no date, and let him judge whether that is enough to replace OpsGenie. (4) There are no ATI tickets for this client in ClickUp today, so the ticket area on the board is empty; once testing actually starts, file tickets, or this thread stays invisible on the ticket dimension.",
   "events": [
    {
     "date": "2026-08-27",
     "time": "—",
     "state": "held",
     "title": "Keeran Networks | MSPbots — AI Roadmap & Renewal Right-Sizing (ATI / \"AI Phonetic\" raised as the OpsGenie replacement)",
     "fathom": "https://fathom.video/calls/799619942",
     "transcript": "meetings/Keeran Networks/2026-08-27-Keeran-Networks-MSPbots-AI-Roadmap-Discovery.md",
     "note": "本次新增，也是这家在本看板上的第一场。口径注意：这不是 ATI 专场，主线是续约降配（Pro bundle → BI-only），ATI 只是会上评估的几个 alpha 工具之一，出席的是 Leonard Narvaza（CSM）与 Glenn。判为「已开」的依据是会后 recap 邮件原件（emails/keeran.ca/2026-08-27_...，正文已读）而不是二手摘要；仓库纪要 meetings/Keeran Networks/2026-08-27-... 是基于 Fathom AI summary 写的，只作补充。触发 ATI 的是 OpsGenie 停用，recap 的 Decisions 写着 \"Plan to migrate off OpsGenie toward AI Phonetic for after-hours alerting and on-call rotation.\" 定档 15%，见 stage_evidence。",
     "note_en": "New this run, and this client's first session on the board. A framing note: it is not an ATI-only session — the main thread is the renewal downgrade (Pro bundle → BI-only) and ATI is one of several alpha tools evaluated on the call, with Leonard Narvaza (CSM) and Glenn attending. Recording it as held rests on the recap email itself (emails/keeran.ca/2026-08-27_..., body read), not on a second-hand summary; the repo note at meetings/Keeran Networks/2026-08-27-... is written off the Fathom AI summary and is supporting material only. What put ATI on the table is OpsGenie being retired, and the recap's Decisions read \"Plan to migrate off OpsGenie toward AI Phonetic for after-hours alerting and on-call rotation.\" Placed at 15%; see stage_evidence."
    }
   ]
  },
  {
   "track": "prospect",
   "name": "Converged Medical Solutions",
   "contact": "— CSM: Leonard",
   "cadence": "月度例会 · 5/13 demo 后冷却",
   "status": "冷",
   "events": [
    {
     "date": "2026-05-13",
     "time": "—",
     "state": "held",
     "title": "Converged Medical Solutions — Ticket Intake",
     "transcript": "meetings/Converged Medical Solutions/2026-05-13-Converged_Medical_Solutions-Ticket_Intake.md"
    },
    {
     "date": "2026-05-27",
     "time": "—",
     "state": "held",
     "title": "CMSG — Leonard Check-in",
     "fathom": "https://fathom.video/calls/686819495",
     "transcript": "meetings/Converged Medical Solutions/2026-05-27-CMSG_Leonard_Checkin.md",
     "note": "记为 \"existing ATI prospect,demo'd May 13,said potentially round two\"。此后 6–7 月共 8 场例会全部围绕 AI Triage / NextTicket,ATI 再未被提起。",
     "note_en": "Logged as \"existing ATI prospect, demo'd May 13, said potentially round two\". All 8 monthlies across June–July since then covered AI Triage / NextTicket; ATI never came up again."
    }
   ],
   "pipeline_key": "Converged Medical Solutions (CMSG)",
   "ticket_keys": [
    "Converged Medical Solutions (CMSG)"
   ],
   "email_domain": "cmsg.com.au",
   "stage": "interest",
   "stage_evidence": "5/13 做过 Ticket Intake 场次，5/27 记为「existing ATI prospect，potentially round two」。此后 6–7 月 8 场例会全部围绕 AI Triage / NextTicket，ATI 再未被提起。",
   "cadence_en": "Monthly · cooled after the 5/13 demo",
   "stage_evidence_en": "Ran a Ticket Intake session on 5/13 and was logged on 5/27 as an \"existing ATI prospect, potentially round two\". Since then all 8 monthly meetings across June–July were about AI Triage / NextTicket; ATI never came up again.",
   "ticket_match": [
    "cmsg",
    "converged medical"
   ],
   "next_action": "【8/20 新增】2026-08-19 20:55 UTC Aaron Ver（Product Onboarding Specialist）发信 \"Let's get you set up with AI Intake — quick 2-week trial\"，收件人 paul@cmsg.com.au，Glenn 与 Grace 在 Cc，原件已读。正文承诺 \"full access to AI Intake for a 2-week testing window at no cost, so your team can see it handling real tickets before deciding whether it's worth adding to your plan.\"，并要 20–30 分钟做 demo 加环境配置，附自助预约链接。这是 5/13 之后 ATI 第一次重新对这家开口（中间 8 场例会全在聊 AI Triage / NextTicket），信里 \"Thanks for raising your hand for AI Intake\" 这句需要有人确认：Paul 到底在哪一次会上重新举了手？ 档位不动，仍为 15%：邮件承诺的是「将会开通」，不是「已经开通」—— 阶梯的 35% 要 intake app 配好、号码发出。动作：盯客户是否回信；一旦真的开了试用并发了号码，这家就该升到 35%，请把开通凭证（试用记录或号码）留在工单里。",
   "next_action_en": "[Added 8/20] On 2026-08-19 at 20:55 UTC Aaron Ver (Product Onboarding Specialist) sent \"Let's get you set up with AI Intake — quick 2-week trial\" to paul@cmsg.com.au, with Glenn and Grace on Cc; the original was read this run. It promises \"full access to AI Intake for a 2-week testing window at no cost, so your team can see it handling real tickets before deciding whether it's worth adding to your plan\", asks for 20–30 minutes for a demo plus environment configuration, and includes a self-booking link. This is the first ATI approach to this client since 5/13 (the eight monthlies in between were all AI Triage / NextTicket). Someone should verify the line \"Thanks for raising your hand for AI Intake\" — where exactly did Paul raise his hand again? The rung is unchanged at 15%: the email promises provisioning, it is not evidence of it — the 35% rung needs the intake app configured and a number issued. Action: watch for a reply; the moment a trial is actually turned on and a number issued, this client moves to 35%, so keep the provisioning record (trial or number) on the ticket."
  },
  {
   "track": "prospect",
   "name": "Parachute Techs",
   "contact": "—",
   "cadence": "7/9 一次性 demo",
   "status": "已流失",
   "events": [
    {
     "date": "2026-07-09",
     "time": "—",
     "state": "held",
     "title": "AI Ticket Intake Demo w/ Parachutetechs.com",
     "fathom": "https://fathom.video/calls/741358415",
     "note": "demo 后无任何后续会议或邮件",
     "note_en": "No follow-up meeting or email after the demo"
    }
   ],
   "pipeline_key": null,
   "ticket_keys": [
    "Parachutetechs.com"
   ],
   "email_domain": "parachutetechs.com",
   "stage": "lost",
   "stage_evidence": "8/3 在收到 paywall 上线通知后明确拒绝。Steve Zelmer：\"We have decided to utilize our internal tools to step into AI Triage.\" 属自建 vs 采购的取舍，非产品质量拒绝。值得注意的是流失前参与很深：10 张工单、8 条 enhancement（多号码多规则集、垃圾来电模式识别、3CX/Roost/TimeZest 集成、语音信箱转工单备注、Teams/邮件通知技术员、Skill Studio 变量追踪面板、来电时查已有工单避免重复），另有一个响应延迟过长的 bug。",
   "lost_reason": "选择用内部工具自建 AI Triage，非产品质量拒绝。7/30 的重连触达已石沉大海。",
   "next_action": "标记为不再跟进。（8/23 复核：Fathom 上 8/18 有一场 Glenn 录的 \"Parachute Technology | Monthly Meeting - Steve Zelmer\"，本轮读了摘要全文 —— 整场谈的是 AI token 告警阈值配错（按 2,000 credit 报警、实际额度 3,000）、NextTicket 部署因负责人离职停摆，以及 SOP Agent 的 demo 与「电脑装机」试点，ATI 一次都没有被提起。所以客户关系还在、还在买别的东西，但 8/3 那封 ATI 拒绝没有被推翻，档位不动。同日另一场 \"MSPbots Product Demo with Glenn\"（Billy Dodier / Martin Rodrigue）也读了摘要，同样通篇是 SOP Agent，与 ATI 以及本看板任何客户都无关 —— 记在这里，免得下一轮把这两段录像误当成 ATI 证据。）",
   "rejection": {
    "channel": "email",
    "date": "2026-08-03",
    "who": "Steve Zelmer（Director of Service Desk）",
    "quote": "We have decided to utilize our internal tools to step into AI Triage.",
    "ref": "emails/parachutetechs.com/2026-08-03_Re-AI-Ticket-Intake-Paywall-up-DECLINED.md（回复 paywall 上线通知）",
    "who_en": "Steve Zelmer (Director of Service Desk)",
    "ref_en": "emails/parachutetechs.com/2026-08-03_Re-AI-Ticket-Intake-Paywall-up-DECLINED.md (reply to the paywall-live notification)"
   },
   "cadence_en": "One-off demo 7/9",
   "stage_evidence_en": "Declined on 8/3 in reply to the paywall-live notification. Steve Zelmer: \"We have decided to utilize our internal tools to step into AI Triage.\" A build-vs-buy decision, not a product-quality rejection. Worth noting how deeply they engaged first: 10 tickets, 8 of them enhancements (multiple bots/numbers per tenant, pattern-based spam detection, 3CX/Roost/TimeZest integrations, voicemail-to-ticket-note, Teams/email technician notification, Skill Studio variable trace panel, existing-ticket lookup on inbound call) plus a response-latency bug.",
   "lost_reason_en": "Chose to build AI Triage with internal tools. Not a product-quality rejection; a 7/30 re-engagement ping had already gone unanswered.",
   "next_action_en": "Mark as not pursuing. (Re-checked 8/23: Fathom carries a \"Parachute Technology | Monthly Meeting - Steve Zelmer\" on 8/18 recorded by Glenn, and its summary was read in full this run — the entire call is about a misconfigured AI-token alert threshold (alerting at 2,000 credits against a 3,000-credit capacity), a NextTicket deployment stalled after the lead who configured it left, and a SOP Agent demo plus a computer-setup pilot. ATI never comes up once. The relationship is therefore still alive and still buying other things, but nothing overturns the 8/3 ATI rejection, so the rung does not move. The other 8/18 session, \"MSPbots Product Demo with Glenn\" (Billy Dodier / Martin Rodrigue), was read too and is likewise SOP Agent throughout — unrelated to ATI and to every client on this board. Noted here so a later run does not mistake either recording for ATI evidence.)",
   "ticket_match": [
    "parachute"
   ]
  },
  {
   "track": "prospect",
   "name": "Capstone Works",
   "contact": "Chuck Adams · Cindy Adams — CSM: Kristine",
   "cadence": "8/11 onboarding 会上顺带做了 ATI demo · 当场拒绝",
   "cadence_en": "ATI demo folded into the 8/11 onboarding call · declined on the call",
   "status": "已流失",
   "events": [
    {
     "date": "2026-08-11",
     "time": "—",
     "state": "held",
     "title": "MSPbots Product Demo with Glenn",
     "fathom": "https://fathom.video/calls/778774350",
     "note": "Kristine 组织的 onboarding/介绍会，Glenn 与 Aaron 在场。会上 Glenn 已把 AI Ticket Intake 装进他们账号、分配了号码、开了 14 天试用；Chuck 当场用手机打了测试电话（因 API 权限不足没建出工单），随后明确拒绝。",
     "note_en": "An onboarding/introduction call organised by Kristine with Glenn and Aaron present. Glenn had already installed AI Ticket Intake on their account, provisioned a number and started a 14-day trial; Chuck placed a live test call from his mobile during the meeting (no ticket was created — the API permission was insufficient) and then declined outright."
    }
   ],
   "pipeline_key": null,
   "ticket_keys": [
    "capstoneworks.com"
   ],
   "ticket_match": [
    "capstone"
   ],
   "email_domain": null,
   "stage": "lost",
   "stage_evidence": "本次新增并直接判 0%。2026-08-11 的 demo 上（Fathom 778774350，Grace 在参会人里，transcript 已逐字读过）Capstone Works 在同一通电话里完成了评估并拒绝。决定性的是建单时机：Glenn 确认「工单在通话结束后才创建」，Chuck Adams 当场回 \"So that takes the usefulness of this application to near zero. When the phone rings for the tech, what the person just said to the AI, they're going to have to say to the human.\"；Glenn 追问这是不是 deal breaker，Cindy Adams 答 \"That's a huge deal breaker.\"，Chuck 接 \"we can't use this.\"。另有两项硬缺口：① 不能把高价值客户的来电直接透传给真人（Chuck 要的是 AI 接主号、识别出 top-tier 客户后转到另一个号码），Glenn 当场答不确定；② 不能与他们在用的 AlertOps on-call 系统集成，Glenn 明确说 \"In terms of integration, we don't have yet that in place.\"。Chuck 还实测了一通电话，故意用非直白的说法描述 Exchange 故障，AI 反复答 \"I can only help with IT\"，且因 API 权限不足没能建单。工单侧只有 1 张 capstoneworks.com 的 onboarding 占位单（AST 未开始）。",
   "stage_evidence_en": "Added this run and placed straight at 0%. On the 2026-08-11 demo (Fathom 778774350; Grace is on the invitee list and the transcript was read verbatim) Capstone Works evaluated and rejected ATI inside a single call. The decisive issue was ticket timing: Glenn confirmed the ticket is only created after the call ends, and Chuck Adams replied \"So that takes the usefulness of this application to near zero. When the phone rings for the tech, what the person just said to the AI, they're going to have to say to the human.\" Glenn asked whether that was the deal breaker; Cindy Adams answered \"That's a huge deal breaker.\" and Chuck added \"we can't use this.\" Two further hard gaps: (1) there is no pass-through that routes a high-value client straight to a human — Chuck wants the AI to answer the main number and forward recognised top-tier callers to a separate number, and Glenn could not confirm it works; (2) no integration with AlertOps, the on-call system they already run — Glenn's words were \"In terms of integration, we don't have yet that in place.\" Chuck also placed a live test call, describing an Exchange outage in deliberately non-literal terms; the AI kept replying \"I can only help with IT\" and failed to create a ticket at all because the API permission was insufficient. On the ticket side they have only the capstoneworks.com onboarding placeholder, not started.",
   "lost_reason": "产品能力不匹配，不是价格问题 —— 全程没有出现任何定价异议。三条硬缺口：工单在通话结束后才建（技术员接起转接时手上没有工单，客户要重复讲一遍）、没有把高价值客户透传给真人的通道、不能与 AlertOps 集成。Cindy 的总结是 \"probably not the right time for this product for us\"，Chuck 补了一句他们的定位是 \"friendly, proactive, worry-free\"、强调人的关系。门没关死：Chuck 说过 \"I have spoken with AIs that are very good at understanding whatever comes out of my mouth... I don't think this one is there yet.\" —— 是「还不到」而不是「不要」。",
   "lost_reason_en": "A capability mismatch, not a price objection — pricing never came up as a concern. Three hard gaps: the ticket is only created after the call ends (so the technician picks up a transfer with nothing in front of them and the caller has to repeat everything), there is no pass-through to send high-value clients straight to a human, and there is no AlertOps integration. Cindy's summary was \"probably not the right time for this product for us\", and Chuck framed their positioning as \"friendly, proactive, worry-free\" with the human relationship at the centre. The door is not shut: Chuck said \"I have spoken with AIs that are very good at understanding whatever comes out of my mouth... I don't think this one is there yet\" — not yet, rather than never.",
   "rejection": {
    "channel": "meeting",
    "date": "2026-08-11",
    "who": "Cindy Adams · Chuck Adams（Capstone Works）",
    "who_en": "Cindy Adams · Chuck Adams (Capstone Works)",
    "quote": "I think the last thing that we want to do is even our lower value clients frustrate anybody. And they're used to calling, talking to a human. So probably not the right time for this product for us.",
    "ref": "Fathom 778774350（\"MSPbots Product Demo with Glenn\"，2026-08-11，参会人 Chuck Adams、Cindy Adams、Glenn Bugtong、Kristine Gadayan、Aaron Ver、Grace Guo）· transcript 已逐字读过，上述原话出自 [33:40] 段；同一通电话 [29:01] 处 Glenn 问 \"with that feature, that's our one deal breaker for you, Chuck, Cindy?\"，Cindy 答 \"That's a huge deal breaker.\"。仓库里没有 emails/capstoneworks.com 目录，也没有对应的拒绝邮件 —— 唯一的书面痕迹是 8/11 内部 Teams 上「I just had a call with Client capstoneworks.com - can you remove their number」，按口径 Teams 不作为证据，只作旁证。",
    "ref_en": "Fathom 778774350 (\"MSPbots Product Demo with Glenn\", 2026-08-11; attendees Chuck Adams, Cindy Adams, Glenn Bugtong, Kristine Gadayan, Aaron Ver, Grace Guo) · transcript read verbatim, the quote above is from the [33:40] segment. Earlier in the same call, at [29:01], Glenn asked \"with that feature, that's our one deal breaker for you, Chuck, Cindy?\" and Cindy answered \"That's a huge deal breaker.\" There is no emails/capstoneworks.com folder in the repo and no decline email; the only written trace is an internal Teams note on 8/11 — \"I just had a call with Client capstoneworks.com - can you remove their number\" — which is corroboration only, since Teams is not admissible evidence on this board."
   },
   "next_action": "①（本次更新）8/12 的 onboarding kickoff 如期开了（Fathom 781049069，Kristine 组织，Chuck 与 Cindy Adams 出席）—— 账号确实留住了，走的是 BrightGauge 迁移那条线，跟 ATI 无关。这家是正在 onboarding 的付费客户，ATI 走了不代表账号走了 —— 回访由 Kristine 走 CSM 线，别当成 ATI 商机再推一次。② 三条缺口里有两条是跨客户的产品缺口，不是 Capstone 定制：转接前建单（Titanium 的 AST-20803 / AST-20757 同一件事）和高价值客户透传。做完之后这家有明确的重连由头。③ Chuck 当场问的 API 权限问题要给答复：测试通话因权限不足没建出工单，Glenn 答应「forward you the security」，别漏。④ 8/11 内部已提出回收他们的号码，确认是否已执行。",
   "next_action_en": "(1) (updated this run) The 8/12 onboarding kickoff went ahead as planned (Fathom 781049069, organised by Kristine, with Chuck and Cindy Adams present) — the account really was kept, running on the BrightGauge migration track and unrelated to ATI. They are a paying client mid-onboarding — losing ATI is not losing the account, so any re-approach should run through Kristine on the CSM line rather than being pushed again as an ATI opportunity. (2) Two of the three gaps are cross-client product gaps rather than Capstone customisations: creating the ticket before the transfer (the same thing as Titanium's AST-20803 / AST-20757) and pass-through for high-value callers. Shipping those gives a concrete reconnection hook. (3) Answer the API-permission question Chuck raised on the call — the test call failed to create a ticket because the permission was insufficient and Glenn promised to \"forward you the security\"; do not let that drop. (4) Decommissioning their number was raised internally on 8/11 — confirm whether it actually happened."
  }
 ],
 "roleActions": [
  {
   "role": "Glenn",
   "subtitle": "Client-facing manager · 对客推进与回告",
   "items": [
    {
     "pri": "急",
     "pri_en": "Urgent",
     "title": "CIO Landing —— 8/28 那个检查点你自己取消了，周会系列现在断了",
     "title_en": "CIO Landing — you cancelled the 8/28 checkpoint yourself, and the weekly series is now broken",
     "why": "8/24 18:17 UTC 你主动提出改期，原话 \"I don't have any substantial updates to share yet since the team is still finalizing the work\"；Ignacio 18:27 UTC 书面同意，18:31 UTC 你发出新邀请，8/28 20:15 已在日历。问题不在改期本身，在于你 8/20 已经把四个日期给了客户：Caller-ID Aug-24、Smarter Escalation Aug-25、ConnectWise 格式 Aug-26、工单号验证 Aug-27 —— 现在四个日期全部落在两次会议之间。8/25 复查 ClickUp 的真实状态：AST-21421（86e2r5fn3）已进 for qa；86e2r5fha 仍 in development，due 就是今天；AST-21493（86e2u6nzw）的 due 被从 8/24 推到 8/27；AST-21420（86e2r5f6g）自身仍是 new；最痛的 AST-21492（86e2u6nzp，工单号不念给来电者）自身还是 new，本轮复查它另外两个 link 目标 AST-20804（Closed）与 AST-21418（new）都没动，载体仍是 for qa 的 AST-18104。也就是说承诺 Aug-24 的那一项今天没有一张自己的单是完成态，而客户下一次听到消息要等到 8/28。　【8/28 更新，这条的前提变了】8/27 14:05–14:06 UTC 你以 PTO 为由连发两封取消信，8/28 与 8/31 两场都没了；复查日历确认周一 20:15 那条 recurring series 在 9/20 之前没有任何后续场次。唯一还在的是 9/3 15:15 那一场，而它的 organizer 是 support@ciolanding.com —— 客户从自己的预约页约的，不是你补发的。结果是：8/20 给客户的那四个交付日期、8/26 你自己问的 deal-breaker 问题、German 的 50 通复测结果，全部压到 9/3，这家 55% 的客户到那天已经三周没有面对面。",
     "why_en": "At 18:17 UTC on 8/24 you asked to reschedule, in your words \"I don't have any substantial updates to share yet since the team is still finalizing the work\"; Ignacio agreed in writing at 18:27 UTC, you sent the replacement invite at 18:31 UTC, and 8/28 20:15 is on the calendar. The problem is not the reschedule but that you had already given the client four dates on 8/20 — Caller-ID Aug-24, Smarter Escalation Aug-25, ConnectWise format Aug-26, ticket-number verification Aug-27 — and all four now fall between two meetings. Where ClickUp actually stands on 8/25: AST-21421 (86e2r5fn3) has reached for qa; 86e2r5fha is still in development with today as its due date; AST-21493 (86e2u6nzw) has had its due date moved from 8/24 to 8/27; AST-21420 (86e2r5f6g) is itself still new; and the sharpest one, AST-21492 (86e2u6nzp, the ticket number never read back to the caller), is still new — its other two link targets were re-checked this run, AST-20804 (Closed) and AST-21418 (new), both unchanged, so its vehicle is still AST-18104 at for qa. Nothing promised for Aug-24 is complete on a ticket of its own today, and the client will not hear anything until 8/28.  [8/28 update — this item's premise has changed] At 14:05–14:06 UTC on 8/27 you sent two cancellations citing PTO, and both 8/28 and 8/31 are gone; re-checking the calendar confirms the Monday-20:15 recurring series has no further occurrence before 9/20. The only session left is 9/3 15:15, and it is organised by support@ciolanding.com — the client booked it from their own page; you did not reissue it. The result: the four delivery dates you gave the client on 8/20, the deal-breaker question you asked yourself on 8/26, and German's 50-call re-test results all slip to 9/3, by which point this 55% client will have gone three weeks without a live session.",
     "do": "今天就把 Aug-24 与 Aug-25 两项的真实状态发给客户（哪怕是「延到 X 日」），别让改期变成四天静默；8/28 那场按四项逐条对账；同时给 AST-21492 一张自己的日期，别让 Aug-27 的承诺靠一张 new 单兑现。　【8/28 追加】今天做两件事：① 决定周会系列是补建还是改为按次预约，并把决定告诉客户 —— 不要让 9/3 之后又是空白；② 那四项交付与 deal-breaker 问题不必等到 9/3，今天就能用邮件问掉，尤其是 AST-21421 的 transcript 形态。",
     "do_en": "Send the client the real status of the Aug-24 and Aug-25 items today — even if it is \"slipping to X\" — so the reschedule does not become four silent days; reconcile all four item by item on 8/28; and give AST-21492 a date of its own rather than resting the Aug-27 promise on a ticket that is still new.  [8/28 addition] Two things today: (1) decide whether to rebuild the weekly series or move to per-session booking, and tell the client which — do not let the calendar go blank again after 9/3; (2) the four delivered items and the deal-breaker question do not need to wait for 9/3 — they can be settled by email today, especially the transcript shape on AST-21421."
    },
    {
     "pri": "急",
     "pri_en": "Urgent",
     "title": "Mainstream —— Tim 8/24 已经选了方案，AST-21625 却仍然 new、无人、无日期",
     "title_en": "Mainstream — Tim picked an option on 8/24, yet AST-21625 is still new with no owner and no date",
     "why": "8/20 09:11–09:12 UTC 你建了四张：AST-21626（升级审计，in development，Vow Meng，due 8/26）、AST-21627（distribution list 通知，in development，Vow Meng，due 8/26）、AST-21625（通话时长告警，new，无人无日期）、AST-21628（语音抢话/延迟，new，你自己负责）。同日 16:43 UTC 你把时长告警的三个终止选项发给了 Tim。本轮的新证据是他回了：2026-08-24 13:53 UTC，原话 \"That is fantastic, thank you. I’d lean towards Option A or Option C versus having it automatically terminate the call.\" —— 要 A（仪表盘标记）或 C（人工挂断按钮），不要 B（AI 自动挂断），计时器与 7 分钟默认阈值没有异议。上一轮把「等 Tim 选」列为 21625 停在 new 的理由，这个理由已经不存在了，而 8/25 复查该单仍是 new。AST-21628 也仍是 new —— 那是 Tim 亲口说的唯一 potential deal breaker。",
     "why_en": "At 09:11–09:12 UTC on 8/20 you created four tickets: AST-21626 (escalation audit, in development, Vow Meng, due 8/26), AST-21627 (distribution-list notification, in development, Vow Meng, due 8/26), AST-21625 (call-duration alert, new, no owner, no date) and AST-21628 (barge-in / latency, new, owned by you). At 16:43 UTC the same day you sent Tim the three termination options for the duration alert. The new evidence this run is that he answered: at 13:53 UTC on 2026-08-24, \"That is fantastic, thank you. I’d lean towards Option A or Option C versus having it automatically terminate the call.\" — A (flag on the dashboard) or C (manual disconnect button), not B (the AI hanging up itself), with no objection to the timer or the 7-minute default. Last run \"waiting on Tim to choose\" was the stated reason 21625 sat at new; that reason is gone, and on 8/25 the ticket is still new. AST-21628 is still new too — and that is the one thing Tim named as a potential deal breaker.",
     "do": "把 Tim 的原话贴进 AST-21625 的描述，指定负责人与 due date（A 与 C 都是纯 UI/可见性，不必等 B 的争论）；给 AST-21628 一个日期；回信告诉 Tim 你按 A+C 落单了，让他知道这封信起了作用。",
     "do_en": "Paste Tim's words into AST-21625, assign an owner and a due date (A and C are both pure UI/visibility work and need not wait on the B debate); put a date on AST-21628; and reply to Tim confirming you have written it up as A+C, so he sees his mail landed."
    },
    {
     "pri": "急",
     "pri_en": "Urgent",
     "title": "EstesGroup 可能已经成交 —— 但看板不能靠内部 Teams 入账，今天补一份凭证",
     "title_en": "EstesGroup may already be closed — but the board cannot book it on an internal Teams post; produce a record today",
     "why": "8/12 16:07 UTC Bill McCord 回信 \"Approvals are in place, is there any contract work to do here?\"，你 17:06 UTC 回复不用签新合同、只要到 MarketPlace 选一个 AI Credit Subscription 套餐即可生效，并拉进了 Anushree。8/13 02:30 UTC 的 Product-Platform L10 上暴露了一个更要紧的问题：你早先发出的是 $199/月含 200 分钟的旧口径，而实际计费是 6 credits/分钟，$199/1,000 credits 只有约 166 分钟，Bill 因此被搞糊涂 —— 你在会上的原话是 \"I was not able to update this client\"，Daniel 的评价是 \"this kind of stuff kills the deals.\"。会上定的解法是做一个不公开的 $1.99 / 1,200 credits 套餐、等客户确认后在后台开通。同日 10:56 UTC 你在内部 Teams 宣布 EstesGrp.com 成为 ATI 第一个付费客户 —— 如果属实这是项目里程碑，但按看板口径 Teams 不作为证据，ClickUp 和 Outlook 里也查不到订阅或账单，所以看板仍记 90%。另外 7/30 提到的 \"a couple of negative points\" 至今仍然一条都没有落成工单。",
     "why_en": "At 16:07 UTC on 8/12 Bill McCord replied \"Approvals are in place, is there any contract work to do here?\", and you answered at 17:06 UTC that no new contract is needed — only picking an AI Credit Subscription plan in the Marketplace — and looped in Anushree. The Product-Platform L10 of 8/13 02:30 UTC then exposed something more serious: the quote you had sent was the old $199-for-200-minutes model while billing is actually 6 credits per minute, so $199 for 1,000 credits is about 166 minutes, and Bill was left confused. Your own words on the call: \"I was not able to update this client\"; Daniel's: \"this kind of stuff kills the deals.\" The agreed fix is an unlisted $1.99 / 1,200-credit plan activated on the backend once the client confirms. At 10:56 UTC the same day you announced on the internal Teams channel that EstesGrp.com is ATI's first paying customer — a project milestone if true, but Teams is not admissible here and no subscription or invoice appears in ClickUp or Outlook, so the board still reads 90%. Separately, the \"couple of negative points\" from 7/30 still have no ticket between them.",
     "do": "① 今天就把付费凭证补给 Grace：MarketPlace 的订阅记录、Accounting 的账单，或 Bill 书面确认，任意一份即可 —— 拿到当天看板改 100%，这是 ATI 的第一单，值得被正确记账。② 试用 8/17 到期。若订阅还没生效，今天先延期，别让「已经宣布成交」和「试用断档」在同一周发生。③ 不公开的 $1.99 / 1,200 credits 套餐要在后台落地并留下书面记录，口头特价到续费时会变成争议。④ 报价口径的错要主动扩散修正 —— ACTS360 手里还拿着 $399/月约 500 分钟的旧版，别等他们自己算出来。⑤ 追那两条 negative points，落成工单再回告；这家马上要把现有答录服务换掉，上线前必须知道是什么。⑥ 他问的「转人时打技术热线」先确认是配置还是要开单，能配就当场配掉。",
     "do_en": "1. Get the payment record to Grace today: the Marketplace subscription, an invoice from Accounting, or Bill's written confirmation — any one will do, and the board goes to 100% the day it lands. This is ATI's first sale and deserves to be booked properly. 2. The trial expires on 8/17. If the subscription is not yet live, extend it today so \"we announced the win\" and \"the trial lapsed\" do not land in the same week. 3. Create the unlisted $1.99 / 1,200-credit plan on the backend and write it down — a verbal special becomes an argument at renewal. 4. Push the quote correction out proactively: ACTS360 is still holding the old $399-for-~500-minutes version, so do not wait for them to do the arithmetic themselves. 5. Chase the two negative points, log them and report back — they are about to replace their answering service with us. 6. On his tech-hotline handoff question, establish whether it is configuration or a ticket; if configuration, just do it."
    },
    {
     "pri": "急",
     "pri_en": "Urgent",
     "title": "Metro Sales：只剩一个 bug 就付费，而 8/20 的周会查不出来开没开",
     "title_en": "Metro Sales: one bug from paying — and nobody can establish whether the 8/20 weekly happened",
     "why": "8/20 14:30 那场周会：邀请在你日历上、没取消，但 Fathom 查不到、meetings/ 里没纪要、会后没有纪要邮件；当天唯一的动作是会前 47 分钟那封「I've re-enabled your 14-day AI Trial」（也说明试用此前已经断过一次），而 8/27、9/3 仍然没有邀请。请今天回答两件事：那场会开了吗；周会是有意停还是漏发。转接 bug 的口径不变 —— 它和杀死 Valeo 的 AST-20255 是同一个失败类别，要一次修两家。8/13 的周会开成了，客户方 Dan Olsen、David Ulbrich、James Eubanks 三人全到，是 6/18 以来第一次（Fathom 781050095）。会上定位了根因：AI 把 Metro Sales 的 Zoom auto attendant 当成语音信箱，接通瞬间就挂断，Zoom 侧录音显示 AI 在 0:00 秒断开，技术员根本来不及按 1。你当天 17:15 UTC 的纪要邮件写的是 \"We confirmed that this is the final blocker before moving forward with the paid plan.\" —— 你自己把它写成了付费转化的唯一前置条件。而这与 Valeo 的 AST-20255（转接遇 auto attendant 被误判为语音信箱）是同一个失败类别，那张单自 6 月起一直挂在 in development。Valeo 已经因为转接问题走了。",
     "why_en": "The 14:30 weekly on 8/20: the invite is on your calendar and was not cancelled, but Fathom has nothing, meetings/ has no note, and no summary email followed. The only action that day was the email 47 minutes beforehand — \"I've re-enabled your 14-day AI Trial\", which also tells us the trial had lapsed once — and 8/27 and 9/3 still have no invite. Two answers needed today: did that meeting happen, and is the weekly stopped on purpose or just unsent? The framing on the transfer bug is unchanged: it is the same failure class as Valeo's AST-20255, so fix both clients in one pass. The 8/13 weekly went ahead with all three client-side people present — Dan Olsen, David Ulbrich and James Eubanks — for the first time since 6/18 (Fathom 781050095). The call root-caused it: the AI reads Metro Sales' Zoom auto attendant as voicemail and disconnects the instant it answers, with the Zoom-side recording showing the drop at 0:00, before the technician can press 1. Your own summary email at 17:15 UTC that day says \"We confirmed that this is the final blocker before moving forward with the paid plan.\" — you put it in writing as the sole precondition for converting them. And it is the same failure class as Valeo's AST-20255 (a transfer reaching an auto attendant misread as voicemail), which has sat in development since June. Valeo already left over transfer problems.",
     "do": "① 把这个 bug 提到 CRITICAL，并与 AST-20255 合成一个修复 —— 两家卡在同一处，分开修等于修两次还都不彻底。技术方向 Daniel 已经给了：别再做二元的「是不是语音信箱」判断，改成保持对话、识别出 Zoom auto attendant、多等一会儿、用真人声音确认后再决定挂不挂。② 盯 James 交出专用的 Zoom 测试号码/分机，他已经答应去问他们的 Zoom 负责人 —— 没有它只能拿真实服务台测，改一次扰动一次。③ 修好后立刻安排一次联合测试并当场回告，这家现在是全板离成交最近的一家（另一家是 EstesGroup）。",
     "do_en": "1. Raise this to CRITICAL and merge it with AST-20255 into a single fix — two clients are stuck at the same point, and fixing them separately means doing it twice and neither properly. Daniel has already given the direction: drop the binary voicemail check and stay conversational — recognise the Zoom auto attendant, wait, and confirm against a live voice before deciding to disconnect. 2. Chase James for the dedicated Zoom test number/extension; he has agreed to ask their Zoom director. Without it we can only test against the live service desk and disrupt it every time. 3. The moment it is fixed, book a joint test and report back on the call — this is now the closest client on the board to closing, alongside EstesGroup."
    },
    {
     "pri": "急",
     "pri_en": "Urgent",
     "title": "My IT Crew 试用已经开通、号码已经给出 —— 客户当场提的两个 gap 还是零工单",
     "title_en": "My IT Crew is live on trial with a number issued — and the two gaps they named still have no tickets",
     "why": "8/17 的 demo 开了（Fathom 787854106）：你当场开了 14 天试用、装好 app、接好 PSA、选定 skill 与语音，给号 716-271-8542，这家因此从 15% 升到 35%。但会上 Yossi Levy 明确提的两条，ClickUp 里一张单都没有：① 按来电内容动态设定工单状态（你的原话是 \"All the tickets are created as new.\"，而他们现有答录服务是按紧急度分状态的）；② 按键分流 / 多号码（\"We only provision one number for now.\"）。你的纪要邮件已经写了 MSPbots 会跟进这两条 —— 写了就必须有单，这正是 Unity IT「every deal-breaker is now live」翻车的同一模式。",
     "why_en": "The 8/17 demo went ahead (Fathom 787854106): you enabled the 14-day trial on the call, installed the app, connected the PSA, selected the skill and voice and issued the number 716-271-8542, which moved this client from 15% to 35%. But the two things Yossi Levy named have no ClickUp ticket at all: (1) setting ticket status dynamically from what the caller says — your own words were \"All the tickets are created as new.\", while their current answering service assigns status by urgency; (2) keypress routing across multiple numbers (\"We only provision one number for now.\"). Your minutes email already promises MSPbots will follow up on both — a promise on record needs a ticket behind it, which is exactly where the Unity IT \"every deal-breaker is now live\" claim came apart.",
     "do": "① 今天把这两条落成工单并回告排期。② AST-21450（MyITCrewNy onboarding）8/17 仍是 pm in progress，试用都开了，推完它。③ 试用 8/31 前后到期，在窗口内主动约跟进 —— Yossi 说要先算 Answer First 的成本对比，那次会带真实分钟数去谈。④ 盯第一通测试电话：打没打、结果如何，决定这家停在 35% 还是进 55%。",
     "do_en": "1. Log both today and tell them the schedule. 2. AST-21450 (MyITCrewNy onboarding) was still \"pm in progress\" on 8/17 — the trial is live, so close it. 3. The trial expires around 8/31; book the follow-up inside that window — Yossi is pricing up the Answer First comparison, so bring real minute counts. 4. Watch for the first test call: whether it happens and how it goes decides whether they stay at 35% or move to 55%."
    },
    {
     "pri": "风险",
     "pri_en": "Risk",
     "title": "Capstone Works 在 8/11 的会上当场拒了 ATI —— 但账号还在，别把它一起丢了",
     "title_en": "Capstone Works rejected ATI on the 8/11 call — but the account is still ours, don't lose that too",
     "why": "8/11 的 onboarding 会上你顺带做了 ATI demo，客户当场评估并拒绝（Fathom 778774350）。决定性的是建单时机：你确认工单在通话结束后才创建，Chuck Adams 回 \"So that takes the usefulness of this application to near zero.\"，你问是不是 deal breaker，Cindy Adams 答 \"That's a huge deal breaker.\"。另外两条硬缺口是高价值客户透传和 AlertOps 集成。Chuck 那通测试电话还因为 API 权限不足没建出工单，你当时答应「forward you the security」。注意这家是正在 onboarding 的付费客户（BrightGauge 迁移，8/12 有 kickoff），ATI 流失不等于账号流失。",
     "why_en": "You folded an ATI demo into the 8/11 onboarding call and the client evaluated and rejected it on the spot (Fathom 778774350). Ticket timing decided it: you confirmed the ticket is only created after the call ends, Chuck Adams replied \"So that takes the usefulness of this application to near zero.\", and when you asked whether that was the deal breaker Cindy Adams answered \"That's a huge deal breaker.\" The other two hard gaps are pass-through for high-value callers and AlertOps integration. Chuck's test call also failed to create a ticket because the API permission was insufficient, and you promised to \"forward you the security\". Note they are a paying client mid-onboarding (BrightGauge migration, kickoff on 8/12) — losing ATI is not losing the account.",
     "do": "① 把答应的 API 权限说明发过去，这是你在会上给的承诺，别让它变成第二个印象分。② 回访交给 Kristine 走 CSM 线，ATI 侧短期不要再推。③ 三条缺口里「转接前建单」和「高价值客户透传」是跨客户的产品缺口 —— 前者与 Titanium 的 AST-20803 / AST-20757 是同一件事，做完之后这家有明确的重连由头。④ 8/11 内部已提出回收他们的号码，确认执行到位。",
     "do_en": "1. Send the API-permission instructions you promised on the call — that was your commitment and it should not become a second bad impression. 2. Hand the follow-up to Kristine on the CSM line and stop pushing ATI at them for now. 3. Two of the three gaps are cross-client product gaps: creating the ticket before the transfer — the same thing as Titanium's AST-20803 / AST-20757 — and pass-through for high-value callers; shipping those gives a concrete reason to go back. 4. Decommissioning their number was raised internally on 8/11; confirm it actually happened."
    },
    {
     "pri": "回告",
     "title": "回告清单缩到 2 张：Unity IT 的两张 8/12 已上线并已回告，Essential Tech 的两张还躺着",
     "why": "本次进展：AST-20756（Unity IT，AI 用 skill 解决问题时创建 time entry）8/12 由 for qa 转 released & live，AST-20755（Autotask 合约类别分级话术）同日转 waiting for client，你当天 13:31 UTC 已经去信 Kip 通报并请求 walkthrough —— Unity IT 这两张既已交付也已回告。仍然躺着的是 Essential Tech 的两张：AST-20986（多步排障脚本支持跳回上一步，8/6 完成）和 AST-20987（客户明确要求转人工时的共情话术，8/4 完成），分别躺了 7 天和 9 天没通知客户。　【8/14 补】ACTS360 的三张单在 8/13 03:14 UTC Jazz 的书面跟进信里同样一个字都没提（那封信讲的是 AI Widget Builder / MCP Server / SOP Agent）—— 8/12 见面没提，8/13 跟进也没提，这是全板最典型的「接触发生了但没回告」。Essential Tech 的 AST-20986 / AST-20987 已经躺了 8 天和 10 天；8/14 01:00 的周会 8/14 复查仍在日历上，就是今天。　【8/15 补】那场周会开了（Fathom 782689046，transcript 已逐字读过），会上 Glenn 演示了轮值/排班/通知三个新能力 —— 但 **AST-20986（多步排障跳回上一步）与 AST-20987（客户明确要求转人工时的共情话术）依旧一个字都没提**。现在分别躺了 9 天和 11 天，而下一次见面被推到了 9/4，也就是说靠会议回告这条路在这家已经断了三周。同一场会上客户还把三个新问题摆上来，当天开单当天上线（86e2u63ny / 86e2u63tb / 86e2u63uz）—— 修得比说得快，正是「回告」这一环在掉链子。",
     "do": "① Essential Tech：不要再等会议了。下一次见面在 9/4，20986/20987 已经躺了 9 天和 11 天 —— 今天就发一封书面回告（做了什么、怎么用、请验证），顺带把 8/14 当天上线的三张 bug 单一起写进去，请 Nidhi 再打一轮测试电话。② 回给 Kip 的口径要立刻修正 —— 见「数据存疑」里 SMS 那条：你 8/12 写的是「every deal-breaker you raised is now live」，但 AST-21144 依赖的 SMS 至今没做。walkthrough 之前先把这句话改成「time entry 与合约分级已上线，SMS 仍在 beta 排期」。",
     "pri_en": "Tell client",
     "title_en": "The report-back list is down to two: Unity IT's pair shipped and was reported on 8/12, Essential Tech's pair is still sitting",
     "why_en": "Progress this run: AST-20756 (Unity IT — a time entry when the AI resolves an issue via a skill) moved from \"for qa\" to \"released & live\" on 8/12, AST-20755 (Autotask contract-category tiered prompts) moved to waiting-for-client the same day, and you wrote to Kip at 13:31 UTC that day to report both and ask for a walkthrough — so Unity IT's pair is both delivered and communicated. What is still sitting is Essential Tech's pair: AST-20986 (let a caller jump back to an earlier troubleshooting step, completed 8/6) and AST-20987 (an empathetic hand-off when a caller refuses the AI, completed 8/4), 7 and 9 days respectively with no word to the client. [Added 8/14] ACTS360's three tickets are not mentioned once in Jazz's written follow-up of 03:14 UTC on 8/13 either (that email covers the AI Widget Builder, the MCP Server and the SOP Agent) — not on the 8/12 call, not in the next day's follow-up. It is the clearest case on the board of contact happening without the client being told. Essential Tech's AST-20986 and AST-20987 have now been sitting 8 and 10 days; the 8/14 01:00 weekly was still on the calendar at the 8/14 re-check — that is today. [Added 8/15] That weekly went ahead (Fathom 782689046, transcript read verbatim) and Glenn demoed the three new rotation / scheduling / notification capabilities — but **AST-20986 (jumping back a step in multi-step troubleshooting) and AST-20987 (the empathetic hand-off when a caller asks for a human) were not mentioned once**. They have now been sitting 9 and 11 days, and the next meeting has moved to 4 September, so reporting back via a meeting is closed off at this client for three weeks. On the same call the client raised three new problems that were ticketed and shipped the same day (86e2u63ny / 86e2u63tb / 86e2u63uz) — we are fixing faster than we are telling, which is exactly where this link breaks.",
     "do_en": "1. Essential Tech: stop waiting for a meeting. The next one is on 4 September and 20986/20987 have been sitting 9 and 11 days — send a written report-back today (what shipped, how to use it, please verify), fold in the three bug tickets that shipped on 8/14, and ask Nidhi to run another round of test calls. 2. Correct the Unity IT wording immediately — see the SMS entry under open questions: your 8/12 email says \"every deal-breaker you raised is now live\", but the SMS capability AST-21144 depends on still does not exist. Before the walkthrough, change that to \"time entry and contract-based tiering are live, SMS is still on the beta plan\"."
    },
    {
     "pri": "急",
     "title": "8/6–8/7 上线的三张单：ACTS360 是原始提出方，8/12 见了面却一句没提",
     "why": "AST-20245（分时段路由）、AST-20246（自动 on-call 排班）8/6 上线，AST-20247（下班后挂断通知 on-call）8/7 上线；挂在这三张下面的客户单共 6 张，横跨 5 家。Unity IT 与 TeamLogic IT 8/7 已回告。本次的问题在 ACTS360：8/12 Jazz 的 CSM 月度例会上，Joshua Mejia 花了大半场谈 ATI 的定价和 ROI，而这三个正是他自己提的能力 —— 一句都没被提到。看板的「已回告？」列现在会因为这场会显示为「上线后已有接触」，那只证明接触发生过，不等于讲了这三张单。Essential Tech（AST-20984 分时段升级排班，Nidhi 称之为 non-negotiable）也仍未回告。Parachute（AST-20474）客户 8/3 已流失，存档即可。Layer 7（AST-20467）先别发 —— 客户侧证据仍然是空的。",
     "do": "【8/15 更新】Essential Tech 这条有进展了：8/14 的周会上 Glenn 当面演示了排班 skill（多套 business-hours roster + 默认 after-hours roster），也就是 AST-20245 分时段路由的落地形态。但两点没解决 —— 排班读不到他们在用的 Shift，只能手工改；Nidhi 说要自己试，到 8/15 还没有任何她试过的证据，而下一次见面在 9/4。所以「5 个人不要在 6 点后同时被 buzz」仍未被客户确认满足。ACTS360 那三张单则毫无进展：8/12 见面没提、8/13 书面跟进没提，到 8/15 仍然没有任何回告动作。\n\n① 给 ACTS360 发一封正式回告：上线了什么、怎么配、请验证。而且要挂在 Joshua 的 ROI 问题上 —— 他卡在「没有 SOP/KB，AI 省不下人力」，这三个能力恰恰不依赖知识库，它们替掉的是 Answer Connect 的人工值守成本。把 ROI 叙事从「AI 自助解决」换成「替掉 Answer Connect」。② Essential Tech 8/14 周会当面回告，但先读「数据存疑」里 AST-20245 划掉 AC-3/AC-5 那条 —— 分时段分派到不同的人这件事，上线版本未必真做到了。③ Layer 7 暂缓，等客户侧证据。",
     "pri_en": "Urgent",
     "title_en": "The three tickets shipped 6–7 Aug: ACTS360 asked for them, we met them on 8/12, and not one came up",
     "why_en": "AST-20245 (time-based routing) and AST-20246 (automated on-call rotation) went live on the 6th, AST-20247 (after-hours hang-up notification) on the 7th; six client tickets ride on those three across five clients. Unity IT and TeamLogic IT were told on 8/7. The problem this run is ACTS360: on Jazz's CSM monthly of 8/12, Joshua Mejia spent most of the call on ATI pricing and ROI — and not one of the three capabilities he himself asked for came up. The board's \"client told?\" column will now read as contact-made because of that meeting, which proves contact happened, not that these tickets were discussed. Essential Tech (AST-20984, time-block escalation schedules, the one Nidhi called non-negotiable) still has not been told either. Parachute (AST-20474) declined on 8/3, so that one is archival. Hold Layer 7 (AST-20467) — the client-side evidence is still empty.",
     "do_en": "[Updated 8/15] Essential Tech has moved: on the 8/14 weekly Glenn demoed the scheduling skill in person (multiple business-hours rosters plus a default after-hours roster), which is what AST-20245's time-based routing looks like in practice. Two things are unresolved — the rosters cannot read the Shift tool they use, so changes are manual, and Nidhi said she would try it herself but as of 8/15 there is no evidence she has, with the next meeting on 4 September. So the original ask, that five technicians not all get buzzed after 6pm, still has no client confirmation. ACTS360's three tickets have moved not at all: not on the 8/12 call, not in the 8/13 written follow-up, and still no report-back as of 8/15.\n\n1. Send ACTS360 a proper write-up: what shipped, how to configure it, please verify — and hang it on Joshua's ROI problem. He is stuck on having no SOPs or KB so the AI saves no labour; these three capabilities need no knowledge base at all, because what they replace is the cost of Answer Connect's manned cover. Move the ROI story from \"the AI resolves it\" to \"this replaces Answer Connect\". 2. Tell Essential Tech face to face on the 8/14 weekly, but read the open question about AST-20245's struck-through AC-3/AC-5 first — routing to different people per time block may not be in the shipped build. 3. Hold Layer 7 until there is client-side evidence."
    },
    {
     "pri": "风险",
     "title": "Layer 7 Systems：先确认是否已流失，补发邀请的事暂停",
     "why": "8/7 10:24 你在内部 ATI 群里通报 \"Layer7Systems will not move forward with AI Ticket Intake\"，并附了复盘报告。但客户侧没有任何书面依据：emails/layer7systems.com 最后一封是 8/3 的 paywall 通知（Jacob 未回），Outlook 里 7/25 之后没有 layer7systems.com 来信，Fathom 自 7/28 起没有任何 Layer7 场次，8/7 那场周会也没开成。看板因此仍把这家挂在 55%，8/14、8/21 仍显示「应排未排」。（8/13 第 6 次复查：四个渠道依旧全空 —— 日历到 8/26 无任何 Layer7 场次、Outlook 自 7/20 零来信、Fathom 自 7/27 无场次、归档邮件仍停在 8/3。客户侧沉默第 10 天，连续 6 天全空。这条不能再靠每天复查往下拖了。）",
     "do": "本周内把 Jacob 那边的书面依据补上（邮件或一通有录像的电话），发给 Grace 后一次性改成 0% 并填 rejection；在那之前不要补发 8/14、8/21 的邀请。如果其实还没定，那这两场邀请就该照常发 —— 两种情况都比继续沉默好。",
     "pri_en": "Risk",
     "title_en": "Layer 7 Systems: confirm whether they have churned before sending any more invites",
     "why_en": "On 8/7 at 10:24 you told the internal ATI channel that \"Layer7Systems will not move forward with AI Ticket Intake\" and attached a post-mortem. There is no client-side written basis for it: the last item in emails/layer7systems.com is the 8/3 paywall notice (unanswered by Jacob), Outlook has nothing from layer7systems.com since 7/25, Fathom has no Layer7 session since 7/28, and the 8/7 weekly did not happen. The board therefore still carries them at 55% with 8/14 and 8/21 flagged as missing invites. (Sixth re-check on 8/13: all four channels are still empty — no Layer7 occurrence on the calendar through 8/26, nothing in Outlook since 7/20, nothing in Fathom since 7/27, and the archived mail still stops at 8/3. Tenth day of client-side silence, six consecutive empty days. This can no longer be carried forward by re-checking it daily.)",
     "do_en": "Get the written basis from Jacob's side this week (an email, or a recorded call), send it to Grace, and the board moves them to 0% with a rejection block in one edit. Until then, do not send the 8/14 and 8/21 invites. If it turns out nothing was actually decided, those invites should go out as normal — either outcome beats more silence."
    },
    {
     "pri": "急",
     "title": "Certified CIO：8/19 终于发了信（两封），但 9/6 之前日历上仍然一场都没有",
     "why": "8/19 11:01 UTC Glenn 给 Eric Lamdin 去信提 demo 并附预约链接；同日 20:51 UTC Aaron 发出 2 周试用邀请。零触达的问题到此为止 —— 但 8/20 复查 Glenn 日历到 9/6 仍无任何 Certified CIO 场次，Eric 也没回信。距 8/5 客户主动开口要 demo 已 15 天，7 天 SLA 破了 8 天。这家是唯一一家客户自己开口要 demo 的商机。",
     "do": "别发第三封信。今天由 Crispin 打电话或在下次 CSM 例会当场定时间；本周内仍无回音就明确决定继续跟进还是标为不再跟进。",
     "pri_en": "Urgent",
     "title_en": "Certified CIO: two emails finally went out on 8/19, and the calendar is still empty through 9/6",
     "why_en": "At 11:01 UTC on 8/19 Glenn wrote to Eric Lamdin offering a demo with a booking link, and at 20:51 UTC Aaron sent the two-week trial invitation. The \"no contact at all\" finding is closed — but on the 8/20 recheck Glenn's calendar still has no Certified CIO session through 9/6, and Eric has not replied. It is 15 days since the client asked for a demo unprompted on 8/5, and the 7-day SLA is 8 days past. This is the only opportunity where the client asked for the demo themselves.",
     "do_en": "Do not send a third email. Have Crispin phone today, or fix the time live in the next CSM monthly; if there is still no answer by the end of the week, decide explicitly to keep chasing or to close it out."
    },
    {
     "pri": "回告",
     "title": "ISG Technology — 8/17 的例会开了，但 ATI 一句没提，状态邮件也没发",
     "why": "上一轮这条写的是「8/17 已排上，会前先发工单状态邮件」。会开了（Fathom 787445651，客户方 4 人，Glenn 在场），但按 Fathom 摘要，全场是 NextTicket 派单与 SOP Agent 演示，ATI 不在讨论要点也不在 next steps；状态邮件也没有发出。10 张单里 7 张 enhancement 仍未开工，这已经是第二次接触被无声放过。",
     "do": "① 今天补发状态邮件：7 张 enhancement 逐条做/不做/延后，并写清 8 月上线的 AST-20245/20246/20247。② 如果会上其实提了 ATI，请给出片段，本板据实修正。③ 下一次月度例会前把 ATI 写进议程 —— 否则 SOP Agent 会继续占满这条线。",
     "pri_en": "Tell client",
     "title_en": "ISG Technology — the 8/17 monthly happened, ATI never came up, and the status email never went out",
     "why_en": "Last run this item said the 8/17 monthly was booked and to send the ticket-status email first. The call happened (Fathom 787445651, four client attendees, Glenn present) but per the Fathom summary it was all NextTicket dispatch and an SOP Agent demo — ATI is in neither the discussion points nor the next steps, and no status email went out. Seven of the ten tickets are still not started, and that is now a second contact passed in silence.",
     "do_en": "1. Send the status email today: for each of the seven enhancements say built, dropped or deferred, and spell out AST-20245/20246/20247 which shipped in August. 2. If ATI was in fact discussed, provide the excerpt and the board will correct itself. 3. Put ATI on the agenda of the next monthly, or SOP Agent will keep taking the slot."
    },
    {
     "pri": "回告",
     "title": "Converged Medical Solutions — 17 天没沟通",
     "why": "1 项已交付未回告。5/13 demo 后 8 场例会全在聊 AI Triage / NextTicket，ATI 再没被提起。",
     "do": "要么在下次例会重启 ATI 话题，要么明确标记为不再跟进，别留在 15% 档空转。",
     "pri_en": "Tell client",
     "title_en": "Converged Medical Solutions — 17 days silent",
     "why_en": "One delivered item never communicated. Since the 5/13 demo, all 8 monthlies have been about AI Triage / NextTicket.",
     "do_en": "Either restart the ATI conversation at the next monthly or mark it not-pursuing — don't leave it idling at 15%."
    },
    {
     "pri": "回告",
     "title": "Dev-Source（8 天）",
     "why": "有已交付项，沟通开始滞后但还没到失联。（原本与 Precicom 并列，但 Precicom 已确认为 7/24 邮件流失，不再需要交付回告。）",
     "do": "发一封简短的交付确认。",
     "pri_en": "Tell client",
     "title_en": "Dev-Source (8 days)",
     "why_en": "Has delivered items; contact is starting to lag but hasn't gone cold. (Previously paired with Precicom, which has since been confirmed lost by email on 7/24 and no longer needs a delivery follow-up.)",
     "do_en": "Send a short delivery confirmation."
    },
    {
     "pri": "定价",
     "title": "五家 90% 的定价口径要一次讲清 —— Mainstream 与 EstesGroup 都通过了，另外三家还卡着",
     "why": "Mainstream（本次新进 90%）8/7 明确说 $199/月含 200 分钟、超出 $0.50/分钟「in-line with what I would expect to pay」，并愿意在问题修复后订阅 —— 这是第一次有客户书面确认这个价可接受。本轮 EstesGroup 也进了 90%：8/4 收到付费墙与 6 credits/分钟报价后没有提任何价格异议，8/10 反而通报内部签字已过关。另外三家仍卡着：Metro Sales（已确认在预算内但迟迟不动）、ACTS360（200 分钟基础套餐卡住白天自助场景）、Unity IT（约 $400/月 vs 现有 $160–170）。Valeo 已经因为转接计费走人 —— 同一个根因已经杀掉一单。 本次更新：EstesGroup 已经走到定价的另一头 —— 8/12 Bill 说审批全过、问要不要签合同，Glenn 回不用签、只要在 MarketPlace 选个套餐即可生效。ACTS360 这边档位口径也变了：8/12 Jazz 给的是 Basic $399/月 3,000 credits、Starter $699/月 7,000 credits，而 Joshua 手上还是 $399/月约 500 分钟的旧口径 —— 同一家客户在两周内收到两套说法，这正是「定价口径要一次讲清」的原因。Unity IT 8/12 收到的是 alpha 价 $199/月 1,000 credits（约 166 分钟）+ 120 天退款保障。三套报价、三个数字，需要一张对外统一的表。　【8/14 补，这一条现在有实例了】8/13 的 Product-Platform L10 上确认，EstesGroup 差一点因为报价口径不一致丢掉：旧口径 $199/月含 200 分钟发出去过，实际是 6 credits/分钟、$199/1,000 credits ≈ 166 分钟，客户当场被搞糊涂，Daniel 的原话是 \"this kind of stuff kills the deals.\"。同一天 Unity IT 的 Kip 回信把反对从价格升级到了价值：\"this cost comes in higher than our current cost for a live operator. I'm not sure that I am seeing the benefit of using this after-hours.\"",
     "do": "跟 Daniel/产品定一个对外统一的定价与转接计费答复，一次性回给这四家。Mainstream 的原话可以当内部依据：价格本身站得住，卡住 ACTS360 和 Unity IT 的是分钟额度与转接计费的结构，不是标价。 另加两件今天就能做的：① 把所有还拿着旧口径的客户列出来（至少 ACTS360 的 $399/月约 500 分钟）并主动更正，别等他们自己算出来；② 给 Unity IT 的回复要用数字而不是功能清单 —— 他们现有真人接线员的月成本 vs ATI 的分钟成本。",
     "pri_en": "Pricing",
     "title_en": "Five deals at 90% need one pricing answer — Mainstream and EstesGroup cleared it, the other three are still stuck",
     "why_en": "Mainstream (new at 90% this run) said plainly on 8/7 that $199/month for 200 minutes with $0.50 per additional minute is \"in-line with what I would expect to pay\", and would subscribe once the open issues are fixed — the first written confirmation from any client that the price is acceptable. EstesGroup joined the 90% group this run as well: they raised no pricing objection after receiving the paywall notice and the 6-credits-per-minute quote on 8/4, and on 8/10 reported that internal sign-off had cleared. The other three are still stuck: Metro Sales (confirmed in budget but not moving), ACTS360 (the 200-minute base blocks the daytime self-service case) and Unity IT (~$400/mo against ~$160–170 today). Valeo already walked over transfer billing — the same root cause has killed one deal. Updated this run: EstesGroup has come out the far side of pricing — on 8/12 Bill said approvals were all through and asked whether a contract was needed, and Glenn replied that none is, only a plan selection in the Marketplace. The ACTS360 quote has also changed shape: on 8/12 Jazz gave Basic at $399/month for 3,000 credits and Starter at $699/month for 7,000, while Joshua is still holding the older $399-for-~500-minutes version — the same client receiving two different stories inside a fortnight is precisely why one external pricing answer is needed. Unity IT was quoted alpha pricing on 8/12: $199/month for 1,000 credits (about 166 minutes) plus the 120-day money-back guarantee. Three quotes, three sets of numbers, one table needed. [Added 8/14 — this item now has a worked example] The Product-Platform L10 of 8/13 confirmed EstesGroup nearly fell over a quote mismatch: the old $199-for-200-minutes quote went out while billing is 6 credits per minute, making $199 for 1,000 credits about 166 minutes. The client was left confused and Daniel's words were \"this kind of stuff kills the deals.\" The same day, Unity IT's Kip escalated the objection from price to value: \"this cost comes in higher than our current cost for a live operator. I'm not sure that I am seeing the benefit of using this after-hours.\"",
     "do_en": "Agree a single external position on pricing and transfer billing with Daniel/product and answer all four at once. Mainstream's reply is useful internally as evidence that the headline price holds up — what blocks ACTS360 and Unity IT is the minute allowance and transfer-billing structure, not the sticker price. Two things that can be done today: 1. List every client still holding an old quote (ACTS360's $399-for-~500-minutes at minimum) and correct it proactively rather than waiting for them to do the arithmetic. 2. Answer Unity IT with numbers rather than a feature list — their live operator's monthly cost against ATI's per-minute cost."
    },
    {
     "pri": "急",
     "title": "Big Fish Technology —— 提了 12 张单，我们两个月没理",
     "why": "9 张 enhancement 未开工，3 个 bug 来自真实通话。会议 6/3 就停了，客户两个月没被联系过。之前看板显示它「无工单」是数据 bug 造成的假象。",
     "do": "要么重启会议节奏，要么发一封明确回告：哪些做、哪些不做。这是「提得最多、动得最少」的一家。",
     "pri_en": "Urgent",
     "title_en": "Big Fish Technology — 12 tickets raised, two months of silence from us",
     "why_en": "Nine enhancements untouched and 3 bugs found on real calls. Meetings stopped on 6/3 and nobody has contacted them since. The board previously showed them with no tickets at all — that was a data bug.",
     "do_en": "Either restart a cadence or send a clear answer on what will and will not be built. This is the widest ask-versus-action gap in the portfolio."
    }
   ],
   "role_en": "Glenn",
   "subtitle_en": "Client-facing manager · client push and closing the loop",
   "owners": [
    {
     "name": "Glenn Bugtong",
     "email": "glenn.bugtong@mspbots.ai",
     "initials": "GB",
     "slug": "glenn"
    }
   ]
  },
  {
   "role": "Grace",
   "subtitle": "交付侧 PM · 按「未交付 × 客户档位」排优先级",
   "items": [
    {
     "pri": "P0",
     "title": "on-call 通知与升级 —— 7 张单、6 家客户、横跨三个档位",
     "why": "Unity IT（90%）持续重试 + SMS/Teams + 自助排班 3 张、ACTS360（90%）挂断通知、Layer 7（55%）Teams 上下文通知、Essential Tech（55%）分时段升级排班、ISG（35%）warm handoff whisper。覆盖客户数和档位都最高，而且现在是逐家定制在做。　【8/14 补】Kip 8/13 的回信把这条又顶了一次：\"We would need an easy way to assign the on-call technician based on a schedule. Additionally, we would need the system to call the on-call technician multiple times if the initial call isn't connected (in addition to PSA, and SMS alerts).\" 这是 Unity IT 第三次提同一组诉求，而 AST-21143 / AST-21144 / AST-20757 全部仍是 new。",
     "do": "合并成一个通用的 on-call 通知/升级能力（多通道 + 排班 + 重试 + whisper），一次做完覆盖 6 家。",
     "pri_en": "P0",
     "title_en": "On-call notification and escalation — 7 tickets, 6 clients, three rungs",
     "why_en": "Unity IT (90%) persistent retry + SMS/Teams + self-service rota = 3 tickets, ACTS360 (90%) hang-up notification, Layer 7 (55%) Teams context notification, Essential Tech (55%) time-block escalation schedules, ISG (35%) warm-handoff whisper. Highest client count and highest rungs — and it is being built per-client today. [Added 8/14] Kip's 8/13 reply pushed this to the top again: \"We would need an easy way to assign the on-call technician based on a schedule. Additionally, we would need the system to call the on-call technician multiple times if the initial call isn't connected (in addition to PSA, and SMS alerts).\" That is the third time Unity IT has raised the same cluster, and AST-21143, AST-21144 and AST-20757 are all still \"new\".",
     "do_en": "Merge into one general on-call notification/escalation capability (multi-channel + rota + retry + whisper) and cover all six at once."
    },
    {
     "pri": "P0",
     "pri_en": "P0",
     "title": "转接遇 auto attendant 被误判为语音信箱 —— 一个 bug 卡着两家，其中一家只差它就付费",
     "title_en": "Transfers misread an auto attendant as voicemail — one bug, two clients, one of them a bug away from paying",
     "why": "Metro Sales 8/13 的周会把根因定死了：AI 把他们的 Zoom auto attendant 当成语音信箱，接通瞬间挂断，技术员来不及按 1；Glenn 当天的纪要邮件写明这是付费转化的唯一前置条件。Valeo 的 AST-20255 是同一个失败类别（800 号码的 auto attendant 被记为 voicemail detected 后直接放弃转接），自 6 月起一直是 in development，而 Valeo 已经因为转接问题走了。",
     "why_en": "The Metro Sales weekly of 8/13 nailed the root cause: the AI reads their Zoom auto attendant as voicemail and hangs up the moment it answers, before the technician can press 1 — and Glenn's summary email that day names it as the sole precondition for paid conversion. Valeo's AST-20255 is the same failure class (an 800-number auto attendant logged as voicemail detected, aborting the transfer). It has been in development since June, and Valeo has already left over transfer problems.",
     "do": "把 AST-20255 和 Metro Sales 的转接单当成一个修复来做，别按客户拆。判据从二元的语音信箱检测改成保持对话 + 延长等待 + 真人声音确认。修完先在 Metro Sales 的专用 Zoom 测试号上验，这是目前唯一能拿到真实 auto attendant 环境的地方。",
     "do_en": "Treat AST-20255 and the Metro Sales transfer ticket as one fix rather than splitting by client. Replace the binary voicemail detection with staying conversational, a longer wait, and confirmation against a live voice. Validate on Metro Sales' dedicated Zoom test number once they provide it — it is the only real auto-attendant environment we can get at."
    },
    {
     "pri": "P0",
     "pri_en": "P0",
     "title": "对话质量：抢话、机械音、多问题只处理一个 —— 8/14 当天上线了三张，但没人验过",
     "title_en": "Conversation quality: interruption, robotic audio, dropped second issue — three tickets shipped on 8/14, none verified",
     "why": "【8/21 更新】8/14 上线的那三张（86e2u63ny 忽略已说过的排障步骤、86e2u63tb \"one moment\" 拼接音、86e2u63uz 对话延迟）本轮在 ClickUp 里已经从 complete 变成 Closed，看板上它们因此退出「已交付」、落进「已关闭」，Essential Tech 的已交付数随之下降。关单不等于验过 —— 请确认这是「修好了顺手关单」还是「不修了」，两种含义对客户是两句完全不同的话。2026-08-14 Essential Tech 周会（Fathom 782689046，transcript 已逐字读过）是这家第一次由 Nidhi Patel 亲自打测试电话后的反馈，三条都指向对话层而不是集成层：① AI 在客户说话时抢话，音调忽高忽低，\"one moment, please\" 听起来像第二个更机械的声音 —— 她判断是 TTS 合成加延迟，并主动提出可以和我们的开发直接聊（她做过同类产品）；② 一通电话报了打印机和 VPN 两个问题，AI 中途把打印机那个丢了 —— 她强调真实来电经常一次讲 2–3 件事；③ 听不懂「已经试过什么」：她说已重连 Wi-Fi、热点、以太网并重配过 VPN，AI 说要做 advanced troubleshooting，然后又回到「有没有重连 Wi-Fi」。三张单当天开当天上线（86e2u63ny / 86e2u63tb / 86e2u63uz），但客户侧一次都没有复测，而下一次见面在 9/4。注意这三条不是 Essential Tech 独有：Capstone Works 就是因为对话不自然（\"I have spoken with AIs that are very good at understanding whatever comes out of my mouth... I don't think this one is there yet\"）在 8/11 当场拒绝的，CIOLanding 8/7 的 10 通只成功 1 通也在同一片区域。",
     "why_en": "[8/21 update] The three that shipped on 8/14 (86e2u63ny, the AI ignoring troubleshooting the caller already described; 86e2u63tb, the spliced \"one moment\" audio; 86e2u63uz, conversation latency) have gone from complete to Closed in ClickUp this run, so on this board they leave the delivered bucket for the closed one and Essential Tech's delivered count drops with them. Closing a ticket is not the same as verifying it — confirm whether this is \"fixed, so closed\" or \"not fixing it\", because those are two completely different sentences to the client. The Essential Tech weekly of 2026-08-14 (Fathom 782689046, transcript read verbatim) was the first session carrying feedback from test calls Nidhi Patel placed herself, and all three findings sit in the conversation layer rather than the integration layer. (1) The agent talks over the caller, the pitch wanders, and \"one moment, please\" sounds like a second, more robotic voice — she reads it as TTS synthesis plus latency, and offered to speak to our developers directly, having built products like this herself. (2) She reported a printer fault and a VPN fault on one call and the agent silently dropped the printer one; she stressed that real callers routinely present two or three issues at once. (3) It cannot follow what has already been tried: she had reconnected Wi-Fi, a hotspot and ethernet and reconfigured the VPN, and after announcing \"advanced troubleshooting\" the agent looped back to \"have you reconnected the Wi-Fi\". Three tickets were raised and shipped the same day (86e2u63ny / 86e2u63tb / 86e2u63uz), but the client has not retested once and the next meeting is 4 September. These are not Essential Tech's alone: Capstone Works declined on the 8/11 call partly because the conversation did not feel capable (\"I have spoken with AIs that are very good at understanding whatever comes out of my mouth... I don't think this one is there yet\"), and CIOLanding's 1-in-10 success rate on 8/7 lives in the same territory.",
     "do": "① 三张单上线太快，请补一次自证：抢话属于对话行为（打断时应该停下来说「我在听」，而不是把脚本念完），不是一个字符串能改完的 —— 拿真实通话回放验一遍再说修好了。② 多问题处理要做成通用能力：先确认第一个问题、再显式转向第二个，别按客户拆。③ 接受 Nidhi 的技术援助 —— 她主动说 \"if your developer wants to speak to me... I'm happy to help them\"，这是免费的同行评审，安排一次半小时的开发对谈。④ 9/4 之前客户不会再见我们，所以修完必须书面回告并请她再打一轮，否则等到 9/4 才发现没修好，就又浪费三周。",
     "do_en": "1. The three tickets shipped the same day they were raised — prove them before claiming them. Interruption is conversational behaviour (when cut off the agent should stop and say \"I'm listening\" rather than finish reading its script), not a string change, so validate against real call recordings. 2. Build multi-issue handling as a general capability: confirm the first issue, then move explicitly to the second, rather than patching per client. 3. Take Nidhi up on her offer — \"if your developer wants to speak to me... I'm happy to help them\" is free peer review from someone who has built this before; book half an hour with the developers. 4. The client will not see us again before 4 September, so the fixes need a written report-back and a request that she run another round of calls; otherwise a miss discovered on 9/4 costs another three weeks."
    },
    {
     "pri": "P0",
     "title": "转接计费与分钟封顶 —— 唯一已经造成 Closed Lost 的主题",
     "why": "Valeo 就是因为「转给真人后仍按分钟计费」终止的。ISG 的 minute cap hard stop、Unity IT 和 ACTS360 的成本反对，根因都在这里。Valeo 还留着 2 张相关单（cold transfer、转接后是否继续扣 credits）。",
     "do": "即使 Valeo 已走，这两张单也要留着做 —— 它挡着另外三家 90% 的客户。做完拿它当 Valeo 的重连由头（Erik 说了「let me know if further enhancements come」）。",
     "pri_en": "P0",
     "title_en": "Transfer billing and minute caps — the only theme that has already caused a Closed Lost",
     "why_en": "Valeo terminated precisely because credits keep burning after handoff to a human. ISG's minute-cap hard stop and the cost objections from Unity IT and ACTS360 share the same root. Valeo still has 2 open tickets here (cold transfer, credits-after-transfer).",
     "do_en": "Keep both tickets even though Valeo is gone — they block three other 90% deals. Shipping them is also the reconnection hook with Erik, who wrote \"let me know if further enhancements come\"."
    },
    {
     "pri": "P1",
     "title": "合约 / 公司识别路由 —— 4 张单",
     "why": "Precicom（55%）路由前查合约状态、ISG（35%）同名来电公司消歧 + catch-all 公司非计费状态下静默建单失败、Unity IT（90%）Autotask 合约类别分级话术。都是「识别对了才能路由对」的同一类问题。",
     "do": "当成一组做，别拆成四个客户定制。ISG 那张静默失败是 bug，优先级应高于同组的 enhancement。",
     "pri_en": "P1",
     "title_en": "Contract / company identification for routing — 4 tickets",
     "why_en": "Precicom (55%) contract-status check before routing, ISG (35%) caller-name company disambiguation plus silent ticket-creation failure when the catch-all company is non-billable, Unity IT (90%) Autotask contract-category lookup. All the same \"identify correctly before you can route correctly\" problem.",
     "do_en": "Treat as one group rather than four client customisations. ISG's silent failure is a bug and should outrank the enhancements beside it."
    },
    {
     "pri": "P1",
     "title": "KB 集成与 Skills Studio 维护成本",
     "why": "ISG 要 ITGlue / Hudu 自动导入 KB，Essential Tech 明确抱怨「Skills Studio 变成又一个孤岛，希望接已有 KB」。两家指向同一件事。",
     "do": "做成从既有 KB 系统导入，而不是让客户在 Skills Studio 里重建。",
     "pri_en": "P1",
     "title_en": "KB integration and Skills Studio maintenance cost",
     "why_en": "ISG wants ITGlue / Hudu auto-import; Essential Tech explicitly complains that Skills Studio becomes yet another silo and wants their existing KB connected. Both point at the same thing.",
     "do_en": "Import from the KB systems clients already run instead of making them rebuild inside Skills Studio."
    },
    {
     "pri": "清理",
     "title": "ISG 的 7 张未开始单 —— 最大单客户积压，但客户只在 35% 档",
     "why": "全是 enhancement，客户 18 天没被联系。挂着不做也不说，是在消耗信任。",
     "do": "从中挑出跨客户主题（whisper、minute cap、KB 导入）并入上面的 P0/P1，其余明确标「不做 / 延后」并让 Glenn 回告。",
     "pri_en": "Cleanup",
     "title_en": "ISG's 7 not-started tickets — the largest single-client backlog, but the client sits at 35%",
     "why_en": "All enhancements, and the client has not been contacted for 18 days. Holding them open without saying anything burns trust.",
     "do_en": "Pull the cross-client themes (whisper, minute cap, KB import) into P0/P1 above; mark the rest explicitly won't-do / deferred and have Glenn communicate that."
    },
    {
     "pri": "清理",
     "title": "Valeo 的 5 张未完成单做减法",
     "why": "客户已流失，但其中转接计费、auto-attendant 转接失败是通用问题；多号码多租户、PIA 集成属纯 Valeo 定制。",
     "do": "通用的两张保留并入 P0；纯定制的关掉，别占 backlog。",
     "pri_en": "Cleanup",
     "title_en": "Trim Valeo's 5 open tickets",
     "why_en": "The client is gone, but transfer billing and auto-attendant transfer failure are general problems; multi-line/multi-tenant and PIA integration are Valeo-specific.",
     "do_en": "Keep the two general ones and fold them into P0; close the bespoke ones so they stop occupying the backlog."
    }
   ],
   "role_en": "Grace",
   "subtitle_en": "Delivery PM · prioritised by undelivered work × client rung",
   "owners": [
    {
     "name": "Grace Guo",
     "email": "grace.guo@mspbots.ai",
     "initials": "GG",
     "slug": "grace"
    }
   ]
  },
  {
   "role": "CSM → Aaron / Glenn",
   "subtitle": "潜在商机的交接时效",
   "items": [
    {
     "pri": "本轮",
     "pri_en": "This run",
     "title": "8/19 那四封试用邀请：KRS-IT 现在有了 9/3 的配置会，另外三家仍一档没动",
     "title_en": "The four 8/19 trial invites: KRS-IT now has a 9/3 configuration session; the other three have not moved a rung",
     "why": "20:51–20:55 UTC 四封同模板信：Certified CIO、KRS-IT、The Virtual IT Department、Converged Medical Solutions，承诺 \"full access to AI Intake for a 2-week testing window at no cost\" 并要 20–30 分钟配环境。本轮的新证据是第一封回信：2026-08-24 19:55 UTC，Josiv Krstinovski（KRS-IT）全文三句 —— \"Hi Aaron, Adding Kevin and Josef on this. @Kevin Obello @Josef Muertegui Please review and see if this is something we are interested in trialing out?\" 这是转交同事评估，不是接受试用，所以 KRS-IT 仍是 15%。另外三家到 8/25 仍无回信。同时请注意口径：Aaron 的信开头是 \"Thanks for raising your hand for AI Intake\"，而客户自己的措辞是还在决定要不要试 —— 已列入 open_questions。　【8/28 更新】KRS-IT 这条又往前走了一步：8/27 17:02:16 UTC Aaron 建了 “Next Ticket x Intake Configuration”，9/3 16:30 UTC，Josiv 已接受，Josef 与 Kevin 未答复 —— 四家里第一家真正排上配置会的。但 Kevin 8/25 问的定价问题到 8/28 仍然无人回答，等于先约了配置、后给报价。Certified CIO、The Virtual IT Department、Converged Medical Solutions 三家本轮仍无任何新证据。",
     "why_en": "Four template mails went out at 20:51–20:55 UTC to Certified CIO, KRS-IT, The Virtual IT Department and Converged Medical Solutions, promising \"full access to AI Intake for a 2-week testing window at no cost\" and asking for 20–30 minutes to configure the environment. The new evidence this run is the first reply: at 19:55 UTC on 2026-08-24 Josiv Krstinovski (KRS-IT) wrote, in full, \"Hi Aaron, Adding Kevin and Josef on this. @Kevin Obello @Josef Muertegui Please review and see if this is something we are interested in trialing out?\" That is a hand-off to colleagues for evaluation, not an acceptance, so KRS-IT stays at 15%. The other three have not replied as of 8/25. Note the framing gap as well: Aaron's mail opens \"Thanks for raising your hand for AI Intake\" while the client's own words are that they are still deciding — logged in the open questions.  [8/28 update] KRS-IT moved a step further: at 17:02:16 UTC on 8/27 Aaron created \"Next Ticket x Intake Configuration\" for 9/3 16:30 UTC, with Josiv accepted and Josef and Kevin yet to respond — the first of the four to get an actual configuration session on the calendar. But Kevin's 8/25 pricing question still had no answer as of 8/28, so the session was booked before the quote was given. Certified CIO, The Virtual IT Department and Converged Medical Solutions produced no new evidence at all this run.",
     "do": "直接回给 Kevin 与 Josef，把 20–30 分钟的配置会约起来，别等 Josiv 转达；同时先想清楚：这家要的是自动跑 PowerShell、开新用户、改密码，超出 ATI 能力，试用要证明什么。真开通并发号之后才升 35%，凭证留在工单里。　【8/28 追加】① 今天回 Kevin 的定价问题（每月 10–30 通、约 150 分钟，落在 $199/月含 200 分钟的额度内），不要拖到 9/3 当面说；② 给 9/3 那场写一句议程，明确 ATI 占多少、要不要当场开号；③ 另外三家仍是零动作，请各自 CSM 给一个日期。",
     "do_en": "Reply straight to Kevin and Josef and book the 20–30 minute configuration call rather than waiting for Josiv to relay it — and settle first what a trial would prove, given this client wants PowerShell runs, user provisioning and password resets, all beyond what ATI does. Promote to 35% only once it is actually switched on and a number issued, with the record kept on the ticket.  [8/28 addition] (1) Answer Kevin's pricing question today (10–30 calls a month, roughly 150 minutes, inside the $199/month 200-minute allowance) rather than saving it for 9/3; (2) put a one-line agenda on the 9/3 session stating how much of it is ATI and whether a number gets issued on the call; (3) the other three are still at zero action — each CSM should name a date."
    },
    {
     "pri": "复盘",
     "title": "Parachute Techs —— 被拖没的一单",
     "why": "7/9 做完 demo，之后 25 天只有 7/30 一次触达，8/3 客户直接回绝（转向自建 AI Triage）。demo → onboarding 完全没接上。",
     "do": "当成交接失效的样本复盘：demo 之后 14 天内必须有 onboarding 动作，否则商机会自己冷掉。",
     "pri_en": "Post-mortem",
     "title_en": "Parachute Techs — the deal that was lost to delay",
     "why_en": "Demo on 7/9, then 25 days with a single touch on 7/30, then an outright decline on 8/3 (building AI Triage internally). Demo never connected to onboarding.",
     "do_en": "Treat as the reference case for handoff failure: an onboarding action must follow a demo within 14 days or the opportunity cools on its own."
    },
    {
     "pri": "超时",
     "title": "Dev-Source（Kristine）· demo 后 17 天无动作",
     "why": "7/20 demo 时 Brody 明确说「要 hands-on 才能判断」，现用竞品 Thread 约 $1,000/月。hands-on 一直没给。",
     "do": "Aaron 给一个可动手的试用环境，别再发材料。",
     "pri_en": "Overdue",
     "title_en": "Dev-Source (Kristine) · 17 days of nothing since the demo",
     "why_en": "At the 7/20 demo Brody said plainly that he needs hands-on to judge it; they run competitor Thread at ~$1,000/mo. The hands-on was never provided.",
     "do_en": "Aaron to give them a working trial environment — stop sending collateral."
    },
    {
     "pri": "超时",
     "title": "The Virtual IT Department（Leonard，澳洲）· 17 天，卡在我们这边",
     "why": "客户说要先看到定价才肯试用，onboarding 单已开但没交付 —— 球在 MSPbots 这边。另有澳洲数据驻留诉求待解。",
     "do": "先给定价，再谈试用；数据驻留问题要单独给个明确答复。",
     "pri_en": "Overdue",
     "title_en": "The Virtual IT Department (Leonard, AU) · 17 days, blocked on our side",
     "why_en": "The client wants pricing before trialling, and the onboarding ticket we opened is undelivered — the ball is with MSPbots. An Australian data-residency question is also outstanding.",
     "do_en": "Give pricing first, then the trial; answer data residency separately and explicitly."
    },
    {
     "pri": "超时",
     "title": "ISG Technology（Jazz）· demo 后 39 天未 onboarding",
     "why": "6/29 demo、6/30 发过定价更新，7/20 月度例会没推进，至今 18 天无沟通，7 张 enhancement 未开工。",
     "do": "Glenn 先回告工单状态，Aaron 再谈 onboarding —— 顺序反了会被工单问题挡住。",
     "pri_en": "Overdue",
     "title_en": "ISG Technology (Jazz) · 39 days from demo with no onboarding",
     "why_en": "Demo 6/29, pricing update 6/30, the 7/20 monthly moved nothing, 18 days silent since, 7 enhancements untouched.",
     "do_en": "Glenn communicates ticket status first, then Aaron works onboarding — the other order gets blocked by the ticket backlog."
    },
    {
     "pri": "超时",
     "title": "KRS-IT（Leonard）· 50 天，诉求超出产品能力",
     "why": "Joe 要的是自动化 L1 工单和新用户开通（跑 PowerShell、加 license），要求 AI 能 act on tickets，不只是接电话。现用 Pia。",
     "do": "明确告诉客户当前 ATI 做不到，给出路线图时间点或直接标不适配 —— 挂在 15% 档没有意义。",
     "pri_en": "Overdue",
     "title_en": "KRS-IT (Leonard) · 50 days, the ask exceeds the product",
     "why_en": "Joe wants automated L1 tickets and new-user provisioning (PowerShell, licences) — the AI acting on tickets, not just answering calls. They run Pia today.",
     "do_en": "Tell the client plainly that ATI cannot do this today and give either a roadmap date or a not-a-fit call. Parking it at 15% helps no one."
    },
    {
     "pri": "超时",
     "title": "Converged Medical Solutions（Leonard）· 86 天",
     "why": "5/13 demo 后再没提过 ATI，8 场例会全在别的产品上。",
     "do": "下次例会明确问一次；没兴趣就标 Closed，把它从商机池里拿掉。",
     "pri_en": "Overdue",
     "title_en": "Converged Medical Solutions (Leonard) · 86 days",
     "why_en": "ATI has not been mentioned since the 5/13 demo; all 8 monthlies since covered other products.",
     "do_en": "Ask once at the next monthly; if there's no interest, mark it Closed and take it out of the pipeline."
    },
    {
     "pri": "超时",
     "title": "Certified CIO 超期第 13 天；My IT Crew 已开通试用；ISG 例会开了但没谈 ATI",
     "why": "Certified CIO（Crispin）：8/5 客户主动要 demo，8/18 是第 13 天，连续第 10 次复查 Glenn 日历（这次查到 9/30）全空，仓库仍无 emails/ 目录。My IT Crew（Kristine）：8/17 的 demo 开了，当场开通 14 天试用并给号，档位 15%→35% —— 本轮唯一一条真正往前走的商机。ISG Technology（Jazz）：8/17 21:00 的月度例会开了，但按 Fathom 摘要全场是 NextTicket 与 SOP Agent，ATI 一句没提，7 张未开工的单第二次被无声放过。Unity IT（Aaron）：8/17 Kip 当面说 \"I don't know that we're ready to give that a go\"，本轮由 90% 降到 55%，需要复核。",
     "do": "Certified CIO 已经不该再由 Crispin 一个人扛，请主管直接指定时间或明确放弃；My IT Crew 在试用窗口内主动约一次跟进，并先把两个 gap 落成工单；ISG 今天补发工单状态邮件，并把 ATI 写进下次月度议程；Unity IT 请 Aaron/Glenn 复核 55% 这个判断，同时查清为什么 8/12 的上线通报在客户那里等于没发生。",
     "pri_en": "Overdue",
     "title_en": "Certified CIO is 13 days overdue; My IT Crew is on trial; ISG met but did not discuss ATI",
     "why_en": "Certified CIO (Crispin): the client asked for a demo on 8/5; 8/18 is day 13 and a tenth consecutive check of Glenn's calendar — this time out to 9/30 — is empty, with still no emails/ folder in the repo. My IT Crew (Kristine): the 8/17 demo went ahead, the 14-day trial was enabled on the call and a number issued, moving them from 15% to 35% — the only opportunity that genuinely advanced this run. ISG Technology (Jazz): the 8/17 21:00 monthly took place but per the Fathom summary it was all NextTicket and SOP Agent, with ATI never raised and seven untouched tickets passed over a second time. Unity IT (Aaron): on 8/17 Kip said to his CSM's face, \"I don't know that we're ready to give that a go\" — cut from 90% to 55% this run, pending review.",
     "do_en": "Certified CIO should no longer rest on Crispin alone — a manager assigns a time or the opportunity is dropped. For My IT Crew, book a follow-up inside the trial window and log the two gaps as tickets first. For ISG, send the ticket-status email today and put ATI on the next monthly's agenda. For Unity IT, Aaron/Glenn to review the 55% call and work out why the 8/12 delivery update never registered with the client."
    }
   ],
   "role_en": "CSM → Aaron / Glenn",
   "subtitle_en": "Handoff latency on pipeline opportunities",
   "owners": [
    {
     "name": "Aaron Ver",
     "email": "aaron.ver@mspbots.ai",
     "initials": "AV",
     "slug": "aaron"
    },
    {
     "name": "Glenn Bugtong",
     "email": "glenn.bugtong@mspbots.ai",
     "initials": "GB",
     "slug": "glenn"
    }
   ]
  }
 ],
 "openQuestions": [
  "【本轮新增 · TeamLogic IT (LBMH)：客户说「可能会砍掉 AI」，这句到底算不算流失，需要人去要一个答复】2026-08-27 CSM 月度例会的 transcript 已逐字读过（Fathom recording 177487569 / https://fathom.video/calls/800061413）。Randall Wilson 三句原话：\"The whole AI usage thing that I am considering getting rid of because I'm not using it. The voice thing I'm not using.\"；\"we're not moving away from the platform. We're just going to probably just going to move away from the AI part of the platform. Unless you guys got something super fancy that I don't know about coming down the pipe.\"；\"as far as the AI stuff, like I said, might just end up removing that. I'll let you know.\" 本轮的判定是：不降档，仍 35%，状态由「温」改「风险」。理由是阶梯里 lost(0%) 要求「明确拒绝」，而这三句都是倾向而非决定，他还自己留了改变主意的条件 —— 按 Valeo 那一课，证据要支撑判定本身，不能把倾向读成拒绝。请人做两件事：① 由 Jazz 在下一次接触时拿到一个是/否，拿到之后按 runbook 第 3 条填 rejection（channel / date / who / 逐字 quote / ref）再降到 0%；② 同一场里有一件是明确的：sales intake 用例被当场否掉（\"my sales guy does not want AI answering the phone at all for his incoming calls\" / Jazz \"So we're going to put that off the table now, the sales intake.\"），而这家从 7/24 起唯一的用例就是 sales intake。请判断这家还留不留在 ATI 线上。",
  "【本轮新增 · CIO Landing 8/28 主动要求延长试用，我方无人回复，且到期日我们自己也不知道】2026-08-28 20:41 UTC German Dopazo 的原话（Outlook 原件逐字读过）：\"knowing our trial is ending soon, may we please extend it so that we may have more time to keep on testing this? As you'll hear on my first recording from these tests, the bot nailed exactly what needed to be done.\" 到 8/29 本次生成时仍无回复。三个需要人的点：① 试用的确切到期日不在这封信里，看板也无从推断 —— 请 Glenn 确认到期日；如果落在 9/3（下一次实际接触）之前，必须在 9/3 之前答复，否则客户会在无人答复的情况下断掉。② 延不延是商务决定，不是看板能替的。③ 同一封信里的 5 通复测结果需要有人认领：TEST 4「unable to find open ticket」与 TEST 5「Stuck on a loop, unable to cancel adding a note, looked up a ticket it wanted instead of listening to me requesting to put in a specific ticket number」指向的是 8/18 上线的工单查询更新流（AST-18103），不是 8/25–8/26 新上的四项 —— 请判断是回归还是既有缺陷，以及要不要新开单。录音客户已直接发到 Glenn 邮箱，需要有人真的听过再下结论。",
  "【本轮新增 · Keeran Networks 首次定档 15%，请复核，并确认 SMS 这件事要不要提前讲】这家是本轮新建的条目，依据是 2026-08-27 Leonard 的会后 recap 邮件原件（emails/keeran.ca/2026-08-27_...，正文已读）：OpsGenie 停用，Decisions 里写着 \"Plan to migrate off OpsGenie toward AI Phonetic for after-hours alerting and on-call rotation.\"，我方待办是 Glenn 发 ATI 说明并搭测试环境、\"No date set\"。定 15% 的理由是没有任何配置凭证。请人复核三件事：① 15% 是否合适 —— 这是新条目的首次定档；② ATI 的推进被续约卡着（同场主线是 Pro bundle 降到 BI-only），推进顺序请 Leonard 与 Glenn 对一下；③ SMS：recap 的 Open Questions 第一条就是 \"SMS support for AI Ticket Intake (currently Teams/email only)\"，而 SMS 至今没有时间表。Unity IT 正是卡在 SMS 上停测的（AST-20757 是其 go-live blocker，AST-21144 依赖 SMS）。请决定是现在就把「Teams/邮件有、SMS 没有」讲清楚，还是等测试里被发现 —— 这一条不是看板能替人做的判断。",
  "【本轮新增 · 数据层缺口，非判定问题：ciolanding.com 的 8/26 与 8/28 两封信没有同步进仓库】本轮的 CIO Landing 证据（Glenn 8/26 16:28 UTC 的四项上线通报、German 8/28 20:41 UTC 的五通复测回信）都是直接从 Outlook 读的原件，但 emails/ciolanding.com/ 下目前只到 2026-08-27 那封取消信，8/26 与 8/28 两封都不在。影响是具体的：看板的「回告」列是用 emails/<domain>/ 的文件名日期推「上线之后第一次对客接触」的，缺了 8/26 这一封，8/25–8/26 上线的三张单（AST-21421 / AST-21493 / AST-21419）在页面上会显示成上线后没有对客沟通，而事实上有。这属于每日 sync 的范围、不是判定层，本轮没有手工补写文件。请确认 sync 为什么漏了这两封。",
  "【本次新增 · KRS-IT 的「举手」问题有了答案，但定价问题没人回】上一轮（8/25）留的问题是：Aaron 8/19 那封信开头写 \"Thanks for raising your hand for AI Intake\"，而客户方 8/24 的措辞还在评估要不要试 —— 这两句到底是不是一回事。8/25 13:01 UTC Kevin Obello（Operations Manager）的回信把客户这一侧补齐了：\"AI Intake for Afterhours would be nice to try out. I'm not too fond of our current answering service since the CW integration isn't great.\"（Outlook 原件逐字读过，Grace 在 Cc）。结论是：现在客户方确有明确的试用意愿，但那是 8/25 才出现的，8/19 发信时的「raising your hand」依据仍未见到 —— 上一轮那条口径问题只对 KRS-IT 这一家算部分解决，另外三家（Certified CIO、The Virtual IT Department、Converged Medical Solutions）的依据仍需确认。档位没动（仍 15%），因为没有任何开通凭证。真正需要人做的是同一封信里的两件事：① Kevin 直接问了 \"I'm not sure how the pricing model works but if it uses the credit model as the other AI modules, we could fit it into our stack.\" —— 截至 8/26 01:20 复查 Outlook，MSPbots 一方零回复。这是一个客户主动问价、我们没接的口子。② 他同时给了量：\"we don't get a lot of afterhours service calls—less than 10-30 afterhours service calls per month.\" 请有人判断：这个量级配现行 $199/月 + $0.50/分钟 是否成立，以及这家是否值得投一轮 onboarding。这两条都不是看板能替人决定的，因此原样留在这里。",
  "【本次新增 · CIO Landing 8/24 的周会是我方推掉的，四个对客 ETA 因此没有中途检查点】这一格 8/25 复查时已经从 Glenn 日历上消失，emails/ciolanding.com 下也没有任何 Canceled 邀请 —— 按 runbook 的口径本该记成「无记录 + silent」。但 Outlook 原件把它讲清楚了，所以本轮判为「已取消」并写明原因：2026-08-24 18:17 UTC Glenn 主动提出改期，理由是 \"I don't have any substantial updates to share yet since the team is still finalizing the work\"；18:27 UTC Ignacio Colombo 书面同意 \"Sure Glenn, we can reschedule for next Friday, same time if that works for you.\"；18:31 UTC 新邀请发出，日历上出现 8/28 20:15。请人复核两件事：① 这种「我方改期 + 客户书面同意」应该记「已取消」还是新开一个状态（比如「改期」）？按现在的记法，它和客户拒绝、和 Glenn 漏发邀请在格子上是同一个颜色，语义其实完全不同。② 更要紧的是交付：8/20 那封信对客承诺了 Caller-ID Aug-24、Smarter Escalation Aug-25、ConnectWise 格式 Aug-26、工单号验证 Aug-27，四个日期现在全部落在 8/17 与 8/28 两次会议之间，没有任何对客检查点。8/25 复查 ClickUp：承诺 Aug-24 的 AST-21420（86e2r5f6g）自身仍是 new，Aug-25 的 86e2r5fha 仍在 in development，AST-21493（86e2u6nzw）的 due 已被从 8/24 推到 8/27。请确认 8/28 那场是逐项对账，而不是又一次「还在收尾」。",
  "【本次新增 · KRS-IT 回信了，但「举手」这个说法可能站不住】2026-08-24 19:55 UTC Josiv Krstinovski 回复 Aaron 8/19 的 2 周试用邀请，全文三句：\"Hi Aaron, Adding Kevin and Josef on this. @Kevin Obello @Josef Muertegui Please review and see if this is something we are interested in trialing out?\"。本轮据此没有升档（仍 15%）—— 转交同事评估不等于要试用，更不等于阶梯 35% 要的「intake app 已配好、号码已发出」。需要人判的是口径：Aaron 那封信开头写的是 \"Thanks for raising your hand for AI Intake\"，暗示是客户主动来要的；而客户方自己的措辞是还在决定要不要试。请确认 8/19 那批四封试用邀请（Certified CIO、KRS-IT、The Virtual IT Department、Converged Medical Solutions）里，「raising your hand」是有具体依据的，还是模板话术 —— 如果是后者，这四家在漏斗里的口径都要跟着重新看一遍。另外这家的原始诉求（自动跑 PowerShell、开新用户、改密码）本来就超出 ATI 能力，即使试用真开了，能证明什么仍然没有人回答。",
  "【本次新增 · Mainstream：客户把设计决定给了，但那张单还是 new · 另外 emails/ 同步缺口仍在】① 2026-08-24 13:53 UTC Tim Brown 回信选了通话时长告警的处置方式：\"I’d lean towards Option A or Option C versus having it automatically terminate the call.\"（A＝仪表盘标记，C＝人工挂断按钮，不要 B＝AI 自动挂断）。上一轮看板把「等 Tim 选一个方案」列为 AST-21625 停在 new 的理由，这个理由现在没有了，但 8/25 复查该单（86e2wt01r）仍是 new、无负责人、无 due date，而同批的 AST-21626、AST-21627 都在 in development、due 8/26。请给 AST-21625 一个负责人和日期，或者说明为什么不做 —— 客户已经把球踢回来了。② 顺带请确认 AST-21628（86e2wt0cy，语音抢话/延迟，Tim 亲口说的唯一 potential deal breaker）为什么至今仍是 new。③ emails/ 同步缺口这一轮仍然存在，而且比上一轮更明显：本轮用 Outlook 读到的三封对客往来 —— Tim Brown 8/24 13:53、Ignacio Colombo 8/24 18:27、Josiv Krstinovski 8/24 19:55 —— 在 emails/<domain>/ 下都没有对应文件（同一天 Glenn 18:31 那封 CIO Landing 邀请倒是同步进来了）。「客户是否已被回告」这一列是按 emails/ 的文件名日期算的，所以这是会静默影响判定的输入缺口。本轮同样没有手工补文件（emails/ 是同步产物，不属于判断层，手改会掩盖 sync 本身的问题）。当前影响可控：Mainstream 最近一次对客邮件按 8/20 算是 5 天、CIO Landing 按 8/24 算是 1 天，两家回告判定都不变。",
  "【本次新增 · VIP IT 是 ATI alpha 租户，却完全不在本看板上，请判要不要收进来】本轮 8/14–8/24 十天窗口里唯一的新证据是 emails/vipitinc.com/2026-08-22_Re- Rob Miller and Micus Zhang (scheduling).md（6 封，8/22–8/23，已逐字读过）。先说清楚它不构成改档依据：全文只有排期，Rob Miller（CEO）原话是 \"Correction. Apologies. Let's do PT 16:00 on Thursday.\"，David Hu 8/23 01:17 UTC 回信要求推迟到 17:00 PT，Rob 01:51 回 \"The timing should work for both of us. Thx\" —— 零句 ATI 产品内容，所以本轮没有据此新建客户、也没有动任何档位。真正的问题是覆盖面：VIP IT 有 ATI 历史。emails/vipitinc.com/2026-07-06 那封 Glenn 的信写着 \"we haven't heard from you in a while regarding your MSPbots AI Ticket Intake Alpha trial\"，并通知 \"Your dedicated test number will be decommissioned in 3 days unless we hear from you.\"，该线程只有这 1 封、客户从未回信；report/2026-07-26_ATI-Alpha-Retrospective 则把 VIP IT 列在「缺前置功能」那一档，理由是 \"financial clients — caller identity must be verified before any troubleshooting\"，外加 API 执行能力。也就是说这是一家试用期内静默流失、且流失原因已经写进复盘的 alpha 租户，而本看板 25 家客户里没有它。请判三件事：① VIP IT 该不该作为 0%（静默流失）收进 alpha 轨，还是本看板刻意只收有过周会节奏的租户？② 若要收，需要一封客户方的书面确认才能定 0% —— 7/6 那封是我方发出的、客户没回，按本看板口径不算客户拒绝；③ 8/27（周四）Rob 与 Micus / David Hu 那场会如果谈到了 ATI，请把它当成复活接触上报，不要等下一轮邮件同步。另记一条不入板的判断：Fathom 上 8/19 的 CTMS（Centric Technology Services）CSM 周会里排了一场未来的 Ticket Intake 演示，但那是我方主动提出要演示、客户没有提出任何 ATI 需求，不满足商机轨「客户在 CSM 例会上明确浮现 ATI 需求」的口径，因此没有收进来 —— 若要放宽口径请明示。",
  "【本次新增 · Layer 7 又多了两格「应排未排」，这条节奏是不是该判死】8/22 复查 Glenn 日历（Intake 全文查 8/20–9/7，14 场逐条读过），没有任何一场是 Layer7Systems，因此 8/28 与 9/4 也记为「应排未排」，连同 8/14、8/21 一共四格。这家最后一次真开会是 7/17，此后 7/24 取消、7/31 与 8/7 无记录、8/14 起邀请就没再发过。现在的问题不是「Glenn 漏发邀请」而是「这家还算不算在跑」：8/7 Glenn 已在内部 Teams 说过 \"Layer7Systems will not move forward with AI Ticket Intake.\"，但按本看板口径 Teams 不作为证据，emails/layer7systems.com 最后一封是 8/3 的 paywall 通知，客户方没有任何书面拒绝。请 Glenn 二选一：① 拿一封客户书面确认过来，这家改判 0%，节奏停掉、四格「应排未排」一起撤；② 若还想救，就把周会重新发起来 —— 现在这样挂着，看板每周会自动多长一格空白。",
  "【本次新增 · builder 补了五个此前漏映射的状态，请复核这个判断】builder 的状态→桶映射里原本没有 for qa、in testing、6a - in dev、6b - dev done、da in progress 这五个状态，未映射的状态会落进「未开始」桶。本轮 AST-18104（86e0za1dv）从 in development 变成 for qa，正好踩到这个洞：一张往前走的单会在看板上倒退成「未开始」，而且挂在它下面的 AST-20803、AST-21492 会失去载体、从「进行中」退回「新」。因此本轮把这五个状态都映射为「进行中」。影响：「已交付」桶 48 张不变，本表 42 条上线日期不变，「进行中」从 15 张变成 17 张（新进的是 86e0za1dv 与 86e1kj33g / AST-19323 Big Fish 的 PIN 校验，两张都是 for qa）。还剩一个没动的：blocked（7 张，其中 AI Voice Reliability Issues、Long Silence gaps、CIOLanding Systems Interrupts 三张是客户可见的）。blocked 现在仍然落在「未开始」—— 说少了；但映射成「进行中」是说多了。这一档该怎么显示请人来定，本轮没有替它做决定。",
  "【本次新增 · The Virtual IT Department 的回信怎么算，请判一次】8/21 03:46 UTC Matt Tierney（IT Manager）回了 8/19 的试用邀请，全文只有三句，关键那句是 \"At this stage, I'm aware that Liam and the team are already investigating this as we speak. So I will leave it to them to do the initial investigations and report back on their findings.\"本看板判为「礼貌推回」，档位维持 15%，理由是：没约 demo、没答 Aaron 问的两个问题、没有号码也没有配置，但也没有任何拒绝措辞。请 Aaron/Leonard 确认两件事：① Liam 那边真的在 investigating 吗？如果是，谁在跟、什么时候 report back？② 7/21 客户要的定价与澳洲数据驻留，到今天为止有没有给过书面答复？如果两件都没有，这家的 15% 是虚的 —— 它不是在推进，只是没说不。",
  "【本次新增会议 · Mainstream 8/19 已开，档位不动，请核对口径】Mainstream Technologies 加了一场 2026-08-19 19:30 UTC 的「已开」，但那是 Leonard Narvaza 的 Autotask 迁移例会，不是 ATI 周会 —— Glenn 中途加入做了约 16 分钟 ATI 演示（transcript 逐字读过，Fathom 789331110）。收进来的理由是会上确实谈了实质的 ATI 商务内容：成本与现用呼叫中心「dollar for dollar the same」、月付 POC 无需 12 个月合约、CISO 与 leadership 的内部审批路径。档位仍判 90% 而非 100%（没有订阅/账单）也非 75%（电话从未转发）。如果你认为「客户口头说要买一个月」应当视为成交前的另一档，请在这里改口径。",
  "【本次新增两格「应排未排」，请确认是不是有意停会】Metro Sales 的周四 14:30 周会在 Glenn 日历上只剩 8/20 一场：8/20 用参会人与全文两种方式查了 8/20–9/30，8/27、9/3 都不存在，也没有取消邮件（按本看板口径，单次取消会被 Outlook 直接删掉，只能靠邮件重建，而邮箱里没有）。因此 8/27 与 9/3 记为 noinvite。这家判在 90%、Glenn 自己写过「转接 bug 是付费前的最后一个 blocker」，周会却在下一场之后断掉 —— 请 Glenn 确认是谈完 bug 就不再需要周会，还是单纯漏发。",
  "【本次新增 · 4 家 15% 客户同日收到试用邀请，请盯回信】2026-08-19 20:51–20:55 UTC，Aaron Ver 在 4 分钟内给 Certified CIO（elamdin@）、KRS-IT（josiv@）、The Virtual IT Department（matt.tierney@ / roy.mulia@）、Converged Medical Solutions（paul@）发出同一封 \"Let's get you set up with AI Intake — quick 2-week trial\"，Grace 均在 Cc，原件已读。四家档位本轮都不动（15%）—— 信里承诺的是「将开通 2 周试用」，不是已开通，而 35% 要的是 intake app 已配置、号码已发出。请注意两件事：① 信里 \"Thanks for raising your hand for AI Intake\" 对 Converged Medical Solutions 存疑，这家 5/13 之后 8 场例会没再提过 ATI，需要确认这句的依据；② 一旦任何一家真的开通，请把凭证留下，看板会据此升到 35%。",
  "【本次最重要，请补证据后改档】EstesGroup 可能已经成为 ATI 的第一个付费客户，但看板本轮维持 90%，没有升到 100%。依据与限制如下：① 2026-08-13 02:30 UTC 的内部 Product-Platform L10（Fathom 780677829，纪要 meetings/internal/2026-08-13-Product-Platform-L10.md，取自逐字 transcript）显示当时这一单还没成交，而且差点因为报价口径不一致丢掉 —— Glenn 原话 [46:52]：\"I sent out a follow-up asking their sentiment on the pricing, based on our initial pricing — $199/month including 200 minutes… But we shifted to the credit base… The AI ticket intake is 6 credits per minute, so $199/1,000 credits is only around 166 minutes — way down from the 200 minutes mentioned earlier.\"，Daniel 的评价是 \"this kind of stuff kills the deals.\"；会上决定做一个不公开的 $1.99 / 1,200 credits 套餐、等客户确认后在后台开通。② 同日 10:56 UTC Glenn 在内部 Teams 宣布 \"EstesGrp.com has become our first paying customer for AI Ticket Intake\"。**按本看板口径 Teams 不作为证据**，而 ClickUp 与 Outlook 里都查不到订阅记录或账单，Bill 本人 8/12 之后也没有再来信。请补一份可采信的凭证（MarketPlace 订阅记录 / Accounting 的账单 / Bill 的书面确认）中的任意一份，拿到即把这家改为 100%（阶梯的 100% 是「已付费」）。顺带一提：如果属实，这是 ATI 的第一单，值得单独记一笔 —— 但也正因为是第一单，更不能靠内部庆祝入账。（8/15 复查：仍然没有凭证。Outlook 里 8/12 之后没有任何 estesgrp.com 来信，Chargebee 8/12–8/14 的每日报表与首次开票提醒里都没有这家（8/12 那条是 cytek-itops），ClickUp 侧也无订阅记录 —— 内部宣布成交已过 2 天，档位继续维持 90%。另外提醒：试用 8/17 到期，只剩 2 天，套餐仍等着 Bill 自己去 MarketPlace 点。今天要么补凭证、要么先延期，别让「已宣布成交」和「试用断档」在同一周发生。） （8/19 复查：仍然没有凭证 —— Outlook 里查不到 EstesGroup 的订阅、账单或收入提醒，ClickUp 侧同样没有；试用已于 8/17 到期，而 8/18 Bill 的回信正文只有 \"So, about that.\" 加截图，读不出是好消息还是坏消息。档位继续维持 90%，理由从「没有凭证」变成「没有凭证，且客户态度不明」。）",
  "【本次新增会议 · Metro Sales 8/13 已开，请核对口径】Metro Sales 8/13 14:30 的周会由「未来排期」改为「已开」（Fathom 781050095），客户方 Dan Olsen、David Ulbrich、James Eubanks 三人全到，是 6/18 以来第一次。档位不动，仍为 90%。会上把唯一挡在付费转化前面的问题定位清楚了：AI 把 Metro Sales 的 Zoom auto attendant 当成语音信箱，接通瞬间挂断。Glenn 当天 17:15 UTC 的纪要邮件（正文已逐字读过）写的是 \"We confirmed that this is the final blocker before moving forward with the paid plan.\" 请核对两点：**① 这是不是应该直接推动升档？** 一家在书面纪要里被确认「只差这一个 bug 就转付费」的客户，和一家还在纠结价格的客户，不该是同一个 90%；但阶梯的 100% 是「已付费」，没有中间档，所以本轮维持不动。**② 这个 bug 与 Valeo 的 AST-20255 是同一个失败类别**（转接遇 auto attendant 被误判为语音信箱），那张单自 6 月起一直是 in development。Valeo 已经因为转接问题走了，Metro Sales 正卡在同一个地方 —— 请确认这两张单是不是同一个修复，别再各修各的。另注：本条取自 Fathom 摘要 + Glenn 的纪要邮件（邮件正文逐字读过），未逐字读 transcript。",
  "【本次新增会议，请核对口径】ACTS360 加了一场 2026-08-12 的「已开」—— 但那是 Jazz Laban 的 CSM 月度例会（Fathom 781056252，参会人只有 Joshua Mejia 与 Jazz），不是 ATI 周会；ATI 周会自 7/7 起没再开过。收进来的理由是会上确实实质谈了 ATI：Jazz 给了更新后的档位（Basic $399/月 3,000 credits、Starter $699/月 7,000 credits，credits 在 Ticket Intake 与 TicketQA 之间通用），Joshua 提出真正的阻力是 ROI —— 他们没有面向客户的 SOP/知识库，AI 无法自主解决问题，ATI 就只剩接电话建单路由，省不下人力。两点请复核：**① 这一场该不该占 alpha 轨的格子。** 轨道定义是 ATI 周会节奏，把 CSM 例会画进去会让 ATI 的会议卫生数字偏乐观。**② 它对「已回告客户?」列的副作用。** ACTS360 正是 AST-20245/20246/20247 的原始提出方，三张单 8/6–8/7 上线，而这一场里一句都没提到；加了这场会之后，这三张单会显示为「上线后已有接触」。按 told_note 的口径这没错（证明的是接触发生过），但别把它读成「已经回告」。另：本条内容取自 Fathom 摘要，未逐字读 transcript，因此没有用于任何档位判定，ACTS360 仍是 90%。",
  "【本次新增客户并直接判 0%，请复核】Capstone Works（Chuck Adams、Cindy Adams，CSM: Kristine）作为新条目加入商机轨，档位 0%。依据是 2026-08-11 的会议 Fathom 778774350「MSPbots Product Demo with Glenn」（Grace 在参会人里），transcript 已逐字读过：Glenn 确认工单在通话结束后才创建，Chuck Adams 回 \"So that takes the usefulness of this application to near zero.\"；Glenn 问 \"with that feature, that's our one deal breaker for you, Chuck, Cindy?\"，Cindy Adams 答 \"That's a huge deal breaker.\"，Chuck 接 \"we can't use this.\"；收尾时 Cindy 说 \"probably not the right time for this product for us.\"。请复核两件事：**① 这家该不该上本看板。** 商机轨的定义是「ATI 需求在 CSM 的固定例会里浮现」，这一场是 Kristine 组织的 onboarding/介绍会，ATI demo 是会中临时加进去的 —— 与 RedHelm（新客开发会，未收录）不同的是，Capstone 已经装了 app、开了号码、开了 14 天试用、客户当场打了测试电话，参与深度和 Parachute Techs（一次性 demo 后流失，已在板上）相当。**② 0% 的判定。** 拒绝是在会上口头做出的，没有拒绝邮件；仓库里也没有 emails/capstoneworks.com 目录。唯一的旁证是 8/11 内部 Teams 的「remove their number」，按口径不作为证据。另注：这家是正在 onboarding 的付费客户，ATI 流失 ≠ 账号流失。",
  "【流失信号，未核实，未改档】2026-08-11 的内部 Churn Review（Fathom 779618229，参会人 Daniel Wang、Jazz Laban、Anushree Fomra、Crispin Casipit、Kevin Sebastian，没有任何客户方参会人）在收尾时把 Impact Group 定为下一个要复盘的流失案例 —— 那一场实际只复盘了 TwentyFour IT，Impact Group 被推到了下一次会。按口径这不能作为改档依据（内部会议、二手、且案子还没复盘），所以 Impact Group MN 的 15% 本次不动。但这家 ATI 侧已经 90+ 天零接触，如果 MSPbots 账号本身在流失，ATI 这条线就不该继续挂在 15% 空转。请在那场复盘开完后给个结论。",
  "【已解决，留档】EstesGroup 的 90% 上一轮是从 Bill McCord 8/10 那句 \"Got it past the high hurdle\" 推断出来的，当时留的疑问是「Bill 没有明说 the high hurdle 就是领导层签字」。2026-08-12 16:07 UTC 他自己把这个疑问关掉了 —— 同一线程的回信（Grace 在 Cc，正文已逐字读过）开头就是 \"Approvals are in place, is there any contract work to do here?\"，并补充 \"I have given MSPBots permission to create a ticket (that's it, no delete, modify, etc.) and tested.\" 与 \"Looking into how to get AITI to call our tech hotline when handoff is needed.\"。Glenn 同日 17:06 UTC 回复：不需要签新合同，走现有协议，唯一剩下的动作是到 MarketPlace 选 AI Credit Subscription 套餐，选完即生效，并把 Accounting 拉进线程。档位维持 90% 而不是 100%：阶梯的 100% 是「已付费」，套餐还没选、账单还没产生。请复核的只剩一件事 —— 试用 8/17 到期，而套餐要等 Bill 自己去点，这两件事撞在一起需要有人盯。",
  "【本次升档，请复核】Mainstream Technologies 由 55% 升到 90%。依据是 2026-08-07 19:53 UTC Tim Brown 的回信（RE: AI Ticket Intake MVP & Pricing Feedback，Grace 在 Cc；Outlook 原件与归档件 emails/mainstream-tech.com/2026-08-07_Re- AI Ticket Intake MVP & Pricing Feedback (Tim - pricing works, new asks).md 已交叉核对）：问「定价可行吗」答 \"Yes, this would work for me to move forward with on an after-hours basis.\"，问「正式收费后是否订阅」答 \"Yes, permitting the already reported problems and issues we've faced are resolved prior to full launch of the product/service.\" 请判断：这种「附条件的订阅意向」算不算 90% 的商务讨论？反对意见是这家从未接入真实来电、call forwarding 的语音信箱卡死问题还在，而且 11/1 之前都在做 PSA 迁移；参照口径 EstesGroup 被保守地压在 55%，但那家跟我们并没有谈过价，Mainstream 谈了。",
  "【重要，但证据不足以改档】Layer 7 Systems 可能已经流失，本次没有动它的 55%。2026-08-07 10:24 Glenn 在内部 ATI Teams 群里写 \"Hi Grace Guo Daniel Wang - To update, Layer7Systems will not move forward with AI Ticket Intake.\"，11:48 又附了一份 layer7-status-report.html 复盘。按本看板口径这条不能直接采信：Teams 不作为证据，且这是内部转述而不是客户原话。已查过的客户侧渠道全是空的 —— emails/layer7systems.com 最后一封是 8/3 的 paywall 通知（Jacob 未回），Outlook 里 7/25 之后没有任何 layer7systems.com 来信，Fathom 自 7/28 起搜不到任何 Layer7 场次，8/7 的周会没有录像也没有纪要。请 Glenn 给出客户侧书面依据；一旦拿到就改 0% 并补 rejection。在那之前 8/14、8/21 的补邀请动作已暂停。（8/12 再查一遍，四个渠道依旧全空：Glenn 日历到 8/25 为止没有任何 Layer7 周会邀请，Outlook 里 layer7systems.com 自 7/20 以来无任何来信，Fathom 8/7 以来无新场次，仓库里 emails/layer7systems.com 最后一封仍是 8/3 的 paywall 通知 —— 沉默已进入第 6 天。连续 5 天四渠道全空，本身就该当成一个结论：要么客户真的走了、要么 Glenn 那条内部通报没有客户侧依据，两种情况都需要他给个说法。）（8/13 第 6 次复查：四个渠道仍然全空 —— Glenn 日历到 8/26 为止没有任何 Layer7 场次，Outlook 里 layer7systems.com 自 7/20 起零来信，Fathom 自 7/27 起搜不到任何 Layer7 场次，emails/layer7systems.com 最后一封仍是 8/3 的 paywall 通知。客户侧沉默第 10 天，连续 6 天四渠道全空。这条不该再靠每天复查往下拖 —— 请 Glenn 本周给出客户侧依据，或者明说那条内部通报没有依据。）（8/14 第 7 次复查：四个渠道仍然全空 —— Glenn 日历到 8/28 为止没有任何 Layer7 场次，Outlook 里 layer7systems.com 自 7/20 起零来信，Fathom 自 7/27 起搜不到任何 Layer7 场次，emails/layer7systems.com 最后一封仍是 8/3 的 paywall 通知。客户侧沉默第 11 天，连续 7 天全空。本轮起停止逐日复查 —— 再查七天也不会变出证据。请 Glenn 本周内给出客户侧依据；若给不出，建议下一轮直接把这家标为「不再跟进」，而不是继续挂在 55% 让它污染平均档位。）（8/15：逐日复查已停，但顺手查了两个最便宜的渠道，结论不变 —— Outlook 里 layer7systems.com 自 7/20 起零来信，Glenn 日历到 8/23 为止没有任何 Layer7 场次，客户侧沉默第 12 天。请 Glenn 本周内给出依据，否则下一轮标为「不再跟进」。）",
  "【与「已流失」矛盾，请确认】Precicom 在本看板判为 0%（Martin Rodrigue 7/24 邮件拒绝付费订阅），但 Glenn 的日历上有一场 2026-08-18 17:00 的 \"MSPbots Product Demo with Glenn\"，参会人正是 martin.rodrigue@precicom.com 和 billyd@precicom.com。会议标题是通用产品 demo，看不出是不是 ATI，也没有对应的邮件线索。请确认：这是 ATI 的重启接触（那 0% 就该复议），还是另一条产品线（NextTicket / Ticket QA 等）的独立商机？（8/12 复查：这一场仍在 Glenn 日历上，参会人未变。）（8/13 复查：这一场仍在 Glenn 日历上，但受邀人扩大了 —— 除 martin.rodrigue@precicom.com、billyd@precicom.com 外，新增了 Micus Zhang、Jazz Laban 与 product@mspbots.ai。Micus 是 SOP Agent 的负责人，这一点让「这场大概率不是 ATI」更站得住，但仍然只是推断，需要 Glenn 一句话确认。）（8/14 复查：这一场仍在 Glenn 日历上，时间 8/18 17:00 UTC，受邀人未变 —— martin.rodrigue@precicom.com、billyd@precicom.com、Micus Zhang、Jazz Laban、product@mspbots.ai，Glenn 是组织者。还有 4 天就开，这条不能再拖着不问。）（8/15 复查：这一场仍在 Glenn 日历上，8/18 17:00 UTC，受邀人一字未变 —— martin.rodrigue@precicom.com、billyd@precicom.com、Micus Zhang、Jazz Laban、product@mspbots.ai，Glenn 是组织者。还有 3 天。这条已经连续 4 轮原样复查而无人回答：一家在本看板判为 0% 的客户后天要开产品 demo，要么它是 ATI 的重启接触（那 0% 必须复议），要么它是 SOP Agent / 其他产品线（那就与本看板无关，但也该写明）。请 Glenn 一句话定性。）（8/17 复查，明天就开：本轮再查 Glenn 日历 2026-08-13→09-01，这一场仍在，8/18 17:00 UTC，受邀人一字未变 —— martin.rodrigue@precicom.com、billyd@precicom.com、Micus Zhang、Jazz Laban、product@mspbots.ai，Glenn 是组织者，isCancelled=false。这是这条问题还能被提前回答的最后一轮：明天之后只能事后补记。请 Glenn 今天给一句话 —— 是 ATI 重启接触（那 0% 必须复议），还是 SOP Agent / 其他产品线（那就写明与本看板无关）。若今天仍无人定性，下一轮请改为会后按录像/纪要定性。）（8/18 复查，就在今天）这场 2026-08-18 17:00 UTC 的「MSPbots Product Demo with Glenn」仍在 Glenn 日历上，isCancelled=false，受邀人是 martin.rodrigue@precicom.com 与 billyd@precicom.com（客户方新增了 Billy D，7/24 写拒信的 Martin 仍在），我方 Glenn、Micus Zhang、Jazz Laban、product@。也就是说一家判在 0% 的客户今天下午还有一场我方组织的 demo。本轮仍不动档位、也不在格子上新增会议 —— 会还没开，日历上的「产品 demo」也看不出是不是 ATI。但这是最后一次能在会前把问题问清楚的机会：请 Glenn 在会前一句话说明这场是不是 ATI 的重新接触；如果是，明天这条就该变成一次真实的改档判断，而不是事后倒推。",
  "【范围问题，已结案 —— CIO Landing 本轮收进 alpha 轨，请复核定档】这条从 8/7 挂到今天，共 12 天。本轮的触发点是把上周（8/10–8/18）Fathom 上 70 场录像逐场对了一遍板上的格子：唯一没落到板上的客户面 ATI 会议就是 CIO Landing 的 8/10 与 8/17 两场周会，其余（Capstone Works 8/11、ACTS360 8/12、Metro Sales 8/13、Essential Tech 8/14、ISG Technology 8/17、My IT Crew 8/17、Unity IT 8/17）全部在板上。也就是说这条不再只是口径洁癖，它已经让看板对「上周发生了什么」给出不完整的答案。收进来的依据：8/24、8/31 两场周会本轮亲查仍在 Glenn 日历上（参会人 icolombo、gdopazo、mcretari、Daniel、Grace、product@ 未变）；8/17 那场 transcript 本轮逐字读过；试用已重启；客户单累计 25 张，其中 8/14、8/18 各有一次真实上线。定档 selftest(55%) 的完整推导见该客户卡片的判定证据，两处需要人复核：① 55% 是新建条目的首次定档，尤其「没有真实来电转给 AI」这一否定判断是基于「找不到相反证据」，不是基于客户明确说过没转；② ticket_scope_note 已同步改掉（原文点名 CIO Landing 为不跟踪客户），顺带把该条的数字从 8/7 的手写值 614/144 重算成 643/182，并给其余四家写明了不跟踪的理由。如果有人当初不收它是有理由的，请在下一轮之前说出来 —— 现在改动已经落地了。",
  "【载体单已上线，但诉求是否满足待确认】Essential Tech 的 AST-20984（分时段 on-call 升级排班，Nidhi 称之为 non-negotiable）link 到 AST-20245（ACTS360 分时段路由），后者 8/6 已 released & live，所以看板上它算「已交付」。但 AST-20245 的验收标准里，AC-3「时间窗内顺序拨号」和 AC-5「重叠时间窗校验」都被划掉了。Essential Tech 要的是「5 个人不要在 6 点后同时被 buzz」—— 回告之前请确认上线版本真能按时间段分派不同的人，否则会重演 Unity IT 的 SMS 情形。（8/13 全量反查再次复核：AST-20984 仍 link 在 AST-20245 下，自身状态仍是 pm in progress，未变。Essential Tech 8/14 就有周会，这是最快能当面确认的场合。）（8/14 那场开了，但这条没被解决，只是看清了一半：Glenn 演示了排班 skill —— 可以建多个 business-hours roster，每个挂一个时段/标签，时段之外落到默认的 after-hours roster。也就是说「按时段分派到不同的人」在配置层面是存在的。但两点仍未确认：一是 Nidhi 当场问「有人休假怎么办、能不能读我们在用的 Shift」，Glenn 明确答目前没有集成、只能手工改；二是 Nidhi 说她要自己去试（\"I need to check this out myself\"），到 8/15 为止还没有任何她试过的证据，而下一次见面在 9/4。因此「5 个人不要在 6 点后同时被 buzz」这个原始诉求是否真被满足，仍然没有客户侧确认 —— 而 AST-20984 自身状态仍是 pm in progress。回告前请先确认。）",
  "【继承状态后请核对】Unity IT 有 3 张单因 link 到 AST-20247 / AST-20246 而从「未开始」变成「已交付」，但 AST-20247 自己的描述写着「SMS notification：not currently supported，planned for beta」，而 Unity IT 那两张恰恰要的就是 SMS（每 5 分钟语音+短信重试、SMS/Teams 通知）。AST-21144 自己也写着「Depends on SMS notification capability — not yet built，cannot ship ahead of it」。**所以载体单上线了，但 Unity IT 的 SMS 诉求很可能没被满足** —— Glenn 8/7 已经去信说「nearly all of the deal-breaker requests」都做完了，下周还要 demo，回告口径必须先对齐，说错会直接影响这个 90% 的商机。\n\n【本次升级为紧急】8/12 Glenn 已经把话说出去了：当天 13:31 UTC 他去信 Kip，原话是 \"Which means every deal-breaker you raised is now live\"，依据是 AST-20756（time entry）当天上线、AST-20755（合约分级）转 waiting for client。但 Kip 7/28 列出的 deal-breaker 里有一条是「every 5 minutes via voice and text」的持续重试 —— 对应的 AST-21144 现在仍是 new，单子自己写着 \"Depends on SMS notification capability — not yet built, cannot ship ahead of it\"；AST-20757（SMS/Teams 通知）也仍是 new，只是 link 在 AST-20247 下才在看板上显示为已交付。**SMS 至今不存在。** Glenn 同一封信里请求本周或下周做 walkthrough —— 上会前必须把口径改成「time entry 与合约分级已上线，SMS 侧仍在 beta 排期」，否则会当场翻车，而这是一个 90% 的商机。\n\n【本次已由客户自己验证 —— 口径确实说错了】2026-08-13 17:47 UTC Kip 回信（正文已逐字读过），原话里原样重申了两条尚未交付的诉求：\"We would need an easy way to assign the on-call technician based on a schedule. Additionally, we would need the system to call the on-call technician multiple times if the initial call isn't connected (in addition to PSA, and SMS alerts).\" 对应的 AST-21143、AST-21144、AST-20757 全部仍是 new，SMS 能力至今不存在。也就是说 8/12 那句「every deal-breaker you raised is now live」发出去之后，客户第一时间就把它否掉了。这条不再是「上会前要对齐口径」的预警，而是已经发生的事实，请当作教训归档：往后凡是要说「都做完了」，先按客户原始清单逐条对一遍工单状态。",
  "【本次新增，请核对】My IT Crew（myitcrewny.com，纽约布鲁克林）作为新商机加入商机池，档位 15%。依据是 2026-08-06 的邮件：Marlene Fanini 原话 \"Do you offer an AI call triage? Meaning an answering-machine service powered by AI instead of people.\"，Kristine 当天确认并发出 Glenn 预约链接，Glenn 同日补功能清单（emails/myitcrewny.com/2026-08-06_Re- AI calls.md）；8/7 她又追问价格，Glenn 报 6 credits/分钟。请确认：这家该不该进本看板、CSM 归属是不是 Kristine、以及那张 myitcrewny.com 的 onboarding 占位单是不是本次询问之前就开的。 本次更新：demo 已排上 —— Glenn 日历 2026-08-13 17:00 UTC「MSPbots Product Demo with Glenn」，受邀人只有 yossil@myitcrewny.com（Yossi Levy），写信的 Marlene Fanini 不在受邀人里，请确认是不是漏了她。档位仍为 15%，不变。 8/13 再更新：Marlene 的问题已经解决 —— Glenn 日历上新出现一场 8/17 16:00 UTC 的 demo，受邀人是 marlenef@ 与 yossil@ 两位。但 8/13 17:00 那场仍在日历上、仍只邀了 Yossi，两场并存。请确认 8/17 是改期还是加场；如果是改期，8/13 那场要撤掉，别让客户手里握着两个冲突的邀请。 8/14 结论：这条可以收了。8/13 17:00 那一场已从 Glenn 日历上消失，Fathom 上也查不到任何 My IT Crew 场次，只剩 8/17 16:00 一场（Marlene + Yossi 都在受邀人里）。「改期还是加场」在事实层面已经有答案 —— 只剩一场，不存在两个冲突的邀请。剩下唯一要问 Glenn 的是：8/13 是我方主动改期，还是客户推掉的？没有任何书面痕迹能区分，而这两种情况对这家的热度判断完全不同。看板上 8/13 已按口径记为「无记录 · 静默」。 8/15 复查：8/17 16:00 那场仍在 Glenn 日历上，受邀人仍是 marlenef@ 与 yossil@，无新增邮件。demo 后天开 —— 请确保当场激活 14 天 / 3,000 credits 试用，并把 8/7 报的 6 credits/分钟口径与 Kristine 对齐后再上会。\n\n【8/18 更新：本次升档 15%→35%，请复核】8/17 16:00 UTC 的 demo 开了（Fathom 787854106，transcript 已逐字读过），会上当场开通 14 天试用、装好 app、接好 PSA、选定 phone intake skill 与语音、给出号码 716-271-8542，正好落在阶梯 35% 的定义上。原话见该客户的 stage_evidence。三件事请人核一下：**① 35% 而不是 55%。** 客户还没打过自己的测试电话（Glenn 说 \"you can test it already right now\"，但没有任何测试记录），所以停在 35%；如果这两天有测试通话进来，就该继续往上走。**② 两个 gap 只有承诺、没有工单。** Glenn 的纪要邮件写了 MSPbots 会跟进「动态工单状态」和「按键分流」，但 ClickUp 里这两条一张单都没有 —— 这正是 Unity IT 那次「every deal-breaker is now live」翻车的同一模式，请在客户回头问之前补上。**③ 8/13 那场到底是谁改的期，仍然没有答案。** 这条已经挂了 4 轮，8/17 的会上也没有人提。",
  "【已修正，留档】Metro Sales 8/6 由「无记录」改为「已取消」：Dan Olsen 当天 22:28 UTC 发信 \"I won't make it today. David is out and James is at a conference, so unsure of his availability.\"，Glenn 22:35 回 \"No worries!\"（emails/metrosales.com/2026-08-06_Re- AI Ticket Intake - Weekly Call w- Metro Sales.md）。7/23、7/30 两次仍无任何书面痕迹。8/13、8/20 两场周会 8/13 复查仍在 Glenn 日历上，参会人未变（8/13 那场今天 14:30 UTC 开）。 8/14 更新：8/13 那场周会开成了，且是 6/18 以来客户方三人（Dan Olsen、David Ulbrich、James Eubanks）第一次全到 —— 看板上该格已由「未来排期」改为「已开」（Fathom 781050095）。8/20 那场 8/14 复查仍在日历上。 8/15 复查：8/20 14:30 那场仍在 Glenn 日历上，客户方三人（dolsen、dulbrich、jeubanks）都在受邀人里，维持「未来排期」。本轮没有 Metro Sales 的新证据 —— 转接 bug 的修复进度、以及 James 答应提供的专用 Zoom 测试号，都还没有任何书面痕迹。",
  "【可能的新商机，未加入，且未核实】2026-08-10 21:59 UTC Leonard Narvaza 发出的邮件「Re: Quick check-in—how are things going at NuView? — Next Steps on AI Tools」里，第一项就是 AI Ticket Intake，摘要片段写着客户的条件是「tickets need to land directly on engineer calendars to be valuable for NuView」。本次只看到搜索结果里的摘要片段，没有打开整封信，也没有查 NuView 侧的会议或工单，因此不加入商机池、不给档位。请判断是否值得下一轮正式核实（要看的是：这是不是一场 CSM 例会里浮现的 ATI 需求，符不符合本看板商机轨的定义）。 8/12 补充：8/11 11:06 UTC Frank Tian 在同一线程里回了信，正文里 AI Ticket Intake 仍是第 1 项、并复述了客户那个条件。本次仍然只看到搜索结果的摘要片段，没有打开整封信，因此判断不变 —— 不加入、不给档位。",
  "【可能的新商机，未加入】2026-08-06 Nick Franco 与 RedHelm（Christopher Risher）的会上，RedHelm 明确在评估 AI Intake（Tier 0.5 自助解决）+ NextTicket，用 Halo PSA（Fathom 774019605）。没有加进商机池，因为这是一场新客开发会而不是 CSM 例会，与本看板商机轨的定义（ATI 需求在固定例会里浮现）不符。请判断是否要破例收进来。",
  "【已修正，留档】Big Fish Technology 由 15% 升到 55%：上游 tickets.json 把 486/614 张工单的 client 字段留空，导致看板一直显示它「无工单」。实际有 12 张，含 3 个真实通话中发现的 bug。会议侧 6/3 后确实停了，所以 55%（自测完成）而非更高 —— 请确认这个档位合理。",
  "同一个数据 bug 还影响了 Metro Sales（0→15 张）、Titanium.Red（1→10）、Parachute（1→10）、Mainstream（3→8）、Layer 7（2→5）、Dev-Source（1→4）等共 10 家。这些客户的「工单」「已交付」「回告」判定此前都偏低，现已重算。根因在上游生成脚本，建议一并修，否则每次刷新都要靠关键词兜底。",
  "Essential Tech 有 4 场（6/10、7/1、7/15、7/22）排了期但既无录像也无纪要 —— 是没开，还是开了没录？",
  "Valeo 7/29 和 Metro Sales 7/23 在日历上消失但没有取消邮件 —— 请 Glenn 确认当时是取消还是改期。",
  "ClickUp 导出没有完成时间戳，「已交付但没回告」只能用「距上次对客沟通天数」推断，不能确证；要坐实得逐张翻 ClickUp 的活动日志。",
  "【已留档】Precicom 由 55% 降到 0%，依据是 Martin Rodrigue 2026-07-24 的拒绝邮件（原话见 rejection.quote，Outlook 与归档件已交叉核对），Glenn 7/29 回信结案。这条流失此前从未上板，所以 7/24 以来档位一直偏高 —— 请确认之后没有复活接触，并决定那 7 张未完成工单怎么处理。（另见本次新增的 8/18 demo 疑问。）",
  "【已解决，留档】EstesGroup 之前那条「35%→55%，若算商务讨论应为 90%」的悬而未决问题，本轮已按 90% 定案 —— 依据见本列表第一条（Bill 8/10 \"Got it past the high hurdle\"）。此前压在 55% 的理由是「我方尚未与其谈价」，Glenn 8/4 的付费墙与 6 credits/分钟报价已经让这个理由失效。",
  "【已解决，留档】Essential Tech 8/7 周会上 Nidhi Patel 说 \"I haven't tested the system yet\"，当时留的疑问是「测试负责人是否换人、55% 是否还成立」。2026-08-14 的周会（Fathom 782689046，transcript 已逐字读过）把这条关掉了：Nidhi 已经亲自打过测试电话 —— \"I did some of the calls that after hours... I was trying to be a nasty customer.\" —— 并逐条给出失败细节。结论是 55% 成立，只是依据从 Michael/Simon 侧的 11 张工单换成了 Nidhi 自己的测试。同时也确认了它为什么不能更高：建单功能至今没开（需 Simon 授予 PSA 权限，Nidhi 明说质量改善前不想开），所以没有真实来电接入，也没有任何定价讨论。",
  "【本次新增会议，请核对口径】Essential Tech 8/14 01:00 的周会由「未来排期」改为「已开」（Fathom 782689046，transcript 已逐字读过，纪要 meetings/Essential Tech/2026-08-14-AI-Ticket-Intake-Weekly-Touchbase.md），档位不动，仍为 55%。三件事请人复核：**① 质量反馈的分量。** Nidhi 报的三条（抢话 + 机械音/音频拼接、两个问题只处理一个、听不懂已做过的排障）当天就开了三张单并当天上线（86e2u63ny / 86e2u63tb / 86e2u63uz）—— 上线这么快，值得确认是真修还是先关掉症状，尤其是「抢话」属于对话行为，不是一个字符串能改完的。**② 建单权限是这家的真正卡点。** Nidhi 原话 \"I don't want to do that at the moment because I really think that it needs a lot of improvement from my end\"，并问了这到底是测试环境还是生产环境。这件事要找 Simon 谈，不是 Nidhi。**③ 日历与口头约定不一致。** 会上定的下一次是 9/4 09:30，但 Glenn 日历上 9/4 没有场次、8/21 01:00 那一场却还在（8/15 复查仍在）。看板按「邀请存在即未来排期」的口径把 8/21 记为未来排期，但客户已经说过那周开不了 —— 请 Glenn 把日历改对。",
  "【已解决，留档】Essential Tech 的节奏在 8/7 那通电话里自相矛盾：Nidhi 先说本月改成隔周五，随后又确认 \"Next week, Friday, same time\"。8/14 与 8/21 两场 8/12 复查仍在 Glenn 日历上，因此都记为「未来排期」—— 请 Glenn 与 Nidhi 敲定是周会还是双周会。 8/14 复查：8/14 01:00 与 8/21 01:00 两场仍在 Glenn 日历上（受邀人 simon@ 与 npatel@，Leonard 也在），因此都维持「未来排期」。8/14 这一场就是当面确认 AST-20984 分时段排班是否真正满足诉求、并回告 20986/20987 的机会。 8/15 结论：8/14 那场开了，节奏问题有了答案但日历没跟上 —— Nidhi 会上说下周与再下周她和 Simon 都开不了，两人口头把下一次定在 9/4 09:30；但 8/15 复查，Glenn 日历上 8/21 01:00 那一场仍在（受邀人 simon@、npatel@、Leonard），而 9/4 没有任何场次。所以本看板仍把 8/21 记为「未来排期」（口径是邀请存在即算），但那是一场客户已经说过开不了的会。请 Glenn 撤掉 8/21、发出 9/4 的邀请。另：20986/20987 在 8/14 这场上仍然一句没提。 8/19 结案：Glenn 照做了。2026-08-18 13:15 UTC 他在同一线程发信撤会，原话 \"Cancelling this meeting - New schedule on September 4 as per Nidthi.,\"；Glenn 日历上 8/21 01:00 已消失，9/4 01:00 UTC 的新场次已建（受邀人 npatel@、simon@、product@）。看板据此把 8/21 由「未来排期」改判「已取消」。遗留的一条不变：20986/20987 到今天仍然没有对客户回告过。",
  "【已解决，留档】Valeo 8/4 书面终止 ATI 后，8/12、8/19 两场 ATI 周会一直还挂在 Glenn 日历上，这条挂了 5 天。2026-08-13 复查已经解掉：周三 15:00 的 ATI recurring 系列整条被撤销，日历上再无任何 ATI 场次；同一时段、同一批客户参会人（esvendsen、ccramer、paulg）改挂「SOP Agent Weekly Touchbase - Valeo Networks」，8/19 与 8/26 都在，并新增了 Micus Zhang、David Hu 等 SOP Agent 团队成员。看板上 8/12、8/19 两格已相应改判为「已取消」。口径说明：没有取消邀请邮件（Grace 从未被邀请进这个系列），内部 Teams 8/12 16:09 UTC 的一句「Valeo Networks has cancelled the weekly AI Ticket Intake call and is okay with transitioning to…」按口径只作旁证，本次判定依据的是日历本身。结论：ATI 在 Valeo 这边确实关闭了，客户被转到 SOP Agent 产品线 —— 账号没丢，丢的是 ATI。",
  "Unity IT 判在 90%，但 Kip Haroldsen 7/30 说 holding off —— \"We didn't feel the product worked well with our last test call\"，要等 on-call 排班、持续重试、time entry、合约类型路由做完才恢复测试。Glenn 8/7 通报三个 skill 完成、8/12 又通报 time entry 与合约分级两张单上线并请求 walkthrough，但 Kip 两封都没有回信，撤回 holding off 的证据还不存在。本次维持 90%，请 Aaron/Glenn 复核 —— 一个连续两周不回信的 90%，本身就该被质疑。 8/14 更新：Kip 终于回信了（8/13 17:47 UTC，正文已逐字读过），但回信没有撤回 holding off —— 他重申了两条未交付的诉求，并新增了一条更硬的反对：\"this cost comes in higher than our current cost for a live operator. I'm not sure that I am seeing the benefit of using this after-hours.\" 这已经不只是价格贵，而是价值不成立。本轮仍维持 90%（阶梯的 90% 是「在谈定价/商务」，他确实在比成本、没有拒绝），但请 Aaron/Glenn 明确表态：一家从未接入真实来电、两条 deal-breaker 未交付、且书面写下「看不出好处」的客户，继续挂在 90% 是否合理？如果答案是否，正确的位置更可能是 15%（表示兴趣）而不是 0% —— 他并没有拒绝。\n\n【8/18 更新：本次降档 90%→55%，请 Aaron/Glenn 复核】上面连续三轮请人拍板的那个问题，本轮由客户自己回答了。2026-08-17 Crispin Casipit 的月度例会（Fathom 784901107，recording 174094813，transcript 已逐字读过），Crispin 问 \"you have the ticket intake. Any, any feedback on that one?\"，Kip 答 \"No, I don't know that we're ready to give that a go.\"，并补了三句：\"right now I have a live body that answers the phone and it costs me half of what you guys are going to start at.\"、\"There's not an easy way for them to go in there and update their schedule in MSPbots.\"、\"I'm also, I'm not 100% that people are going to enjoy talking to AI when they call my office.\"。按阶梯，90% 是「在谈定价/合同」，而他已经退到「还没准备好试」，所以 90% 站不住。本轮判 55%（MSP 自测）而不是上一轮设想的 15%：阶梯的 55% 定义是「客户自己打过测试电话、提出 bug/需求」，Unity IT 两件都发生过 —— 他 8/17 亲口说 \"we tried it out one time and it was kind of glitching out on me\"，并累计提了 7 张单、含三条 deal-breaker。也没有判 0%：他没有拒绝，同一通里还说 \"Well, I'll give the number a call. I'll see what it does.\"。请复核两点：**① 55% 还是 15%？** 若认为一次「打过一通、卡住了」的测试不足以支撑 55%，请改判 15% 并说明口径，本板照改。**② 交付通报为什么没到达？** Kip 8/17 全程没提 8/12 已上线的 time entry 与合约分级 —— 两周的交付在客户那里等于没发生。",
  "【SLA 已破，请处理】Certified CIO 是最热的新商机（8/5 例会上 Eric Lamdin 主动问 \"Can you demo it for us?\"），8/13 复查 Glenn 日历到 8/26 为止仍无任何场次 —— 这是连续第 6 次复查全空，第 8 天，7 天 SLA 昨天（8/12）已经过期。My IT Crew 那条已经解除并且还加了一场（8/13 + 8/17）。也就是说本轮唯一还在流血的就是 Certified CIO，而且已经不是「快到期」而是「已经超期」。Dev-Source 和 Parachute 都是拖没的，这一家正在走同一条路。请 Crispin 今天直接给 Eric 三个时间选项，别再靠预约链接自助成交。 8/14 更新：第 9 天，连续第 7 次复查全空 —— Glenn 日历到 8/28 为止仍无任何 Certified CIO 场次，仓库里也没有 emails/ 目录。本轮 My IT Crew（8/17）和 ISG（8/17）都已经排上，只剩这一家一场都没有，而它是唯一一家客户主动开口要 demo 的。这条已经连续 3 轮以同样的措辞出现 —— 如果今天还排不上，请把它升级为需要主管介入的事项，而不是继续在看板上重复。 8/15 更新：第 10 天，连续第 8 次复查全空 —— Glenn 日历到 8/23 无任何场次，Outlook 里搜不到任何 Certified CIO 的 demo 线索，仓库里仍无 emails/ 目录。SLA 破了 3 天。本轮起停止在看板上重复这条：请主管直接指派时间，或者明确判定放弃并标为「不再跟进」。这是唯一一家客户主动开口要 demo 却始终没排上的商机，拖到现在已经不是排期问题，是有没有人负责的问题。 8/16 复查（周日）：第 11 天，连续第 9 次全空 —— 本轮把窗口从 8/23 拉长到 9/20 重查了 Glenn 的日历，既按 certifiedcio.com 参会人查、也按 \"Certified CIO\" 全文查，两次都是零结果；Outlook 邮箱里搜 \"Certified CIO\" 同样零结果；仓库里仍无 emails/ 目录。也就是说不只是「近两周没排」，是未来五周都没有任何东西。SLA 破了 4 天。本轮（8/15–8/16 周末）全线无新证据，这条维持原判：需要主管指派时间或明确放弃。 8/18 复查：第 13 天，连续第 10 次全空。本轮按 certifiedcio.com 与 \"Certified CIO\" 两种方式重查 Glenn 日历到 9/30，仍是零结果，仓库里仍无 emails/ 目录。这条不再逐轮扩写 —— 它已经不是排期问题，等的是主管的一个决定。",
  "【本次新增会议，且是一次被浪费的机会】ISG Technology 8/17 21:00 UTC 的月度例会由「未来排期」改为「已开」（Fathom 787445651，recording 174090268，Kristine Gadayan 录制，客户方 4 人 + Sean Fleming，Glenn 在场）。档位不动，仍为 35%。问题在于会上谈了什么：按 Fathom 摘要，全场是 NextTicket 派单采用率（MSP 团队约 95% 新单已由系统派）与 SOP Agent 演示及其试点条件，ATI 既不在讨论要点里也不在 next steps 里。上一轮看板写的是「这是 7/20 以来第一次接触，别浪费，会前先发工单状态邮件」—— 状态邮件没有发，7 张未开工的 enhancement 第二次无声地挂过一次接触。两件事请人确认：① 这里只读了 Fathom 摘要、没有逐字看 transcript，如果会上其实提到了 ATI，请给出片段，本板据实修正；② ISG 是本板最大的单客户工单积压（10 张、7 张未开始），而它同时正在被 SOP Agent 占用会议时间 —— 请明确 ATI 在这家还追不追，如果追，下一次月度例会前必须有一封写明做/不做/延后的状态邮件。",
  "【口径缺陷，会低估「最近一次对客沟通」】仓库的 emails/ 导出把同一线程的新邮件追加进已有文件，而文件名的日期是线程里第一封信的日期。本轮的实例：Glenn 8/17 08:41 UTC 给 James Eubanks 去信说 Call Transfer 的修复已经上线、可以测了，并问 Zoom 测试号码是否还在 —— 这封信被追加进了 emails/metrosales.com/2026-08-13_Metro Sales — AI Ticket Intake Weekly Call Summary (Aug 13, 2026)... .md，文件名日期仍是 8/13。builder 的「最近对客邮件 / 距上次沟通天数 / 交付后多久回告」全部按文件名日期计算，所以 Metro Sales 这类线程会被系统性地少算几天。本轮不改 builder，只把口径写下来：看板显示的对客沟通日期是「线程首封信的日期」，不是最近一封。要修的话，应该在导出侧按每封信落文件，或让 builder 读文件头部的 **From:** 日期区间。",
  "【本轮新增 · 需要人打开两张截图】EstesGroup 8/18 的往返信件是本轮唯一读不完的证据，也是唯一可能改变一家 90% 客户判断的东西。Glenn 8/18 09:55 UTC 通报他们账号写工单 note 报权限错误并给了 ConnectWise 的修复步骤；Bill McCord 8/18 20:53 UTC 回信，正文逐字只有 \"Glenn,\" 与 \"So, about that.\"，外加 8 张内嵌图片，其中两张分别为 202 KB 和 175 KB 的整屏截图（Outlook 原件：主题 \"Re: AI Ticket Intake Transcript Note - Write Failed\"）。「So, about that.」这句话本身没有指向性 —— 可能是「权限那事我已经处理了」，也可能是「那事我们得谈谈」，而这家客户此刻正卡在 90%：内部已宣布成交、试用 8/17 到期、至今没有任何付费凭证。请人工在 Outlook 里打开那两张截图并回填结论：如果 Bill 是在确认权限已改好且订阅已开通，这家应升 100%；如果他是在提出异议或表示要重新讨论，则要评估是否往下调。本看板不凭猜测改档，因此本轮维持 90%。",
  "【本次新增 · Metro Sales 8/20 的周会到底开了没有】8/20 14:30 UTC 那场周会：邀请在 Glenn 日历上、没有取消标记、受邀人齐全，但 Fathom 8/13–8/20 全文搜不到任何 Metro Sales 客户场，8/20 当天 21 场录像里也没有，meetings/Metro Sales/ 最新纪要仍是 8/13，会后没有纪要邮件；当天唯一的对客动作是会前 47 分钟那封重开试用的信，通篇没提这场会。因此记为「无记录」。请 Glenn 直接回答：这场会开了吗？如果开了，录像/纪要在哪；如果没开，是客户没到还是我们没开？这家是 90% 档、Glenn 自己写过「转接 bug 是付费前最后一个 blocker」，这一格不能一直悬着。",
  "【本次新增 · Mainstream 的通话时长告警缺一个决定和一个日期】8/20 16:43 UTC Glenn 把设计发给了 Tim，里面有三个终止选项（A 仅仪表盘标记 / B AI 自动挂断 / C 人工 Disconnect 按钮）让客户选，阈值默认 7 分钟 —— 而 Tim 8/19 口述的是「未转接却聊满 5–7 分钟就要告警」。两件事要人来定：① Tim 回信之前，AST-21625 要不要先给 due date？它是四张 Mainstream 单里唯一没有负责人也没有日期的，另外两张（AST-21626 / 21627）都写着 due 2026-08-26。② 如果 Tim 选了 B（AI 自动挂断），那等于在产品上引入「AI 主动结束通话」这个新行为，与 AST-18104 里「每通电话都要产生工单」的原则要一起看，别在两张单里各写一套。",
  "【本次新增 · CIO Landing 的 TEST 5 缺一张单，且 Aug 24–27 已经是对客承诺】① German 8/20 报的 TEST 5 原话是 \"Was able to add in the notes!! but added them in the discussion tab instead of internally\"。ClickUp 里查不到明确对应的单：AST-21421 写的是「建两条内部备注」，没有涵盖「写错到 discussion tab」这个 flag 问题。请确认挂在 21421 下面还是单开一张。② Glenn 8/20 20:14 UTC 已经把逐项日期发给客户（Aug-24 / 25 / 26 / 27），但其中 AST-21492（工单号不念给来电者）自身仍是 new，只是通过挂在 AST-18104 下面才显示为「进行中」。请开发侧确认这四个日期是承诺还是估计 —— 现在它们已经在客户邮箱里了。",
  "【本次新增 · 四张单从 complete 变成 Closed，「已交付」计数因此变少】8/20 06:00 那次缓存刷新时还是 complete、本轮（8/21）已经是 Closed 的四张单：Essential Tech 的 86e2u63ny（AI 忽略来电者已说过的排障步骤）、86e2u63tb（\"one moment\" 提示音拼接不连贯）、86e2u63uz（对话延迟），以及 CIO Landing 的 86e2u6nzh（8/10 之后 bot 无法建单）。它们原本都记着 2026-08-14 的上线日期，现在退出「已交付」桶、落进「已关闭」，看板上 Essential Tech 与 CIO Landing 的已交付数会因此下降。请确认 Closed 在这四张上的含义：是「已修复已上线、只是把单关掉」还是「不修了」？如果是前者，上线日期不该丢；如果是后者，客户需要被告知。",
  "【本次新增 · 两封 8/20 的对客邮件在 Outlook 里有、仓库 emails/ 里没有】本轮用 Outlook 连接器查 8/20 之后的来信，读到两封在 emails/<domain>/ 下找不到对应文件的对客邮件：① gdopazo@ciolanding.com 8/20 19:00 UTC 回信，问 Ticket Lookup 上线之后，「在同一通电话里把工单号告知客户」的 skill 有没有；Glenn 8/20 20:14 UTC 回复说该能力正在开发，属于清单里 \"Re-enable Ticket Number Verification/Confirmation\" 那一项。② Glenn 8/20 13:43 UTC 在 Metro Sales 周会纪要那条线上的回信（转接修复已应用到 AI Intake，请继续测试）。但 emails/ciolanding.com 最后一封仍是 8/19，emails/metrosales.com 最后一封仍是 8/17，而同一天的 Mainstream 8/20 邮件却同步进来了 —— 说明 8/22 那三次 sync 是漏了这两封，不是整天没跑。「客户是否已被回告」这一列是按 emails/<domain>/ 的文件名日期算出来的，所以这是一个会静默影响判定的输入缺口。本轮没有手工补文件：emails/ 是同步产物，不属于判断层，手改会掩盖 sync 本身的问题。请确认 sync 的取信范围，并在下一次抓取后复查这两封有没有落地。当前影响可控：CIO Landing 最近一次对客沟通按 8/19 算是 4 天、Metro Sales 按 8/17 算是 6 天，都还在 7 天以内，两家的回告判定都不变。",
  "【本轮新增 · CIO Landing 的第 4 项交付与客户原始要求不一致，且我方自己问了「是不是 deal-breaker」但没人追】2026-08-26 16:28 UTC Glenn 对客宣布四项 enhancement 全部 released，其中 ConnectWise 工单格式那一项，AST-21421（86e2r5fn3）的原始需求写的是把 transcript 与录音从正文移到附件；实际交付是两条内部备注、transcript 以正文形式内联。Glenn 在同一封信里主动写明：\"The transcript record is currently included as-is rather than as a downloadable TXT attachment — this is due to other clients requested this setup, let me know if this is a deal-breaker.\" 截至 8/27 01:10 UTC 客户没有回答。请人在 8/28 20:15 的周会上明确问掉：这算不算满足？如果算，AST-21421 的验收标准要改；如果不算，需要一张新单，而这家现在是 55%、正在做 50 通复测。",
  "【本轮新增 · Metro Sales 的试用有到期日了（约 9/4），但没有例会也没有回信】Glenn 8/26 10:04 UTC 的原话是 \"you still have 9 days remaining on your free trial\"，据此 8/20 重开的 14 天试用大约 9/4 到期。同一时间：8/27 与 9/3 两场周会在 Glenn 日历上不存在，客户对 8/20、8/26 两封信都没有回复。请 Glenn 确认三件事：① 周会是有意停掉还是漏发；② 试用到期日是不是 9/4，到期后是再延还是转付费谈判；③ 转接 bug（与 Valeo AST-20255 同类）能不能在到期前给出修复日期 —— 这是他自己在 8/13 纪要里写的「付费前最后一个 blocker」。",
  "【本轮新增 · Titanium.Red 的重连信已发出，需要一个跟进日期和一次判定】8/26 18:28 UTC Glenn 用「转接前建单已上线」为由头给 Natalie Zieger 发了重连信，正是看板上一轮建议的动作。本轮客户无回复，档位仍按 0%（Closed Lost）不动。请人定：① 多久没有回复就按 Q4 再谈归档（建议 9 月上旬）；② 若 Natalie 同意「informally 试一下」，是回到 15% 还是直接按当初的深度回到 55% —— 这家在 7/31 之前提过 10 项bug/质量项，档位怎么恢复需要人拍板，脚本判不了。",
  "【本轮新增 · CIO Landing 的两封取消信没说取消的是哪一场，8/28 与 8/31 是推断出来的】2026-08-27 14:05:57 与 14:06:36 UTC Glenn 连发两封字句完全相同的取消邀请，正文只有一句 PTO 改期说明，没有任何一封写出被取消场次的日期。把它们分别记到 8/28 与 8/31，依据是间接的：以 attendee=ciolanding.com 检索 Glenn 日历 8/20–9/20 区间，这两场都已不在，只剩 9/3 那一场客户侧预约。请 Glenn 用一句话确认：取消的确实是 8/28 和 8/31 两场吗？如果其中一封其实取消的是 9/7 之类的后续场次，那 8/28 或 8/31 就属于「日历上消失且无取消记录」的静默场次，按运行手册要记成 norecord + silent，判定完全不同。",
  "【本轮新增 · CIO Landing 的周会系列断了，9/3 是客户自己约的一次性场次】9/3 15:15 UTC 那一场的 organizer 是 support@ciolanding.com，不是 Glenn，Glenn 只是受邀人 —— 它来自客户侧的预约页，不是 8/7 起那条周一 20:15 recurring series 的下一场。复查确认该 series 在 9/20 之前没有任何后续场次。请人拍板：是补建周会系列，还是就此改为按次预约？这家现在 55%、正在跑 50 通复测，而 8/24、8/28、8/31 连续三场都没开成，9/3 之前实际上已经三周没有面对面。",
  "【本轮新增 · KRS-IT 的 9/3 配置会是配哪个产品，需要先弄清楚】会议名是 “Next Ticket x Intake Configuration”，organizer 是 Aaron Ver，客户方 Josiv 已接受。名字里同时有 NextTicket 和 Intake 两个产品，日历正文只有 Teams 会议链接、没有议程，因此无法从证据判断这一场里 ATI 占多少。请 Aaron 在会前给一句议程；同时请注意档位判定的口径：这一场本身不构成升档依据，只有真的配好 app、发出号码才从 15% 升到 35%，凭证要留在工单里。"
 ],
 "openQuestionsEn": [
  "[New this run · TeamLogic IT (LBMH): the client says he \"might just end up removing\" the AI — someone has to go get a definite answer on whether that is a loss] The transcript of the 2026-08-27 CSM monthly was read verbatim (Fathom recording 177487569 / https://fathom.video/calls/800061413). Three sentences from Randall Wilson: \"The whole AI usage thing that I am considering getting rid of because I'm not using it. The voice thing I'm not using.\"; \"we're not moving away from the platform. We're just going to probably just going to move away from the AI part of the platform. Unless you guys got something super fancy that I don't know about coming down the pipe.\"; \"as far as the AI stuff, like I said, might just end up removing that. I'll let you know.\" This run's verdict: no drop, still 35%, with the status moved from warm to at-risk. The reasoning is that lost (0%) requires an explicit refusal, and all three of those are inclinations rather than decisions — he even names the condition that would change his mind. Per the Valeo lesson, the evidence has to support the verdict itself; an inclination cannot be read as a refusal. Two things for a human. (1) Jazz should get a yes or no at the next contact; once there is one, fill in rejection (channel / date / who / verbatim quote / ref) per rule 3 of the runbook and drop the rung to 0%. (2) One thing on that call is explicit: the sales-intake use case was killed (\"my sales guy does not want AI answering the phone at all for his incoming calls\" / Jazz: \"So we're going to put that off the table now, the sales intake.\"), and sales intake has been this client's only use case since 7/24. Somebody should decide whether they stay on the ATI thread at all.",
  "[New this run · CIO Landing asked to extend the trial on 8/28, nobody has replied, and we do not know the expiry date ourselves] German Dopazo's own words at 20:41 UTC on 2026-08-28 (Outlook original read verbatim): \"knowing our trial is ending soon, may we please extend it so that we may have more time to keep on testing this? As you'll hear on my first recording from these tests, the bot nailed exactly what needed to be done.\" As of this build on 8/29 there is still no reply. Three things need a human. (1) The exact expiry date is not in the mail and the board cannot infer it — Glenn should establish it; if it falls before 9/3 (the next actual contact) an answer has to go out before then, or the client lapses without ever hearing back. (2) Whether to extend is a commercial decision the board cannot make. (3) Somebody has to own the five re-test results in the same mail: TEST 4 (\"unable to find open ticket\") and TEST 5 (\"Stuck on a loop, unable to cancel adding a note, looked up a ticket it wanted instead of listening to me requesting to put in a specific ticket number\") point at the ticket lookup-and-update flow shipped on 8/18 (AST-18103), not at the four released on 8/25–8/26 — decide whether that is a regression or a pre-existing defect and whether new tickets are warranted. The client sent the recordings straight to Glenn's mailbox; somebody has to actually listen before concluding.",
  "[New this run · Keeran Networks is placed at 15% for the first time — please check it, and decide whether to raise SMS up front] This entry was created this run on the strength of Leonard's post-meeting recap email of 2026-08-27 (emails/keeran.ca/2026-08-27_..., body read): OpsGenie is being retired, the recorded Decisions include \"Plan to migrate off OpsGenie toward AI Phonetic for after-hours alerting and on-call rotation\", and our action is for Glenn to send the ATI rundown and stand up a test environment, \"No date set\". It sits at 15% because there is no provisioning evidence of any kind. Three things to check. (1) Is 15% right — this is a new entry's first assignment. (2) ATI here is gated on the renewal (the main thread of the same call is the Pro-bundle-to-BI-only downgrade), so Leonard and Glenn should agree the sequencing. (3) SMS: the first line of the recap's Open Questions is \"SMS support for AI Ticket Intake (currently Teams/email only)\", and SMS still has no date. Unity IT stopped testing over exactly this (AST-20757 is their go-live blocker; AST-21144 depends on SMS). Decide whether to state plainly now that Teams/email exists and SMS does not, or let testing discover it — that judgement is not the board's to make.",
  "[New this run · a data-layer gap, not a judgement question: the 8/26 and 8/28 ciolanding.com emails were never synced into the repo] This run's CIO Landing evidence — Glenn's 8/26 16:28 UTC note that all four enhancements were released, and German's 8/28 20:41 UTC five-call reply — was read directly from the Outlook originals, but emails/ciolanding.com/ currently stops at the 2026-08-27 cancellation; neither the 8/26 nor the 8/28 message is there. The effect is concrete: the board's \"told the client?\" column infers the first client-facing touch after a ship date from the filename dates under emails/<domain>/, so with the 8/26 mail missing, the three tickets that shipped on 8/25–8/26 (AST-21421 / AST-21493 / AST-21419) render as having had no client contact since shipping, when in fact they did. That belongs to the daily sync rather than the judgement layer, so no files were hand-written this run. Please establish why the sync missed these two.",
  "[New this run · KRS-IT's \"raised your hand\" question has an answer, but the pricing question has no reply] Last run (8/25) left this open: Aaron's 8/19 mail opens \"Thanks for raising your hand for AI Intake\" while the client's own words on 8/24 were still evaluating whether to try it — were those the same claim? Kevin Obello's (Operations Manager) reply at 13:01 UTC on 8/25 supplies the client's side of it: \"AI Intake for Afterhours would be nice to try out. I'm not too fond of our current answering service since the CW integration isn't great.\" (Outlook original read verbatim; Grace on Cc). So: there is now a clear client-side willingness to trial — but it appeared on 8/25, and the basis for \"raising your hand\" as of the 8/19 send is still not on record. That resolves last run's framing question only for KRS-IT; the basis for the other three (Certified CIO, The Virtual IT Department, Converged Medical Solutions) still needs confirming. The rung did not move (still 15%) because there is no provisioning evidence of any kind. What actually needs a human are the two things in that same email: (1) Kevin asked outright, \"I'm not sure how the pricing model works but if it uses the credit model as the other AI modules, we could fit it into our stack.\" As of the Outlook re-check at 01:20 UTC on 8/26, nobody at MSPbots has replied. That is a client asking for a price and us not answering. (2) He also gave the volume: \"we don't get a lot of afterhours service calls—less than 10-30 afterhours service calls per month.\" Somebody should judge whether that volume works against the current $199/month + $0.50/minute plan, and whether this client is worth a full onboarding cycle. Neither is a call this board can make, so both are left here.",
  "[New this run · we pushed CIO Landing's 8/24 weekly ourselves, leaving the four client-facing ETAs without a checkpoint] When Glenn's calendar was re-checked on 8/25 this slot was gone, and there is no Canceled invite under emails/ciolanding.com — under the runbook that would be recorded as \"no record + silent\". The Outlook originals settle it, so this run records it as cancelled with the reason stated: at 18:17 UTC on 2026-08-24 Glenn asked to reschedule, his reason being \"I don't have any substantial updates to share yet since the team is still finalizing the work\"; at 18:27 UTC Ignacio Colombo agreed in writing — \"Sure Glenn, we can reschedule for next Friday, same time if that works for you.\"; at 18:31 UTC the replacement invite went out and 8/28 20:15 appeared on the calendar. Two things for a human. (1) Should \"we rescheduled and the client agreed in writing\" be recorded as cancelled, or does it need its own state (say \"rescheduled\")? As recorded now, it is the same colour on the grid as a client refusal and as an invite Glenn never sent, and it means something quite different from both. (2) More importantly, delivery: the 8/20 email promised the client Caller-ID Aug-24, Smarter Escalation Aug-25, ConnectWise format Aug-26 and ticket-number verification Aug-27, and all four dates now fall between the 8/17 and 8/28 sessions with no client-facing checkpoint. ClickUp on 8/25: AST-21420 (86e2r5f6g), the Aug-24 item, is itself still new; 86e2r5fha, the Aug-25 item, is still in development; and AST-21493 (86e2u6nzw) has had its due date moved from 8/24 to 8/27. Please confirm the 8/28 session reconciles them item by item rather than being another \"still finalising\".",
  "[New this run · KRS-IT replied, but the \"raised your hand\" framing may not hold up] At 19:55 UTC on 2026-08-24 Josiv Krstinovski replied to Aaron's 8/19 two-week trial invitation. The message is three lines in full: \"Hi Aaron, Adding Kevin and Josef on this. @Kevin Obello @Josef Muertegui Please review and see if this is something we are interested in trialing out?\" No promotion was made on the strength of it (still 15%) — handing the decision to colleagues is not the same as wanting a trial, and is nowhere near the 35% bar of \"intake app configured, number issued\". What needs a human is the framing: Aaron's mail opens \"Thanks for raising your hand for AI Intake\", implying the client came to us, while the client's own words are that they are still deciding whether to try it. Please confirm whether \"raising your hand\" had a specific basis for each of the four trial invitations sent on 8/19 (Certified CIO, KRS-IT, The Virtual IT Department, Converged Medical Solutions) or whether it is template phrasing — if the latter, how all four sit in the funnel needs re-examining. Note too that this client's original ask (running PowerShell, provisioning users, resetting passwords) already exceeds what ATI does, so even if a trial is switched on, nobody has answered what it would prove.",
  "[New this run · Mainstream: the client made the design call, but the ticket is still new · and the emails/ sync gap persists] (1) At 13:53 UTC on 2026-08-24 Tim Brown chose how the call-duration alert should behave: \"I’d lean towards Option A or Option C versus having it automatically terminate the call.\" (A = flag it on the dashboard, C = a manual disconnect button; not B = the AI hanging up by itself). Last run the board gave \"waiting on Tim to pick an option\" as the reason AST-21625 sat at new. That reason is gone, yet on 8/25 the ticket (86e2wt01r) is still new with no assignee and no due date, while AST-21626 and AST-21627 from the same batch are both in development and due 8/26. Give AST-21625 an owner and a date, or say why it is not being done — the client has put the ball back in our court. (2) While you are there, please confirm why AST-21628 (86e2wt0cy, the barge-in / latency defect that Tim himself named as the only potential deal breaker) is still new. (3) The emails/ sync gap is still here this run, and more visible than last time: three client-facing messages read through Outlook — Tim Brown 8/24 13:53, Ignacio Colombo 8/24 18:27 and Josiv Krstinovski 8/24 19:55 — have no matching file under emails/<domain>/, while Glenn's 18:31 CIO Landing invite from the same day did sync. The \"did we tell the client\" column is computed from emails/ filenames, so this is an input gap that degrades the verdict silently. No files were hand-added this run either (emails/ is a sync artefact, not part of the judgment layer; editing it by hand would mask the sync problem itself). The current impact is contained: Mainstream's last client email dates to 8/20, five days ago, and CIO Landing's to 8/24, one day ago, so neither verdict changes.",
  "[New this run · VIP IT is an ATI alpha tenant yet appears nowhere on this board — decide whether to bring it on] The only new evidence in this run's 8/14–8/24 window is emails/vipitinc.com/2026-08-22_Re- Rob Miller and Micus Zhang (scheduling).md (6 messages, 8/22–8/23, read in full). To be clear up front, it is not grounds for a stage change: the whole thread is scheduling. Rob Miller (CEO) writes \"Correction. Apologies. Let's do PT 16:00 on Thursday.\", David Hu asks at 01:17 UTC on 8/23 to push it to 17:00 PT, and Rob replies at 01:51 \"The timing should work for both of us. Thx\" — not one line of ATI product content, so no client was added and no rung was moved on the strength of it. The real question is coverage: VIP IT has ATI history. Glenn's email at emails/vipitinc.com/2026-07-06 says \"we haven't heard from you in a while regarding your MSPbots AI Ticket Intake Alpha trial\" and warns \"Your dedicated test number will be decommissioned in 3 days unless we hear from you.\" — that thread holds only that one message and the client never replied. report/2026-07-26_ATI-Alpha-Retrospective then files VIP IT under \"missing prerequisite feature\", the reason being \"financial clients — caller identity must be verified before any troubleshooting\" plus API-executed actions. So this is an alpha tenant that went silent mid-trial with its loss reason already written up in the retrospective, and it is not among this board's 25 clients. Three calls for a human: (1) should VIP IT be brought onto the alpha track at 0% as a silent loss, or does this board deliberately track only tenants that had a weekly cadence? (2) if it is brought on, 0% needs a written confirmation from the client side — the 7/6 mail was ours and went unanswered, which under this board's rules is not a client refusal; (3) if the Thursday 8/27 call between Rob and Micus / David Hu touches ATI, report it as a revival contact rather than waiting for the next email sync. One judgement recorded but not acted on: the 8/19 CTMS (Centric Technology Services) CSM weekly on Fathom schedules a future Ticket Intake demo, but we offered that demo and the client raised no ATI need, so it fails the pipeline track's bar (\"an ATI need surfaced explicitly in the CSM's recurring meetings\") and was not brought on — say so explicitly if that bar should be relaxed.",
  "[New this run · two more missing-invite cells for Layer 7 — should this cadence be declared dead?] Glenn's calendar was re-checked on 8/22 (full-text search for Intake over 8/20–9/7; all 14 events read individually) and none of them is Layer7Systems, so 8/28 and 9/4 are recorded as missing invites too — four cells in total with 8/14 and 8/21. The last session actually held was 7/17; after that 7/24 was cancelled, 7/31 and 8/7 have no record, and from 8/14 onward no invite has been sent at all. The question is no longer \"Glenn forgot to send an invite\" but \"is this client still running\": on 8/7 Glenn wrote on the internal Teams channel that \"Layer7Systems will not move forward with AI Ticket Intake.\", but on this board Teams is not evidence, the last mail in emails/layer7systems.com is the 8/3 paywall notice, and there is no written refusal from the client side. Glenn to pick one: (1) produce a written confirmation from the client, move this client to 0%, stop the cadence and withdraw all four missing-invite cells; or (2) if it is still worth saving, re-issue the weekly — left as it is, the board grows one more blank cell every week.",
  "[New this run · the builder gained five previously unmapped statuses — please sanity-check the call] The builder's status-to-bucket map had no entry for \"for qa\", \"in testing\", \"6a - in dev\", \"6b - dev done\" or \"da in progress\", and an unmapped status falls into the \"not started\" bucket. This run AST-18104 (86e0za1dv) moved from in development to for qa and hit exactly that hole: a ticket moving forward would have moved backwards on the board to \"not started\", and the two tickets riding on it (AST-20803, AST-21492) would have lost their vehicle and dropped from \"in progress\" back to \"new\". All five statuses are therefore now mapped to \"in progress\". Effect: the delivered bucket stays at 48 and the 42 ship dates are unchanged; in-progress goes from 15 to 17 (the newcomers are 86e0za1dv and 86e1kj33g / AST-19323, Big Fish's PIN validation — both \"for qa\"). One status was deliberately left alone: \"blocked\" (7 tickets, three of them client-visible — AI Voice Reliability Issues, Long Silence gaps, CIOLanding Systems Interrupts). \"Blocked\" still falls into \"not started\", which understates it; mapping it to \"in progress\" would overstate it. How that rung should read is a human call and this run did not make it.",
  "[New this run · decide how to read The Virtual IT Department's reply] At 03:46 UTC on 8/21 Matt Tierney (IT Manager) answered the 8/19 trial invitation in three sentences; the load-bearing one is \"At this stage, I'm aware that Liam and the team are already investigating this as we speak. So I will leave it to them to do the initial investigations and report back on their findings.\" This board reads that as a polite hand-off and holds the rung at 15%, because no demo was booked, neither of Aaron's questions was answered, and there is no number and no configuration — but nothing in the text is a refusal either. Aaron/Leonard to confirm two things: (1) is Liam's team actually investigating, and if so who owns it and when do they report back? (2) has the pricing the client asked for on 7/21, and the Australian data-residency question, ever been answered in writing? If neither is true, this client's 15% is hollow — it is not advancing, it has just not said no.",
  "[New meeting this run · Mainstream 8/19 held, rung unchanged, please check the framing] A held cell was added for Mainstream Technologies on 2026-08-19 at 19:30 UTC, but it was Leonard Narvaza's Autotask-migration call rather than an ATI weekly — Glenn joined partway through for roughly 16 minutes of ATI demo (transcript read verbatim, Fathom 789331110). It is on the board because real ATI commercial ground was covered: cost parity with their current call centre (\"dollar for dollar the same\"), a month-to-month POC with no 12-month term, and the internal approval path through his CISO and leadership. The rung stays at 90% rather than 100% (no subscription, no invoice) and not 75% (the phones have never been forwarded). If you think \"the client said out loud he will buy a month\" deserves its own rung short of closed, change the definition here.",
  "[Two \"missing invite\" cells added — please confirm whether the cadence was stopped on purpose] Metro Sales' Thursday 14:30 weekly has only one occurrence left on Glenn's calendar, on 8/20. Rechecked on 8/20 both by attendee and by full text over 8/20–9/30: 8/27 and 9/3 do not exist, and there is no cancellation email (on this board a single cancelled occurrence is deleted outright by Outlook and can only be rebuilt from email — and the mailbox has none). So 8/27 and 9/3 are recorded as noinvite. This client sits at 90% and Glenn himself wrote that the transfer bug is \"the final blocker before moving forward with the paid plan\", yet the weekly stops after the next session. Glenn to confirm whether the cadence is deliberately ending once the bug is closed out, or the invite was simply never extended.",
  "[New this run · four 15% clients got a trial invitation on the same day — watch for replies] Between 20:51 and 20:55 UTC on 2026-08-19, Aaron Ver sent the same \"Let's get you set up with AI Intake — quick 2-week trial\" email to Certified CIO (elamdin@), KRS-IT (josiv@), The Virtual IT Department (matt.tierney@ / roy.mulia@) and Converged Medical Solutions (paul@), with Grace on Cc throughout; the originals were read this run. None of the four moved rung (all stay at 15%) — the email promises a two-week trial will be set up, not that it has been, and 35% requires the intake app configured and a number issued. Two things to check: (1) the line \"Thanks for raising your hand for AI Intake\" is questionable for Converged Medical Solutions, who have not mentioned ATI across eight monthlies since 5/13 — confirm what it rests on; (2) as soon as any of them is genuinely provisioned, keep the record, and the board will move them to 35%.",
  "[MOST IMPORTANT THIS RUN — produce the evidence, then move the rung] EstesGroup may have become ATI's first paying customer, but the board holds them at 90% this run rather than 100%. What there is, and what is missing: 1. The internal Product-Platform L10 of 2026-08-13 02:30 UTC (Fathom 780677829; notes at meetings/internal/2026-08-13-Product-Platform-L10.md, from the verbatim transcript) shows the deal had not closed at that point, and had nearly died on a quote-versus-model mismatch — Glenn at [46:52]: \"I sent out a follow-up asking their sentiment on the pricing, based on our initial pricing — $199/month including 200 minutes… But we shifted to the credit base… The AI ticket intake is 6 credits per minute, so $199/1,000 credits is only around 166 minutes — way down from the 200 minutes mentioned earlier.\" Daniel's verdict: \"this kind of stuff kills the deals.\" The call agreed an unlisted $1.99 / 1,200-credit plan to be activated on the backend once the client confirms. 2. At 10:56 UTC the same day Glenn announced on the internal Teams channel that \"EstesGrp.com has become our first paying customer for AI Ticket Intake\". **Teams is not admissible evidence on this board**, no subscription or invoice record appears in ClickUp or Outlook, and Bill has not written since 8/12. Produce any one admissible record — the Marketplace subscription, an invoice from Accounting, or Bill's written confirmation — and the client moves to 100% (the ladder's 100% is \"paying\"). Worth saying plainly: if it is true, this is ATI's first sale and deserves its own line — and precisely because it is the first, it should not be booked on the strength of an internal celebration. (Re-checked 8/15: still nothing. Outlook has had nothing from estesgrp.com since 8/12, the Chargebee daily reports for 12–14 Aug and the first-invoice alert carry no EstesGroup — the 8/12 alert was for cytek-itops — and ClickUp shows no subscription. Two days after the win was announced internally, the rung stays at 90%. Note also that the trial expires on 8/17, two days away, with the plan still waiting for Bill to click it in the Marketplace. Today it is either the record or an extension; do not let \"we announced the close\" and \"the trial lapsed\" land in the same week.) (Re-checked 8/19: still no record — Outlook turns up no subscription, invoice or revenue alert for EstesGroup and ClickUp shows nothing either; the trial expired on 8/17; and Bill's 8/18 reply is \"So, about that.\" plus screenshots, so it cannot be read as either good or bad news. The rung holds at 90%, for a reason that has shifted from \"no record\" to \"no record, and the client's position is now unclear\".)",
  "[NEW MEETING · Metro Sales held 8/13 — please check the calls] The Metro Sales weekly of 8/13 14:30 has moved from Scheduled to Held (Fathom 781050095), with Dan Olsen, David Ulbrich and James Eubanks all present — the first full turnout since 6/18. The rung is unchanged at 90%. The call pinned down the one thing standing between them and paid conversion: the AI reads their Zoom auto attendant as voicemail and hangs up the instant it answers. Glenn's summary email at 17:15 UTC that day (body read verbatim) states: \"We confirmed that this is the final blocker before moving forward with the paid plan.\" Two things to check. **1. Should this be pushing the rung up?** A client whose written minutes say one bug separates them from paying is not really the same 90% as one still arguing about price — but the ladder's next step is 100% \"paying\", with nothing in between, so it is left alone this run. **2. This bug is the same failure class as Valeo's AST-20255** (a transfer reaching an auto attendant misread as voicemail), which has been in development since June. Valeo already walked over transfer problems and Metro Sales is stuck at the same point — confirm the two tickets are one fix rather than two parallel patches. Note on method: this entry comes from the Fathom summary plus Glenn's summary email (whose body was read verbatim); the transcript was not read verbatim.",
  "[NEW MEETING ADDED — please check the scope call] ACTS360 has gained a \"held\" cell on 2026-08-12 — but that was Jazz Laban's CSM monthly (Fathom 781056252, with only Joshua Mejia and Jazz present), not an ATI touchbase; the ATI weekly has not run since 7/7. It was included because ATI was genuinely discussed: Jazz gave the updated tiers (Basic $399/month for 3,000 credits, Starter $699/month for 7,000, credits fungible between Ticket Intake and TicketQA), and Joshua named the real obstacle as ROI — they have no customer-facing SOPs or knowledge base, so the AI cannot resolve anything autonomously, leaving ATI to answer calls, create tickets and route them, saving no labour. Two things to check. **1. Whether this belongs in an alpha-track cell at all.** The track is defined by an ATI weekly cadence, and drawing a CSM monthly into it makes the ATI meeting-hygiene numbers look better than they are. **2. Its side effect on the \"client told?\" column.** ACTS360 originally asked for AST-20245/20246/20247, all three shipped on 6–7 Aug, and not one was mentioned on this call; adding the meeting makes those three read as having had contact after they shipped. That is correct under told_note's stated method (it proves contact happened) — just do not read it as \"the client was told\". Note also that this entry comes from the Fathom summary rather than a verbatim transcript, so it was not used to assign any rung and ACTS360 stays at 90%.",
  "[NEW CLIENT ADDED AT 0% THIS RUN — please verify] Capstone Works (Chuck Adams, Cindy Adams; CSM: Kristine) has been added to the prospect track at 0%. The evidence is the meeting of 2026-08-11, Fathom 778774350, \"MSPbots Product Demo with Glenn\" (Grace is on the invitee list), whose transcript was read verbatim: Glenn confirmed the ticket is only created after the call ends, and Chuck Adams replied \"So that takes the usefulness of this application to near zero.\"; Glenn asked \"with that feature, that's our one deal breaker for you, Chuck, Cindy?\" and Cindy Adams answered \"That's a huge deal breaker.\", with Chuck adding \"we can't use this.\"; closing out, Cindy said \"probably not the right time for this product for us.\" Two things need checking. **1. Whether they belong on this board at all.** The prospect track is defined as an ATI need surfacing inside a CSM recurring meeting, and this was an onboarding/introduction call organised by Kristine with the ATI demo folded in on the spot. Unlike RedHelm (a new-business meeting, not added), Capstone had the app installed, a number provisioned, a 14-day trial running and the client placed a live test call during the meeting — engagement comparable to Parachute Techs, who are on the board after a single demo. **2. The 0% itself.** The rejection was verbal, on the call; there is no decline email and no emails/capstoneworks.com folder in the repo. The only corroboration is the internal Teams \"remove their number\" note of 8/11, which is not admissible evidence here. Note also that they are a paying client mid-onboarding — losing ATI is not losing the account.",
  "[CHURN SIGNAL — unverified, no rung change] The internal churn review of 2026-08-11 (Fathom 779618229, with Daniel Wang, Jazz Laban, Anushree Fomra, Crispin Casipit and Kevin Sebastian, and no one from any client) closed by naming Impact Group as the next churn case to review — that session actually only covered TwentyFour IT, and Impact Group was deferred to a follow-up. This cannot move a rung under this board's rules (internal meeting, second-hand, and the case has not even been reviewed), so Impact Group MN stays at 15% this run. But they have had zero ATI contact for 90+ days, and if the MSPbots account itself is churning then the ATI line should not keep idling at 15%. Please give a verdict once that review actually happens.",
  "[RESOLVED — ON RECORD] EstesGroup's 90% was inferred last run from Bill McCord's 8/10 line \"Got it past the high hurdle\", with the caveat that \"Bill never says outright that the high hurdle is the leadership sign-off\". He closed that question himself at 2026-08-12 16:07 UTC: his reply on the same thread (Grace on Cc, body read verbatim) opens \"Approvals are in place, is there any contract work to do here?\" and adds \"I have given MSPBots permission to create a ticket (that's it, no delete, modify, etc.) and tested.\" and \"Looking into how to get AITI to call our tech hotline when handoff is needed.\" Glenn replied at 17:06 UTC the same day: no new contract to sign, it sits under their existing agreement, and the only remaining step is selecting an AI Credit Subscription plan in the Marketplace, after which it is active — with Accounting looped in. The rung stays at 90% rather than 100%: the ladder's 100% is \"paying\", and no plan is selected and no invoice exists. Only one thing still needs a human — the trial expires on 8/17 while the plan waits on Bill to click it, and those two dates colliding needs someone watching.",
  "[UPGRADE THIS RUN — please verify] Mainstream Technologies moved from 55% to 90% on Tim Brown's reply of 2026-08-07 19:53 UTC (RE: AI Ticket Intake MVP & Pricing Feedback, Grace on Cc; the Outlook original and the archived copy at emails/mainstream-tech.com/2026-08-07_Re- AI Ticket Intake MVP & Pricing Feedback (Tim - pricing works, new asks).md were cross-checked). Asked whether the pricing works: \"Yes, this would work for me to move forward with on an after-hours basis.\" Asked whether he would subscribe once it is paid: \"Yes, permitting the already reported problems and issues we've faced are resolved prior to full launch of the product/service.\" Please rule on whether a conditional intent to subscribe counts as the 90% commercial rung. The case against: they have never taken live caller traffic, the call-forwarding voicemail stall is still open, and they are inside a PSA migration until 11/1. For comparison, EstesGroup was held conservatively at 55% — but EstesGroup has never discussed price with us, and Mainstream now has.",
  "[MATERIAL, BUT NOT ENOUGH TO MOVE THE RUNG] Layer 7 Systems may have churned; their 55% was left untouched this run. On 2026-08-07 at 10:24 Glenn wrote on the internal ATI Teams channel: \"Hi Grace Guo Daniel Wang - To update, Layer7Systems will not move forward with AI Ticket Intake.\", followed at 11:48 by a layer7-status-report.html post-mortem. This board cannot act on that: Teams is not admissible evidence here, and it is a second-hand account rather than the client's own words. Every client-side channel checked came back empty — the last item in emails/layer7systems.com is the 8/3 paywall notice (unanswered by Jacob), Outlook has nothing from layer7systems.com since 7/25, Fathom has no Layer7 session since 7/28, and the 8/7 weekly left neither recording nor notes. Ask Glenn for the client-side written source; once it exists, move them to 0% with a rejection block. The 8/14 and 8/21 missing-invite chase has been put on hold in the meantime. (Re-checked on 8/12: all four channels are still empty — no Layer7 weekly invite anywhere on Glenn's calendar through 8/25, nothing at all from layer7systems.com in Outlook since 7/20, no Fathom session since 8/7, and the last item in emails/layer7systems.com is still the 8/3 paywall notice. Sixth day of silence. Five consecutive days of four empty channels is itself a finding: either the client really has walked, or Glenn's internal note has no client-side basis behind it — and both cases need an answer from him.) (Sixth re-check on 8/13: all four channels are still empty — no Layer7 occurrence anywhere on Glenn's calendar through 8/26, nothing from layer7systems.com in Outlook since 7/20, no Layer7 session in Fathom since 7/27, and the last item in emails/layer7systems.com is still the 8/3 paywall notice. Tenth day of client-side silence, six consecutive days of four empty channels. This should stop being carried forward by daily re-checks — Glenn needs to produce the client-side basis this week, or say plainly that the internal note had none.) (Seventh re-check on 8/14: all four channels are still empty — no Layer7 occurrence on Glenn's calendar through 8/28, nothing from layer7systems.com in Outlook since 7/20, no Layer7 session in Fathom since 7/27, and the last item in emails/layer7systems.com is still the 8/3 paywall notice. Eleventh day of client-side silence, seven consecutive empty days. The daily re-check stops from this run — another seven days of it will not conjure evidence. Glenn to produce the client-side basis this week; if he cannot, the recommendation for the next run is to mark them not-pursuing outright rather than leaving a 55% in the average that nobody believes.) (8/15: the daily sweep has stopped, but the two cheapest channels were checked anyway and nothing changed — Outlook has had nothing from layer7systems.com since 7/20 and Glenn's calendar carries no Layer7 occurrence through 8/23. Twelfth day of client-side silence. Glenn to produce the basis this week, or the next run marks them not-pursuing.)",
  "[CONFLICTS WITH \"CLOSED LOST\" — please confirm] Precicom sits at 0% on this board (Martin Rodrigue declined a paid subscription by email on 7/24), yet Glenn's calendar carries an \"MSPbots Product Demo with Glenn\" on 2026-08-18 at 17:00 whose invitees are martin.rodrigue@precicom.com and billyd@precicom.com. The title is a generic product demo, so it is impossible to tell from the calendar whether it is about ATI, and no email thread explains it. Please confirm whether this is a revival of the ATI conversation — in which case the 0% needs revisiting — or a separate opportunity on another product line (NextTicket, Ticket QA and so on). (Re-checked 8/12: the meeting is still on Glenn's calendar with invitees unchanged.) (Re-checked 8/13: the meeting is still on Glenn's calendar but the invitee list has grown — alongside martin.rodrigue@precicom.com and billyd@precicom.com it now includes Micus Zhang, Jazz Laban and product@mspbots.ai. Micus leads the SOP Agent line, which strengthens the reading that this is not an ATI session — but that is still an inference and needs one sentence from Glenn to confirm.) (Re-checked 8/14: still on Glenn's calendar at 17:00 UTC on 8/18 with the invitee list unchanged — martin.rodrigue@precicom.com, billyd@precicom.com, Micus Zhang, Jazz Laban and product@mspbots.ai, with Glenn as organiser. It is four days away; this question cannot keep being carried forward unasked.) (Re-checked 8/15: still on Glenn's calendar at 17:00 UTC on 8/18 with the invitee list unchanged — martin.rodrigue@precicom.com, billyd@precicom.com, Micus Zhang, Jazz Laban and product@mspbots.ai, Glenn organising. Three days away. This has now been re-checked in identical terms for four runs with no answer: a client this board scores at 0% has a product demo the day after tomorrow. Either it is a revival of the ATI conversation, in which case the 0% must be revisited, or it belongs to SOP Agent or another line, in which case it is out of scope here and should be stated as such. One sentence from Glenn settles it.) (Re-checked 8/17 — it is tomorrow: Glenn's calendar was queried again for 2026-08-13 to 09-01 and the meeting is still there, 8/18 at 17:00 UTC, invitee list unchanged to the letter — martin.rodrigue@precicom.com, billyd@precicom.com, Micus Zhang, Jazz Laban and product@mspbots.ai, Glenn organising, isCancelled=false. This is the last run on which the question can still be answered in advance; after tomorrow it can only be recorded retrospectively. One sentence from Glenn today settles it — either this is a revival of the ATI conversation, in which case the 0% must be revisited, or it belongs to SOP Agent or another line and should be stated as out of scope here. If nobody characterises it today, the next run should classify it after the fact from the recording or notes.) (Re-checked 8/18, the day itself.) The \"MSPbots Product Demo with Glenn\" of 2026-08-18 17:00 UTC is still on Glenn's calendar with isCancelled=false, invitees martin.rodrigue@precicom.com and billyd@precicom.com (a new name, Billy D, alongside Martin, who wrote the July refusal), plus Glenn, Micus Zhang, Jazz Laban and product@ on our side. So a client scored at 0% has a demo we organised this afternoon. The rung is unchanged this run and no cell was added to the grid — the meeting has not happened, and a generic \"product demo\" on the calendar does not prove it is about ATI. But this is the last chance to ask before rather than reconstruct after: Glenn to say in one sentence whether this is an ATI re-engagement. If it is, tomorrow this item should become a real stage decision rather than hindsight.",
  "[SCOPE QUESTION — CLOSED. CIO Landing is on the alpha track as of this run; please check the rung.] This ran from 8/7 to today, twelve days. What forced it was checking all 70 Fathom recordings from last week (8/10–8/18) against the cells on this board: the only client-facing ATI meetings missing from it were CIO Landing's 8/10 and 8/17 weeklies. Everything else was there — Capstone Works 8/11, ACTS360 8/12, Metro Sales 8/13, Essential Tech 8/14, ISG Technology 8/17, My IT Crew 8/17, Unity IT 8/17. So this had stopped being a question of tidiness: the board was giving an incomplete answer to \"what happened last week\". The grounds for bringing them on: the 8/24 and 8/31 weeklies were queried directly this run and are still on Glenn's calendar with invitees icolombo, gdopazo, mcretari, Daniel, Grace and product@ unchanged; the 8/17 transcript was read verbatim this run; the trial has restarted; and 25 dedicated tickets have produced two real releases, on 8/14 and 8/18. The full derivation of the selftest (55%) rung sits in the client's evidence field, and two things need a human. (1) 55% is the first assignment for a new entry, and in particular the negative finding that no real callers are being forwarded to the AI rests on the absence of contrary evidence rather than on the client saying so. (2) ticket_scope_note has been rewritten in the same change (it named CIO Landing as untracked in so many words), and its figures were recomputed from the hand-written 8/7 values of 614/144 to 643/182, with a stated reason for each of the four remaining excluded names. If there was a real reason not to track them, it needs saying before the next run — the change has already landed.",
  "[VEHICLE SHIPPED, ASK NOT CONFIRMED MET] Essential Tech's AST-20984 (time-block on-call escalation schedules — the one Nidhi called non-negotiable) is linked to AST-20245 (ACTS360 time-based routing), which went released & live on 8/6, so the board counts it as delivered. But AST-20245's own acceptance criteria have AC-3 (sequential dialling within a window) and AC-5 (overlapping-window validation) struck through. Essential Tech's ask is that five technicians not all get buzzed after 6pm — confirm the shipped build actually routes to different people per time block before telling them, or this repeats the Unity IT SMS situation. (Re-checked again in the 8/13 full sweep: AST-20984 is still linked under AST-20245 and its own status is still pm in progress. Essential Tech's weekly is on 8/14, which is the soonest chance to settle this face to face.) (The 8/14 weekly happened, but this is only half answered. Glenn demoed the scheduling skill: multiple business-hours rosters, each mapped to an hours range or tag, with anything outside them falling to a default after-hours roster — so routing to different people per time block does exist at the configuration level. Two things remain unconfirmed. First, when Nidhi asked what happens when someone is on holiday and whether it can read the Shift tool they use, Glenn said plainly that there is no integration and rosters must be updated manually. Second, Nidhi said she would try it herself — \"I need to check this out myself\" — and as of 8/15 there is no evidence she has, with the next meeting on 4 September. So the original ask, that five technicians not all get buzzed after 6pm, still has no client-side confirmation, and AST-20984's own status is still pm in progress. Confirm before reporting back.)",
  "[INHERITED STATUS — please verify] Three Unity IT tickets moved from not-started to delivered because they are linked to AST-20247 / AST-20246, yet AST-20247's own description says SMS notification is \"not currently supported, planned for beta\" — and SMS is exactly what two of those Unity IT tickets ask for (voice + SMS retry every 5 minutes, SMS/Teams notification). AST-21144 itself states it \"depends on SMS notification capability — not yet built, cannot ship ahead of it\". So the vehicle shipped but Unity IT's SMS ask probably was not met — and Glenn has already written on 8/7 saying \"nearly all of the deal-breaker requests\" are complete, with a demo next week. Align the story before that call; getting it wrong puts a 90% deal at risk.\n\n[ESCALATED THIS RUN] Glenn has now said it out loud: at 13:31 UTC on 8/12 he wrote to Kip that \"Which means every deal-breaker you raised is now live\", on the basis that AST-20756 (time entry) shipped that day and AST-20755 (contract-based tiering) moved to waiting-for-client. But one of the deal-breakers Kip listed on 7/28 was persistent retry \"every 5 minutes via voice and text\" — the matching ticket AST-21144 is still \"new\" and states of itself \"Depends on SMS notification capability — not yet built, cannot ship ahead of it\", while AST-20757 (SMS/Teams notification) is also still \"new\" and only shows as delivered here because it is linked under AST-20247. **SMS still does not exist.** The same email asks for a walkthrough this week or next — before that call the story has to become \"time entry and contract-based tiering are live, the SMS side is still on the beta plan\", or it falls apart in front of a 90% deal.\n\n[VERIFIED BY THE CLIENT THIS RUN — the claim really was wrong] Kip's reply at 17:47 UTC on 2026-08-13 (body read verbatim) restates two undelivered asks word for word: \"We would need an easy way to assign the on-call technician based on a schedule. Additionally, we would need the system to call the on-call technician multiple times if the initial call isn't connected (in addition to PSA, and SMS alerts).\" The matching tickets AST-21143, AST-21144 and AST-20757 are all still \"new\", and SMS still does not exist. So the 8/12 line \"every deal-breaker you raised is now live\" was contradicted by the client at the first opportunity. This is no longer a warning to align the story before a call; it is something that has already happened. File it as a lesson: before any future \"it's all done\", walk the client's own list against ticket status item by item.",
  "[NEW CLIENT — please verify] My IT Crew (myitcrewny.com, Brooklyn NY) was added to the pipeline at 15%. The evidence is the email thread of 2026-08-06: Marlene Fanini wrote \"Do you offer an AI call triage? Meaning an answering-machine service powered by AI instead of people.\", Kristine confirmed the same day and sent Glenn's booking link, and Glenn followed up with the feature list (emails/myitcrewny.com/2026-08-06_Re- AI calls.md); on 8/7 she chased pricing and Glenn quoted 6 credits per minute. Please confirm the client belongs on this board, that Kristine is the right CSM, and whether the myitcrewny.com onboarding placeholder ticket predates this enquiry. Updated this run: the demo is booked — \"MSPbots Product Demo with Glenn\" on Glenn's calendar for 2026-08-13 at 17:00 UTC. The only invitee is yossil@myitcrewny.com (Yossi Levy); Marlene Fanini, who wrote both emails, is not on it — please confirm that is not an oversight. The rung is unchanged at 15%. Updated again 8/13: the Marlene point is resolved — a second demo has appeared on Glenn's calendar for 8/17 at 16:00 UTC with both marlenef@ and yossil@ invited. The 8/13 17:00 slot is still there with Yossi alone, so both now exist. Please confirm whether 8/17 is a reschedule or an addition; if it is a reschedule, pull the 8/13 slot so the client is not holding two conflicting invites. Conclusion on 8/14: this can be closed. The 8/13 17:00 slot has vanished from Glenn's calendar and Fathom shows no My IT Crew session at all, leaving only 8/17 16:00 with both Marlene and Yossi invited. The \"reschedule or addition\" question is answered in practice — one slot, no conflicting invites. The one thing still to ask Glenn is whether we moved 8/13 or the client pushed it back: nothing written distinguishes the two, and they mean very different things for how warm this client is. The 8/13 cell is logged as \"no record · silent\" per the rules. Re-checked 8/15: the 8/17 16:00 slot is still on Glenn's calendar with marlenef@ and yossil@ invited, and no new email has appeared. The demo is the day after tomorrow — make sure the 14-day / 3,000-credit trial is activated on the call itself, and align with Kristine on the 6-credits-per-minute quote given on 8/7 before it starts.\n\n[Updated 8/18 — RAISED THIS RUN from 15% to 35%, please review] The 8/17 16:00 UTC demo went ahead (Fathom 787854106, transcript read verbatim). On the call the 14-day trial was enabled, the app installed, the PSA connected, the phone-intake skill and voice chosen and the number 716-271-8542 provisioned — exactly the ladder's 35% definition. The verbatim quotes are in that client's stage_evidence. Three things need a human: **1. Why 35% and not 55%.** The client has not placed a test call of their own (Glenn said \"you can test it already right now\", but there is no record of any test), so it stops at 35%; if a test call lands in the next couple of days it should move again. **2. The two gaps are promises with no tickets.** Glenn's minutes commit MSPbots to follow up on dynamic ticket status and keypress routing, yet neither exists in ClickUp — the same pattern as the Unity IT \"every deal-breaker is now live\" misfire. Log them before the client asks. **3. Who moved the 8/13 slot is still unanswered** after four runs, and it did not come up on the 8/17 call either.",
  "[CORRECTION ON RECORD] Metro Sales 8/6 moved from \"no record\" to \"cancelled\": Dan Olsen wrote at 22:28 UTC that day, \"I won't make it today. David is out and James is at a conference, so unsure of his availability.\", and Glenn replied \"No worries!\" at 22:35 (emails/metrosales.com/2026-08-06_Re- AI Ticket Intake - Weekly Call w- Metro Sales.md). The 7/23 and 7/30 slots still carry no written trace at all. A re-check on 8/13 shows the 8/13 and 8/20 weeklies still on Glenn's calendar with invitees unchanged (the 8/13 one runs at 14:30 UTC today). Updated 8/14: the 8/13 weekly went ahead, and it was the first full client-side turnout since 6/18 (Dan Olsen, David Ulbrich and James Eubanks). The cell has moved from Scheduled to Held (Fathom 781050095). The 8/20 weekly was still on the calendar at the 8/14 re-check. Re-checked 8/15: the 8/20 14:30 session is still on Glenn's calendar with all three client attendees (dolsen, dulbrich, jeubanks) invited, so it stays Scheduled. There is no new Metro Sales evidence this run — neither the transfer-bug fix nor the dedicated Zoom test number James promised has left any written trace yet.",
  "[POSSIBLE NEW PROSPECT — not added, and not verified] An email from Leonard Narvaza at 2026-08-10 21:59 UTC, \"Re: Quick check-in—how are things going at NuView? — Next Steps on AI Tools\", opens with AI Ticket Intake as item 1, and the preview snippet records the client's condition as \"tickets need to land directly on engineer calendars to be valuable for NuView\". Only that search-result snippet was seen — the full thread was not opened, and no NuView meetings or tickets were checked — so they are not added to the pipeline and carry no rung. Please decide whether this is worth verifying properly next run (the thing to establish: whether the ATI need surfaced inside a CSM recurring meeting, which is how this board defines the prospect track). Added 8/12: Frank Tian replied in the same thread at 11:06 UTC on 8/11, with AI Ticket Intake still item 1 and the client's condition restated. Only the search-result snippet was seen again this run, not the full thread, so the call is unchanged — not added, no rung.",
  "[POSSIBLE NEW PROSPECT — not added] On 2026-08-06 Nick Franco met RedHelm (Christopher Risher), who is evaluating AI Intake for Tier 0.5 self-resolution alongside NextTicket, on Halo PSA (Fathom 774019605). Not added to the pipeline because it was a new-business meeting rather than a CSM recurring meeting, which is how this board defines the prospect track. Decide whether to make an exception.",
  "[CORRECTION ON RECORD] Big Fish Technology moved from 15% to 55%. Upstream tickets.json leaves the client field empty on 486 of 614 tickets, so the board had been showing them with no tickets at all. They actually have 12, three of them bugs found on real calls. The meetings did stop after 6/3, hence 55% (self-test done) rather than higher — please confirm the rung is right.",
  "The same data bug also affected Metro Sales (0→15 tickets), Titanium.Red (1→10), Parachute (1→10), Mainstream (3→8), Layer 7 (2→5) and Dev-Source (1→4) — ten clients in all. Their ticket, delivered and told-the-client verdicts were all understated and have been recomputed. The root cause is in the upstream generator and should be fixed there, otherwise every refresh depends on the keyword fallback.",
  "Essential Tech has 4 slots (6/10, 7/1, 7/15, 7/22) that were scheduled but have neither a recording nor notes — did they not happen, or happen unrecorded?",
  "Valeo 7/29 and Metro Sales 7/23 vanished from the calendar with no cancellation email — ask Glenn whether they were cancelled or moved.",
  "The ClickUp export has no completion timestamps, so \"delivered but not communicated\" is inferred from days-since-last-contact and cannot be proven. Confirming it means checking each ticket's activity log in ClickUp.",
  "[ON RECORD] Precicom moved from 55% to 0% on the strength of Martin Rodrigue's decline email of 2026-07-24 (verbatim in rejection.quote, cross-checked between Outlook and the archived copy), with Glenn's 7/29 reply closing it out. This loss had never reached the board, so the rung was overstated from 7/24 onward — please confirm there was no later revival contact and decide what happens to their 7 open tickets. (See also the new 8/18 demo question above.)",
  "[RESOLVED — ON RECORD] The standing question about EstesGroup (\"held at 55%, but should internal campaigning for sign-off count as commercial discussion?\") has been settled at 90% this run — the evidence is the first item in this list (Bill's 8/10 \"Got it past the high hurdle\"). The reason for holding them at 55% was that we had never discussed price with them; Glenn's 4 Aug paywall notice and 6-credits-per-minute quote removed that objection.",
  "[RESOLVED — ON RECORD] At the 8/7 Essential Tech weekly Nidhi Patel said \"I haven't tested the system yet\", leaving the question of whether the testing owner had changed and whether 55% still held. The weekly of 2026-08-14 (Fathom 782689046, transcript read verbatim) closes it: Nidhi has now placed her own test calls — \"I did some of the calls that after hours... I was trying to be a nasty customer.\" — and walked through the failures in detail. So 55% holds; the evidence behind it has simply moved from the 11 tickets raised on the Michael/Simon side to Nidhi's own testing. It also confirms why it cannot go higher: ticket creation is still switched off (it needs Simon to grant PSA permission, and Nidhi does not want it on before quality improves), so there is no live caller traffic and no pricing conversation.",
  "[NEW MEETING ADDED — please check the calls] The Essential Tech weekly of 8/14 01:00 has moved from Scheduled to Held (Fathom 782689046, transcript read verbatim; notes at meetings/Essential Tech/2026-08-14-AI-Ticket-Intake-Weekly-Touchbase.md). The rung is unchanged at 55%. Three things need a human. **1. How much weight the quality feedback carries.** The three problems Nidhi reported — talking over the caller plus robotic/spliced audio, dropping the second of two issues, and ignoring troubleshooting already done — were raised as tickets and shipped the same day (86e2u63ny / 86e2u63tb / 86e2u63uz). Shipping that fast is worth verifying: is it a real fix or a suppressed symptom, particularly for the interruption behaviour, which is conversational and not a string change. **2. Ticket-creation permission is this client's real blocker.** Nidhi's words: \"I don't want to do that at the moment because I really think that it needs a lot of improvement from my end\", and she asked whether this is a test or the live environment. That conversation belongs with Simon, not Nidhi. **3. The calendar disagrees with what was agreed on the call.** They settled on 4 September at 09:30, yet Glenn's calendar has no 9/4 occurrence while the 8/21 01:00 slot is still there (re-checked 8/15). The board keeps 8/21 as Scheduled under the invite-exists rule, but the client has already said that week does not work — Glenn needs to correct the calendar.",
  "[RESOLVED — ON RECORD] Essential Tech's cadence contradicted itself on the 8/7 call: Nidhi first asked for every other Friday for this month, then confirmed \"Next week, Friday, same time\". A re-check on 8/12 shows both 8/14 and 8/21 still on Glenn's calendar, so both remain \"Scheduled\" — Glenn to settle weekly vs fortnightly with Nidhi. Re-checked 8/14: both the 8/14 01:00 and 8/21 01:00 sessions are still on Glenn's calendar (invitees simon@ and npatel@, with Leonard also on it), so both remain Scheduled. The 8/14 session is the chance to settle face to face whether AST-20984's time-block scheduling really meets the ask, and to close the loop on 20986/20987. Conclusion on 8/15: the 8/14 session went ahead and the cadence question is answered, but the calendar has not caught up — on the call Nidhi said neither next week nor the week after works for her or Simon, and the two agreed verbally on 4 September at 09:30. Yet at the 8/15 re-check Glenn's calendar still carries 8/21 01:00 (invitees simon@, npatel@ and Leonard) and has nothing at all on 9/4. The board therefore still logs 8/21 as Scheduled — the rule is that an existing invite counts — but it is a meeting the client has already declined in advance. Glenn to withdraw 8/21 and send the 9/4 invite. Note also that 20986/20987 still did not come up on the 8/14 call. Closed on 8/19: Glenn did it. At 13:15 UTC on 2026-08-18 he wrote on the same thread to withdraw the session — \"Cancelling this meeting - New schedule on September 4 as per Nidthi.,\" — the 8/21 01:00 occurrence has disappeared from his calendar, and a new session exists on 2026-09-04 at 01:00 UTC with npatel@, simon@ and product@ invited. The board therefore reclassifies 8/21 from Scheduled to Cancelled. One thread stays open: 20986/20987 have still never been reported back to the client.",
  "[RESOLVED — ON RECORD] After Valeo terminated ATI in writing on 8/4, the 8/12 and 8/19 ATI weeklies stayed on Glenn's calendar for five days. A re-check on 2026-08-13 settles it: the Wed 15:00 ATI recurring series has been withdrawn in full and no ATI occurrence remains on the calendar; the same slot with the same client attendees (esvendsen, ccramer, paulg) now carries \"SOP Agent Weekly Touchbase - Valeo Networks\" on both 8/19 and 8/26, with SOP Agent team members such as Micus Zhang and David Hu added. The 8/12 and 8/19 cells on this board have been reclassified as Cancelled. On method: there is no cancellation invite (Grace was never on this series), and the internal Teams line of 8/12 16:09 UTC — \"Valeo Networks has cancelled the weekly AI Ticket Intake call and is okay with transitioning to…\" — counts only as corroboration; the finding rests on the calendar itself. Conclusion: ATI really is closed at Valeo and the client has moved to the SOP Agent line — the account was not lost, ATI was.",
  "Unity IT is still scored 90%, but Kip Haroldsen's 7/30 email puts them \"holding off — We didn't feel the product worked well with our last test call\", waiting on on-call scheduling, persistent retry, time entry and contract-type routing before they will even resume testing. Glenn reported three completed skills on 8/7 and then, on 8/12, that time entry and contract-based tiering had both shipped, asking for a walkthrough — Kip has answered neither, so there is still no evidence the hold has been lifted. Left at 90% this run — Aaron/Glenn to review, because a 90% that has not replied in two weeks deserves the question. Updated 8/14: Kip finally replied (17:47 UTC on 8/13, body read verbatim), but the reply does not lift the hold — he restates two undelivered asks and adds a harder objection: \"this cost comes in higher than our current cost for a live operator. I'm not sure that I am seeing the benefit of using this after-hours.\" That is not merely a price complaint but a value one. The rung stays at 90% this run (the ladder's 90% is \"in pricing/contract discussion\", and he is comparing cost rather than declining) — but Aaron/Glenn need to rule explicitly: is 90% defensible for a client that has never taken live caller traffic, has two undelivered deal-breakers, and has now put \"I'm not seeing the benefit\" in writing? If the answer is no, the right destination is probably 15% (interest) rather than 0% — he has not declined.\n\n[Updated 8/18 — DOWNGRADED THIS RUN from 90% to 55%, Aaron/Glenn to review] The question this board has asked three runs running was answered by the client himself. On the 2026-08-17 monthly with Crispin Casipit (Fathom 784901107, recording 174094813, transcript read verbatim), Crispin asked \"you have the ticket intake. Any, any feedback on that one?\" and Kip answered \"No, I don't know that we're ready to give that a go.\", adding three things: \"right now I have a live body that answers the phone and it costs me half of what you guys are going to start at.\", \"There's not an easy way for them to go in there and update their schedule in MSPbots.\", and \"I'm also, I'm not 100% that people are going to enjoy talking to AI when they call my office.\" Under the ladder, 90% means an active pricing or contract discussion; he has stepped back to not being ready to try it, so 90% no longer holds. The rung is set to 55% (MSP self-test) rather than the 15% floated last run, because 55% is defined as \"client placed their own test calls, raised bugs/requests\" and Unity IT has done both — on 8/17 he said \"we tried it out one time and it was kind of glitching out on me\", and they have raised 7 tickets including three deal-breakers. It is not 0% either: he has not declined, and in the same call says \"Well, I'll give the number a call. I'll see what it does.\" Two things to check: **1. 55% or 15%?** If one glitchy test call is not enough to hold 55%, rule for 15% and say which reading applies; the board will follow. **2. Why did our delivery news never land?** Kip did not once mention the time entry and contract tiering shipped on 8/12 — two weeks of delivery that, from the client's side, might as well not have happened.",
  "[SLA BREACHED — needs action] Certified CIO is the hottest new opportunity (Eric Lamdin asked \"Can you demo it for us?\" unprompted on the 8/5 monthly), and a re-check of Glenn's calendar on 8/13 still shows nothing booked through 8/26 — the sixth consecutive empty check, day 8, with the 7-day SLA window having expired yesterday. My IT Crew has cleared and in fact gained a second slot (8/13 and 8/17). That leaves Certified CIO as the only opportunity still bleeding this run, and it is now past the deadline rather than approaching it. Dev-Source and Parachute both died of exactly this delay and this one is walking the same road. Crispin should offer Eric three concrete times today rather than relying on the self-service booking link. Updated 8/14: day 9, the seventh consecutive empty check — Glenn's calendar still shows nothing for Certified CIO through 8/28 and the repo has no emails/ folder for them. My IT Crew (8/17) and ISG (8/17) both have slots this run, leaving this as the only opportunity with nothing at all — and the only one where the client asked for the demo unprompted. This entry has now appeared in identical wording for three runs. If nothing is booked today, escalate it to someone who can intervene rather than repeating it on the board again. Updated 8/15: day 10, the eighth consecutive empty check — nothing on Glenn's calendar through 8/23, no Certified CIO demo thread anywhere in Outlook, and still no emails/ folder in the repo. The SLA is three days past. From this run the board stops repeating the item: a manager should either assign a time directly or decide to drop the opportunity and mark it not-pursuing. This is the only prospect that asked for a demo unprompted and still has nothing booked; at this point it is not a scheduling problem but an ownership one. Re-checked 8/16 (Sunday): day 11, the ninth consecutive empty check — this run widened the calendar window from 8/23 out to 9/20 and queried Glenn's calendar twice, once filtered by a certifiedcio.com attendee and once as a free-text search for \"Certified CIO\"; both returned zero events. A search of Outlook mail for \"Certified CIO\" also returned nothing, and the repo still has no emails/ folder for them. So it is not merely \"nothing in the next fortnight\" — there is nothing anywhere in the next five weeks. The SLA is four days past. The 8/15–8/16 weekend brought no new evidence anywhere on this board, so the item stands as before: a manager assigns a time or the opportunity is dropped. Re-checked 8/18: day 13, the tenth consecutive empty check. Glenn's calendar was queried again through 9/30, both by certifiedcio.com attendee and by the free-text \"Certified CIO\", with zero results, and the repo still has no emails/ folder for them. This item will not be expanded run by run any more — it is not a scheduling problem, it is waiting on one decision from a manager.",
  "[NEW MEETING ADDED — and a wasted opportunity] The ISG Technology monthly of 8/17 21:00 UTC moves from Scheduled to Held (Fathom 787445651, recording 174090268, recorded by Kristine Gadayan, four client attendees plus Sean Fleming, Glenn present). The rung is unchanged at 35%. The problem is what was discussed: per the Fathom summary the whole call was NextTicket dispatch adoption (about 95% of new Managed Services tickets now dispatched by the system) and an SOP Agent demo with its pilot conditions — ATI appears neither in the discussion points nor in the next steps. Last run this board said it was the first contact since 7/20, not to waste it, and to send the ticket-status email beforehand. That email was never sent, and seven untouched enhancements have now passed a second contact in silence. Two things for a human: (1) only the Fathom summary was read here, not the transcript — if ATI did come up, provide the excerpt and the board will correct itself; (2) ISG is the largest single-client ticket backlog on this board (10 tickets, 7 not started) while its meeting time is being taken by SOP Agent — decide explicitly whether ATI is still being pursued here, and if it is, a status email saying what is being built, dropped or deferred must go out before the next monthly.",
  "[METHOD DEFECT — it under-reports the most recent client contact] The repo's emails/ export appends new messages to the existing thread file, while the filename carries the date of the *first* message in that thread. This run's example: Glenn wrote to James Eubanks at 08:41 UTC on 8/17 saying the call-transfer fix is live and ready to test, and asking whether the Zoom test number is still available — that message was appended to emails/metrosales.com/2026-08-13_Metro Sales — AI Ticket Intake Weekly Call Summary (Aug 13, 2026)... .md, whose filename still reads 8/13. The builder derives recent client emails, days since last contact and the post-delivery \"told the client\" lag entirely from filename dates, so threads like this are systematically dated several days early. The builder was not changed this run; the limitation is simply written down: the contact date shown on the board is the date the thread opened, not the date of its latest message. The fix belongs either in the exporter (one file per message) or in the builder (read the **From:** date range in the file header).",
  "[NEW THIS RUN — a human needs to open two screenshots] The EstesGroup exchange of 8/18 is the one piece of evidence this run could not finish reading, and the one piece that could change how a 90% client is scored. At 09:55 UTC on 8/18 Glenn reported a permission error writing call transcripts into their ticket notes and supplied the ConnectWise fix; at 20:53 UTC Bill McCord replied, and the body reads, verbatim and in full, \"Glenn,\" and \"So, about that.\", with eight inline images attached, two of them full screenshots of 202 KB and 175 KB (original in Outlook: subject \"Re: AI Ticket Intake Transcript Note - Write Failed\"). \"So, about that.\" points in no direction on its own — it could mean \"the permissions are sorted\" or \"we need to talk about this\" — and this client is sitting at 90% with the win already announced internally, the trial expired on 8/17 and still no payment record of any kind. Please open those two screenshots in Outlook and write the answer back: if Bill is confirming the permission fix and an active subscription, they move to 100%; if he is raising an objection or reopening the conversation, the rung needs re-examining downward. This board does not move a stage on a guess, so it holds at 90% this run.",
  "[New this run · did the Metro Sales weekly on 8/20 actually happen?] The 14:30 UTC weekly on 8/20: the invite is on Glenn's calendar, carries no cancellation flag and has the full invitee list, yet a full-text Fathom search across 8/13–8/20 finds no Metro Sales client session, none of the 21 recordings from 8/20 is one, the newest note under meetings/Metro Sales/ is still 8/13, and no summary email followed. The only client-facing action that day was the trial re-enablement email 47 minutes before the slot, which never mentions the call. It is therefore recorded as no-record. Glenn, please answer directly: did this meeting happen? If it did, where is the recording or note; if it did not, was it the client or us? This client sits at 90% and Glenn himself wrote that the transfer bug is the last blocker before paid — this cell cannot stay unresolved.",
  "[New this run · Mainstream's call-length alert is missing a decision and a date] At 16:43 UTC on 8/20 Glenn sent Tim the design, which asks the client to choose between three termination options (A, dashboard flag only; B, AI auto-terminates; C, a manual Disconnect button) and defaults the threshold to 7 minutes — while what Tim described on 8/19 was an alert once a caller has been with the AI 5–7 minutes without a transfer. Two calls for a human: (1) should AST-21625 get a due date before Tim replies? It is the only one of the four Mainstream tickets with neither an owner nor a date, while AST-21626 and AST-21627 both carry due 2026-08-26. (2) If Tim picks B, we are introducing \"the AI ends the call by itself\" as new product behaviour, which has to be read together with the \"every call produces a ticket\" principle in AST-18104 — do not let the two tickets specify it separately.",
  "[New this run · CIO Landing's TEST 5 has no ticket, and Aug 24–27 are now promises to the client] (1) In German's 8/20 report, TEST 5 reads verbatim: \"Was able to add in the notes!! but added them in the discussion tab instead of internally\". No ClickUp ticket clearly covers it — AST-21421 specifies creating two internal notes and says nothing about the wrong flag being used. Decide whether this rides on 21421 or needs its own ticket. (2) Glenn sent the per-item dates to the client at 20:14 UTC on 8/20 (Aug-24 / 25 / 26 / 27), yet AST-21492 (the ticket number is never read back to the caller) is itself still new and only shows as in-progress by riding on AST-18104. Engineering needs to confirm whether those four dates are commitments or estimates — they are already in the client's inbox.",
  "[New this run · four tickets went from complete to Closed, so the delivered count fell] Four tickets that were still complete at the 06:00 cache refresh on 8/20 are Closed as of this run (8/21): Essential Tech's 86e2u63ny (the AI ignores troubleshooting the caller has already described), 86e2u63tb (spliced, inconsistent audio on the \"one moment\" prompt) and 86e2u63uz (conversation latency), plus CIO Landing's 86e2u6nzh (the bot could no longer create tickets after 8/10). All four previously carried a 2026-08-14 ship date; they now leave the delivered bucket for the closed one, which lowers the delivered counts shown for Essential Tech and CIO Landing. Confirm what Closed means on these four: \"fixed, shipped, ticket simply closed out\", or \"not fixing it\"? If the former, the ship date should not be lost; if the latter, the client needs to be told.",
  "[New this run · two client-facing emails from 8/20 exist in Outlook but not in the repo's emails/] Searching Outlook through the connector for mail after 8/20 surfaced two client-facing messages with no matching file under emails/<domain>/: (1) gdopazo@ciolanding.com replied at 19:00 UTC on 8/20 asking whether the skill that tells the caller their ticket number on the same call exists now that Ticket Lookup has shipped, and Glenn answered at 20:14 UTC that the capability is being built as the \"Re-enable Ticket Number Verification/Confirmation\" item on the list. (2) Glenn's 13:43 UTC reply on 8/20 on the Metro Sales weekly-summary thread (the call-transfer fix has been applied to the AI Intake, please keep testing). Yet emails/ciolanding.com still ends at 8/19 and emails/metrosales.com still ends at 8/17, while Mainstream's 8/20 mail from the same day did sync — so the three sync runs on 8/22 missed these two rather than skipping the day. The \"was the client told\" column is computed from the filename dates under emails/<domain>/, which makes this an input gap that degrades the verdict silently. No files were hand-added this run: emails/ is a sync artifact rather than part of the judgment layer, and patching it by hand would hide the sync problem itself. Please check what the sync's mail filter covers, and re-check after the next fetch whether these two land. The impact is contained for now: CIO Landing's last client contact still reads 8/19 (4 days) and Metro Sales' 8/17 (6 days), both inside 7 days, so neither notify verdict changes.",
  "[New this run · CIO Landing's fourth deliverable does not match what the client asked for, and our own \"is this a deal-breaker\" question is unanswered] At 16:28 UTC on 2026-08-26 Glenn told the client all four enhancements were released. On the ConnectWise ticket format item, AST-21421 (86e2r5fn3) originally specified moving the transcript and recording out of the note body and into attachments; what shipped is two internal notes with the transcript inline. Glenn said so himself in the same email: \"The transcript record is currently included as-is rather than as a downloadable TXT attachment — this is due to other clients requested this setup, let me know if this is a deal-breaker.\" As of 01:10 UTC on 8/27 the client has not answered. Someone should settle it at the 8/28 20:15 weekly: does this count as met? If yes, AST-21421's acceptance criteria need editing; if no, it needs a new ticket — and this client is at 55% and mid-way through a 50-call re-test.",
  "[New this run · Metro Sales' trial now has an expiry date (about 9/4), with no weekly and no replies] Glenn's own words at 10:04 UTC on 8/26 were \"you still have 9 days remaining on your free trial\", which puts the 14-day trial re-enabled on 8/20 at roughly 9/4. At the same time: neither the 8/27 nor the 9/3 weekly exists on Glenn's calendar, and the client answered neither the 8/20 nor the 8/26 email. Glenn should confirm three things: (1) was the weekly stopped deliberately or simply not sent; (2) is 9/4 the expiry, and does it get extended or turned into a paid conversation; (3) can the transfer bug (same class as Valeo's AST-20255) get a fix date before it expires — it is the \"final blocker before moving forward with the paid plan\" he himself put in the 8/13 summary email.",
  "[New this run · the Titanium.Red reconnection email has gone out; it needs a follow-up date and one judgement call] At 18:28 UTC on 8/26 Glenn emailed Natalie Zieger using \"pre-transfer ticket creation has shipped\" as the hook — exactly the move this board recommended last run. No reply from the client this run, so the rung stays at 0% (Closed Lost). Someone should decide: (1) how long without a reply before it is filed back to the Q4 conversation (early September seems right); (2) if Natalie agrees to test it \"informally\", does the client return to 15% or straight back to the 55% depth it had before — they raised 10 bug/quality items before 7/31, and how the rung is restored is a human call, not something the script can decide.",
  "[New this run · CIO Landing's two cancellation emails name no occurrence, so 8/28 and 8/31 are an inference] At 14:05:57 and 14:06:36 UTC on 2026-08-27 Glenn sent two cancellation invites with identical wording; the entire body is a one-line PTO reschedule note, and neither states the date of the occurrence being cancelled. Assigning one to 8/28 and one to 8/31 rests on indirect evidence: searching Glenn's calendar for attendee=ciolanding.com over 8/20–9/20 shows both are gone, leaving only the client-booked 9/3 session. Glenn should confirm in one line: were the two cancelled sessions in fact 8/28 and 8/31? If one of them actually cancelled a later occurrence such as 9/7, then 8/28 or 8/31 is a silent slot — gone from the calendar with no cancellation on record — which the runbook says to record as norecord + silent, a completely different verdict.",
  "[New this run · CIO Landing's weekly series is broken, and 9/3 is a one-off the client booked themselves] The 9/3 15:15 UTC session is organised by support@ciolanding.com, not Glenn, with Glenn merely invited — it comes from the client's own scheduling page and is not the next occurrence of the Monday-20:15 recurring series that started on 8/7. A re-check confirms that series has no further occurrence before 9/20. Somebody needs to decide: rebuild the weekly series, or move to booking session by session? This client is at 55% and running a 50-call re-test, and with 8/24, 8/28 and 8/31 all failing to happen, they will have gone three weeks without a live session by the time 9/3 arrives.",
  "[New this run · which product the KRS-IT 9/3 session configures needs establishing first] The meeting is named \"Next Ticket x Intake Configuration\", is organised by Aaron Ver, and Josiv has accepted on the client side. The name carries two products at once — NextTicket and Intake — and the calendar body holds only a Teams link with no agenda, so the evidence does not say how much of the session is ATI. Aaron should put an agenda on it beforehand. Note also how the rung is judged: the session itself is not grounds for a promotion; only a genuinely configured app and an issued number take this from 15% to 35%, with the record kept on the ticket."
 ]
}
