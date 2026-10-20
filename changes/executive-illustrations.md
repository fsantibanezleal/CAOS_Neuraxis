- The executive view's three illustrations are drawn as scenes on one operations floor (`frontend/public/executive/pain.svg`,
  `situation.svg`, `proposal.svg`, 800 by 480, bilingual `data-lang` labels at size 22 on chips, theme tokens only). The pain is
  animated (a 9 s loop: the queue lengthens, the spend meter rises, the alarm lamp lights; still under reduced motion) and the
  proposal repeats its floor with the approach in place: a gate per action that opens only its own key, a freshness check and a
  verifier on the record, a cheap lane for easy tickets, a stop button in reach, a filled audit log and a dark alarm lamp. The
  situation shows the five roles in the builders' and the system owner's rooms joined by a thin hand-off, and four stations
  along the queue (scripted automation, an agent that drops rules, an approval gate that repeats work, a guardrail fence with a
  gap) with the router tested on questions, not actions.
- `frontend/src/content/illustrations.test.ts` is the contract test of the three files: token-only colours defined by the
  installed shell, every label in both languages at size 22 or more, no chart, image, link or event, the pain's keyframes and
  reduced-motion block, and one shared floor for the pain and the proposal.
