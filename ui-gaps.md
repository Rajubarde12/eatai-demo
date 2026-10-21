# UI gaps: shipped app vs eatai-demo

Last updated: 2026-10-21

Food system (scan, Food list, diary log, first meal) **done**. Yeh list un screens ki hai jo app mein already hain, lekin demo jaisi nahi dikhti. Naye features (referral, Coach Partner, client group, group meal share) yahan nahi.

Accepted: shared meal open par app **full diary-style details** dikhati hai. Demo compact sheet hai. Full details rakhni hain.

Priority: High pehle. Ek cycle mein ek gap.

## High

1. **Chat inbox header** (`eatai-app/src/app/(tabs)/chat.tsx`)
   - Demo: 4+ chats par search **aur** request banner dono. App: search ho to request banner hide.
   - Demo banner: “N chat request(s)” + “Accept to start, or decline quietly.” App: “N message request(s)” bina caption.
   - Fix: search + banner saath; copy demo jaisi.

2. **Community Photo chip** (`community/[id].tsx`)
   - Demo: Text aur Photo Pro nahi. Sirf Food log `· Pro`.
   - App: `📷 Photo · Pro` dikhati hai. Label hatao; gate sirf Food log par.

3. **Coach community hero**
   - Demo: qualification line host name ke neeche; “Verified” tab jab review ho.
   - App: qualification missing. Host line + verified rule demo se match.

4. **Shared meal photo (receiver / real device)**
   - Chat/community thumb blank ho sakti hai jab URL local ho ya diary delete ke baad file mit jaye.
   - Stage backend image-keep deploy + real-phone verify. Community thumb par chat jaisa load-fail fallback.

## Med

5. **Chat meal picks**
   - Demo: 96px tiles, lime inset jab selected (`meal-pick.on`).
   - App tiles hain; selected lime ring/inset weak hai. Demo CSS match.

6. **Discover cards**
   - Demo: card, tags, **Say hi** card ke neeche alag.
   - App: Say hi tags ke saath ek row. Demo stack: tags full width, Say hi neeche.

7. **Requests tab**
   - Demo: har request card — avatar, goal, preview, Decline/Accept.
   - App: rows hain. Preview + card padding demo jaisa.

8. **Communities list default tab**
   - Demo: Mine. App: Discover. Default Mine.

9. **Share-week / week bubble**
   - Demo: ink card, lime “This week”, hit days, protein, focus.
   - App card close hai; thread bubble aur sheet ko same type/spacing do.

## Low

10. **Chat meal diary switch copy**
    - Demo send-preview: “Same meal, logged for you today.”
    - App today’s pick: “Off removes it from today after sending.” Preview wale copy ko demo jaisa rakho; off behaviour same.

11. **Guest Chat empty**
    - Demo: “Add your email” + code. App: “Create account”. Auth feature alag cycle; copy tab badlo jab email-OTP gate aaye.

12. **Community levels strip**
    - Demo 11px/9px, white card. App thoda bada/tight wrap ho sakta hai. Bade text par 3 columns na tootein.

## Not a UI gap

| Item | Why |
| --- | --- |
| Food list / scan / diary log | Done. Mat chhedo. |
| Shared meal full-screen details | User-approved vs demo sheet. |
| Referral / Coach Partner / client group | Naya feature, UI polish nahi. |
| Group meal share | Naya feature. |
| Login OTP / password create | Naya auth feature. |
