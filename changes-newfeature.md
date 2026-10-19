# Demo changes and new features

Last updated: 2026-10-17

Main app (`eatai-app` + `eatAi`) mein kuch dalne se pehle yeh file padho. Yahan sirf `eatai-demo` ka hisaab hai: kya naya dikhta hai, kaunsa flow badla, aur kya main app mein pehle se hai.

Demo local browser prototype hai. Sign-in, scan, aur payment simulated hain. Purana saved demo `eatai-demo-v2` key par nahi tikta — refresh naya install hai (`eatai-demo-v3`).

## Naya — Communities 2.0 + Professional Coach chat/client groups

Yeh sirf demo prototype hai. Existing community join/post/moderation ko teen clear levels mein badhaya: **Public Community → Verified Coach Community → Private Client Group**. Main app/backend demo approval ke baad hi.

- Communities list par hierarchy strip aur card type badges. Public/private communities pehle jaisi; naya seed **Ravi's Healthy Eating** verified Coach Community hai.
- Coach Community card/screen par verified host, qualification, disclosure (“verified” medical endorsement nahi), channels (All, Announcements, Meals, Questions, Weekly wins), pinned announcement, safe 7-day logging challenge aur live Q&A RSVP.
- Challenge mein public weigh-in ranking, crash diet, medicine advice nahi. Join aur daily check-in simulated; same-day duplicate check-in blocked. Event RSVP on/off aur attendee count simulated.
- Feed composer har post se pehle audience batata hai: community members dekhte hain; diary, weight aur photos automatic attach nahi. Selected channel par post save hota hai. Existing report/like/reply/admin moderation chalta hai.
- Community composer ab **Text / Photo / Food log** support karta hai. Photo demo picker normal image post hai—AI consent nahi aur diary entry nahi. Food log existing aaj ke meals mein se sirf selected meal ka frozen card (name, photo/emoji, kcal, P/C/F) post karta hai; full diary/date/history payload nahi.
- Community Food log sharing existing meal-sharing rule ke hisaab se Pro hai. Free user ko exact privacy reason ke saath paywall; purchase/trial ke baad wahi meal picker resume. Photo aur text Pro-gated nahi.
- Community join coaching consent nahi hai. **Connect with Coach** separate `My Professional Coach` permission review kholta hai. Active relation ho to wahi CTA private 1:1 coach thread kholta hai.
- Coach accept karne ke baad Chat → **Professional coaching** section: verified 1:1 Coach chat aur **Private client group**. Group banner/member info saaf kehta hai ki sirf bheje hue messages visible hain; personal coach permissions group ko nahi milte.
- Client group leave karne par 1:1 coach relation active rehta hai. My Professional Coach se rejoin ho sakta hai. Coach remove par professional threads history ke liye dikhte hain par read-only ho jaate hain.
- Verified Rahul Coach Partner dashboard se accepted customers select karke named private client group create kar sakta hai. Pending invite customer group selection mein nahi aata.
- Verified Partner nayi community create karte waqt Public ya Coach Community choose kar sakta hai. Coach Community ko default channels, safe challenge, Q&A event aur pinned first post milta hai.
- Under-18 ka existing Chat block rehta hai; Coach connect guardian screen par jata hai. Guest ko existing email+OTP account gate milta hai.
- Tests: coach community hierarchy/channels/challenge, separate consent → 1:1/group creation, group privacy + leave, aur Coach Partner group creation.

### App/backend mein baad mein

- Community, channel, challenge, event/RSVP aur client-group membership ke server-authoritative resources. Public community membership, coaching relationship, referral attribution aur client-group membership alag IDs/consents.
- Role checks: owner/admin/moderator/verified-coach/member. Coach qualification verification ko medical endorsement ki tarah expose na karo.
- Group messages mein diary fields kabhi implicit payload na hon. Meal/weekly report explicit snapshot ho, audit metadata ke saath. Permission revoke par coach data access turant band; message history retention policy legal se.
- Challenge templates moderation allowlist se: logging, water, meal prep, walking. Weight-loss leaderboard, unsafe calorie target aur pregnancy/under-18 challenge reject.
- Notifications: announcements immediate opt-in; baaki daily digest/mute. Slow-mode, report queue, pinned post aur archive audit logs.

## Naya — referral codes + Professional Coach Partner business

Yeh abhi sirf demo mein hai. Main app/backend mein tab daalo jab user demo approve kare. Existing **AI Coach** alag feature hai; human role ko har jagah **Professional Coach** bola gaya hai.

- Profile mein naya section: **Refer & rewards**, **My Professional Coach**, aur **Coach Partner**. Guest ko pehle existing email + OTP claim flow milta hai. Under-18 ko Coach Partner registration nahi; coaching connect par guardian approval message aur Home ka safe exit.
- Referral link/deep-link nahi. Sirf manually share/apply hone wala code: normal user jaise `PRIYA42`, Professional Coach jaise `COACH-RAVI`. Demo valid codes: `COACH-RAVI`, `COACH-RAHUL`, `RAMESH42`, `PRIYA42`.
- Code apply karne par join/install/free trial ka reward nahi. Code account par ek baar attach hota hai. Successful simulated **Pay now** ke baad lock hota hai. Customer ko sirf neutral affiliate disclosure dikhta hai; exact rate/amount Coach Partner ledger tak limited hai. Normal referrer ko 3 banked Pro days. Failed/free/refunded copy mein ₹0.
- Customer paywall par linked coach, “may earn a referral commission” aur “your price stays the same” dikhata hai—percentage/net jargon nahi. Purchase ke baad Refer screen sirf “Referral confirmed” dikhata hai. Trial commission create nahi karta.
- Priya seed par Ravi ka pending coach request hai. **Referral attribution aur health-data access alag hain**: code lagane se data share nahi hota. Customer Meals, Weekly report, Weight, Water, Progress photos aur Health details permissions review karta hai; photos/health default OFF. Accept, decline aur later Remove access.
- Rahul seed verified Coach Partner hai: `COACH-RAHUL`, masked customer list, Free/Pending/Paid status, Pending/Approved/Reversed commission ledger, gross → net × 15% breakdown, payout threshold copy. Verified email ya EatAI ID se customer request bhej sakta hai; request par commission ₹0 aur customer acceptance abhi pending.
- Non-coach adult qualification bhar kar demo mein instant Coach Partner approval dekh sakta hai. Real app ke PAN/KYC/bank/tax steps sirf clearly labelled requirements hain; demo sensitive details collect nahi karta.
- New screens loading/error dev states use karte hain; slow-net flag partner apply/invite ko delay karta hai. Important actions par `data-testid`: referral apply/copy, coach permissions/accept/decline/remove, partner apply/code/customer invite.
- Tests mein code attribution vs consent separation, paid purchase ke baad hi commission, aur customer invite par zero commission cover kiya.

### App mein kaise jayega

- Profile routes: referral center, professional coach consent, partner dashboard. `AI Coach` labels/routes ko mat rename karo.
- Server-authoritative code attribution purchase se pehle ek baar; coaching relationship alag resource. Customer permissions scoped aur revocable. Under-18 guardian branch ke bina relationship active na ho.
- Normal user rewards in-app entitlement wallet hon; coach partner rewards cash ledger. IAP/Razorpay dono account-level attribution code padhein — platform referral links nahi.

### Backend mein kya update lagega

- Models/resources: `ReferralCode`, `ReferralAttribution`, `ProfessionalCoachProfile`, `CoachClientRelationship`, `CommissionLedger`, `CoachPayout`.
- Payment receipt/webhook verified hone ke baad idempotent ledger event: gross, tax/store/payment deductions, net, rate, amount, status. Free trial/signup par event nahi. Refund/chargeback par reversal. Renewal commission duration agreement se control.
- Suggested contracts: apply/read referral, coach apply/dashboard/earnings, customer invite/accept/decline, permission patch/revoke, payout details. Unique payment event ID se duplicate commission roko.
- Admin later: coach approve/suspend, KYC/payout review, custom rate, fraud flag, refund adjustment. PAN/GST/TDS treatment CA/legal se finalize.

## Naya — supporting features ko aasaan banaya (chat, community, progress, weight, diary)

Sirf demo. User ki tarah browser mein chala kar mile hue problems.

- **Har confirm dialog ka bug:** backdrop buttons ke upar tha, Cancel/OK par tap nahi lagta tha. `.dialog { position: relative }` se theek.
- **Meal edit:** log hone ke baad galat amount theek karne ka koi rasta nahi tha (sirf Share/Delete). Food detail par **Edit amount or nutrition** (`meal-edit`) → wahi scan-result screen “Editing a logged meal” mode mein, − + / naam / kcal / protein / carbs / fats / meal type → **Save changes** (`edit-save`) ya Cancel (`edit-cancel`). Fresh scan review par bhi meal-total aur har individual food item ka P/C/F editable hai. Food row pehle compact P/C/F summary dikhata hai; summary tap par inputs neeche expand hote hain. Item macro badalne par us item ki calories aur meal totals 4/4/9 se recalculate hote hain; calories manually alag hon to mismatch warning aati hai par save block nahi hota. Toast “Meal updated · N kcal”. Upar ke icons par aria-label (Back, Share meal, Delete meal `meal-delete`).
- **Chat:** thread header mein ⋮ (`chat-more`, groups ko chhod kar) → sheet: Report / Block (“X won't be told”). Block ab confirm maangta hai. Blocked banner par **Unblock** (`chat-unblock`). Chat list mein request bheji ho to ✓✓ ki jagah ⏳, blocked par 🚫.
- **Community:** Leave ab confirm ke saath (`community-leave`, ghost button). Doosron ke post par 🚩 report (`post-report`) → post chhup jata hai, My reports mein jata hai. Post box feed ke upar card mein (`post-draft`, `post-send`). Join nahi kiya to “Join to post and reply”. “1 reply / N replies” grammar, post par time.
- **Weight:** number par tap karke type kar sakte ho (`weight-input`, decimal, comma bhi chalega, Enter = save). 35–220 kg ke bahar error. Toast: “Saved 63.4 kg · ▼ 0.4 kg since last · 3.4 kg to goal” (protected plan / health goal par goal wala hissa nahi). Progress par “🎯 Goal X kg · Y kg to go” (`weight-goal`).
- **Progress:** chart labels “16 Oct” style, kam ticks. Calorie chart ke neeche “- - - Your goal N kcal”. Avg protein “37/120g”. Free user ko “Freezes left 0” ki jagah “📅 N/7 Days logged”.
- **Streak calendar:** 7 columns screen se bahar ja rahe the (Sat/Sun kat jate) → `minmax(0,1fr)`. Streak number ab meals se nikalta hai (`E.syncStreak`), calendar se match karta hai.
- **Privacy:** Discovery pause chips wrap hote hain (“Until I return” kat raha tha).

### App mein kaise jayega

- Meal edit: app ke diary meal detail par edit → `PATCH` meal (dekho pehle se route hai ya nahi; nahi to naya). Kcal client par recalc, server par save.
- Chat header menu, block confirm, unblock banner, community leave confirm + post report: app ke existing block/report APIs use karo.
- Weight number input + range check + toast copy. Streak: server ka `streak` hi dikhao.

## Naya — free first meal: store ka 3-day free trial, Food list, chhota onboarding

Yeh abhi sirf demo mein hai. Main app mein tab daalo jab demo approve ho. Wajah: pehle free user ka har scan paywall tha aur "Eat it again" khali tha, to naya guest ek bhi meal log nahi kar pata tha.

**App queue (2026-10-19):** Food list, Home first-meal card, First meal logged sheet, chhota onboarding, aur Profile → Bigger text app mein hain. **Paywall baad mein** — user ne explicitly baad ke liye mark kiya. Jab tak woh na bole, yeh mat chhedo: 3-day free trial, Pay now / trial cancel copy, guest paywall (“Why this stopped”, email), paywall headline, Welcome ka trial line, aur scan gate par “Not now, use the food list”.

- **Daily free scans nahi hain.** AI Photo, Describe aur Barcode Pro hi hain. Free user ke liye **Food list** free hai. Scan par banner (`scan-lock`): “AI photo scan is part of Pro · Try it free for 3 days. The Food list stays free.” → paywall.
- Paywall par **Start 3-day free trial** (`paywall-trial`) jo App Store / Play Store deta hai, autopay ke saath. Neeche saaf likha: “Free until <date>. Then ₹X every year, auto-paid by the store. Cancel before then and you pay nothing.” **Pay now** (`paywall-buy`) alag. Trial ek baar hi (`trialUsed`). Guest pehle email deta hai (“Add your email to start your 3-day free trial”), phir paywall par wapas.
- Trial cancel: “You won't be charged” copy, Pro trial end date tak chalta hai. Cancelled sub `endsAt` tak Pro.
- Scan mein naya mode **Food list** (Photo · Food list · Describe · Barcode). ~30 Indian ghar ke khane, Hinglish search (anda, chawal, dahi, kela). Tap → scan-result (− + se amount, naam/kcal edit) → Add to diary. AI nahi, consent nahi, Pro nahi.
- AI consent par **Not now** ab dead end nahi: Food list khulti hai, laal error nahi. Paywall par scan gate ho to **Not now, use the food list**.
- Guest paywall par pehle “Why this stopped”, phir “Add your email to see Pro”.
- Home: jis din meal nahi, hero ke neeche **Log your first meal / What did you eat?** card: Snap a photo, Food list, aur chips (Dal chawal, 2 roti + sabzi, Poha, Chai + biscuit). Chip se 2 taps mein log. Khali “Eat it again” chhupa. Coach meal se pehle “139g short” nahi bolta, “Start with one meal” bolta hai.
- Streak ab sach mein chalti hai: din ka pehla meal +1, gap ke baad 1 se. Ek din mein do baar nahi. Pehla meal kabhi → **First meal logged** sheet (Day 1, kcal left, guest ko email ka halka note).
- Onboarding: single-choice steps (goal, gender agar female nahi, pace, activity, exercise, diet) tap par khud aage. Birth year type kar sakte ho (1940–2015, galat par message). Pehli baar ke onboarding se **training** aur **discovery** hata diye — chat setup (`pendingChatFields`) inhe pehle se poochta hai. Recalculate plan (edit mode) mein dono hain. Ramesh: 43 taps → ~16.
- Profile → **Bigger text** switch (Sunita). Caption 12→15px, body 15→18px, buttons bade.
- Welcome par thali + “✓ 3-day free Pro trial · No sign-up to start”. Paywall headline “Log without limits” (purana “2× faster” bina proof ka claim tha).
- Assets par `?v=3.1` taaki tester ko purani cached JS na mile.
- Tests: `cd eatai-demo/tests && npm install && npm test` (Playwright, 13 checks, har persona par har screen render).

### App mein kaise jayega

- Scan sheet mein Food list tab. Home par first-meal card + combo chips. `(tabs)/index.tsx` empty state ko upar lao.
- Consent decline par Food list par bhejo. Paywall copy mein free scan wajah.
- Onboarding auto-advance + year input. Training/discovery ko chat setup par chhodo.
- Bigger text: app mein OS font scale already chalta hai; check karo `allowFontScaling` kahin band to nahi, aur ek in-app toggle socho.

### Backend mein kya update lagega

- AI scan ke liye backend jaisa hai waisa: free ko 403 `PREMIUM_REQUIRED`. Koi daily free-scan counter nahi chahiye. Trial store (IAP intro offer / Play free trial) deta hai; backend sirf receipt/webhook se `status: trial` + `renewsAt` save kare aur trial ko Pro maane. Ek user ko ek hi trial.
- Food list: naya `GET /foods/search?q=` — `foodLookup.service.ts` ka `lookupByName` andar hai, public route nahi. Pehle static Indian list (demo wali) se shuru karo. Free, bina AI consent.
- Streak: `confirm-scan` pehle se `streak` lautata hai — client par woh dikhao, khud mat ginno.

## Naya — diary search, streak history, week card, photo read, coach, reminders

Yeh abhi sirf demo mein hai. Main app mein tab daalo jab demo approve ho. FitnessApp mein yeh screens pehle se hain.

- Diary search saare logged meals mein naam se chalata hai. Har meal par **Log today** / **Log again**, **Share**, aur **Star**. Star Eat it again mein jata hai. 10 saved meals ke baad free user par Pro.
- Streak settings: **This week**, **Daily streak log**, **Ended streaks**. Calendar 7 / 14 / 30 / 40 / 100 din: counted, logged, missed, freeze. Hit-goal streak aur monthly freeze Pro. Ended streaks Pro: length aur reason (missed day, no freeze left, reset). Home chip free rehta hai.
- Weekly report ke neeche **Share this week**. Card mein hit days, protein, streak, aur focus. Chat mein sirf woh card. Free par pehle reason, phir paywall. Under 18 par “Sharing opens at 18”.
- Progress photo par **Get AI read**. Same pose, do photos. Copy estimate hai, measurement nahi. Pro, aur AI consent. Consent ke bina read nahi.
- Coach history: last weekly hit-days bars, note kholo, delete, clear history.
- Custom reminder: edit title aur time, ya delete.

## Flow change — demo only, main app mein mat daalo

Yeh prototype ka start hai, product feature nahi.

- Har naya open ya refresh **welcome** se shuru hota hai: “Snap your plate” / **Get started — it's free** / **I already have an account**.
- Get started ek khali guest banata hai aur **onboarding** (goal step) kholta hai. Meals, water, chat, joined communities khali hain.
- Plan ke baad Home par “Snap your first meal”. Jis din log nahi hai, week strip usse missed nahi dikhati.
- Pehle onboarding step se back → “Leave setup?” → welcome.
- Log out aur Reset demo bhi welcome par laate hain.
- Dev personas (Priya, Sunita, Aman, aur baaki) version long-press se chalte hain. Refresh unhe mita deta hai.
- Query `?persona=priya` ya `?screen=paywall` testing ke liye ab bhi state replace karta hai.

## Demo ne app ke existing features pakde

Yeh cheezein main app mein pehle se hain. Demo ab unke hisaab se chalta hai. Dubara mat banao, jab tak app mein koi gap na dikhe.

| Area | Demo ab kya karta hai |
| --- | --- |
| Onboarding | Female par Pregnant / Breastfeeding / Neither. Health, pregnancy, breastfeeding, ya under-16 par target aur pace skip, support step. Breastfeeding +300 kcal, “not medical advice”. Discovery sirf 18+. |
| Kid / teen | Under 16: kid plan, chat aur discovery band. Under 18: chat “opens at 18”, Home par wapas. |
| Chat setup | Ek-ek field: name, photo, birth date, training, discovery, city, bio. |
| Profile | Public profile ellipsis se Report aur Block. |
| Communities | Mine / Discover, Near me (profile city), Join / Leave, private join request, likes, replies, admin Approve / Reject / Remove, About, archive. |
| Billing | Yearly, 6 months, monthly. Store par 3-day trial. Razorpay par offer `SAVE20` = 20% off. Guest Pro ke baad account + OTP, phir wahi paywall. Razorpay cancel ke baad Resume Pro. |
| Plan | Goals history: Restore aur Delete. Macros Auto vs Custom. |
| Settings | Water window + smart reminders. Weigh-in day + time. Photo reminder day + time. Custom reminders. Data export: email link within 24 hours, instant file nahi. |
| OTP | Code `123456`. Galat code, resend ~30s, expire ~60s, wrong email. |
| Scan | Item name aur kcal edit. Slow network (dev panel) par timeout aur retry. Profile version **2.0.7**. |

## Naya — auth (demo pehle, main app baad mein)

Yeh abhi sirf demo mein hai. Main app mein tab daalna jab demo approve ho.

- Login par do raaste: **Email me a code** (OTP `123456`, galat code, resend ~30s, expire ~60s) ya **email + password**.
- Seed passwords, sirf is page session: `priya@eat.ai` aur `rahul@eat.ai` = `EatAI1!`. Refresh inhe seed par wapas le aata hai. Naya password localStorage mein nahi tikta.
- Password nahi hai (jaise `sam@demo.app`, `aisha@eat.ai`, ya OTP se bana account): “This email uses a code.”
- Unknown email par password login: “No account for that email.”
- Register password banata hai, phir OTP se email verify.
- OTP se aaya naya email onboarding par jata hai. Onboarded guest ka data us email par merge hota hai.
- Profile → Account: **Create a password** ya **Update password** (current password, naya alag hona chahiye).
- Forgot password ab link nahi: email → OTP → naya password → login. Unknown email par bhi wahi “if an account exists” message.

## Naya — guest, main section mein email + OTP

Yeh abhi sirf demo mein hai. Main app mein tab daalna jab demo approve ho.

- Home, diary, scan, water, aur meal log guest ke liye khule rehte hain. Teen taps se meal log par email nahi maangte.
- Guest onboard ho chuka ho aur Chat, Communities, Reminders, Social profile, Subscription, Privacy, ya Pro dabaye: **Add your email** → code `123456` → wahi feature khulta hai. Password nahi maangte.
- Naya email par guest ke meals us account par merge hote hain. Pehle se bana email (jaise Priya) us account ko kholta hai.
- Home “Save your progress” aur Profile “Add your email” sirf account banate hain, kisi feature par nahi phenkte.
- Pro dabane par code ke baad wahi paywall wapas aata hai.

## Naya — scan discard, Pro paywall, AI consent

Yeh abhi sirf demo mein hai. Main app mein yeh gates pehle se hain. Demo ab unke hisaab se dikhata hai.

- Scan result par **Discard** aur upar ka **X** turant scan hata kar pichhli screen par le jaate hain. Neeche **Discard** aur **Add to diary** hamesha dikhte hain.
- Free user par photo scan, describe, aur barcode **paywall** kholte hain. Photo aur describe par Pro ke baad **Allow AI Processing** consent. Not now par scan nahi chalta.
- Pro lene ya trial ke baad wahi kaam aage badhta hai. Consent ke baad scan shuru hota hai.
- Photo scan par text shutter se pehle nahi. Photo freeze hoti hai, phir **Anything the photo can't see?** Ek line, chips (Home style, Restaurant, Less oil, Extra ghee), aur ek **Estimate**. Khaali line par bhi Estimate chalta hai. Pehli do photo par sheet khula rehta hai, uske baad **Add a detail** pill. X se retake. Result par **Used:** aur **Photo missed something?** se dubara estimate. Barcode aur Describe isi note se nahi guzarte.
- App mein baad mein: `POST /v2/scan-food` pehle se image ke saath `userInput` leta hai. `scanImage` abhi sirf file bhejti hai. Optional note ko `userInput` banao. Naya endpoint nahi. Khali note aaj jaisa scan hai.
- Share meal, progress photo add, Discover, 10 se zyada saved meals, aur hips/chest measurements bhi Pro paywall. Waist, water, aur diary log free rehte hain.
- Share meal sheet pehle meal aur ek recent chat dikhati hai. Khaali list par “No one to send this to yet”. Free par button `Send to Ananya · Pro` hai, list paywall se replace nahi hoti. Send ke baad usi chat mein meal card. Card sirf wahi meal kholta hai. Under 18 par “Sharing opens at 18”.
- Chat ke photo button par pehle choice: **Photo** ya **Meal**. Photo sirf picture hai, calories nahi, diary mein nahi, Pro nahi. Meal aaj ki photo, typed text, ya food photo se jaati hai. Normal message meal nahi banta. Naya meal diary mein bhi lagta hai. Free par meal list paywall se replace nahi hoti.

## Naya — weekly progress, weight trend, photos, report

Yeh abhi sirf demo mein hai. Neeche likha hai app aur backend mein baad mein kya karna hai. Abhi `eatai-app` aur `eatAi` mat chhedo.

Demo kya dikhata hai:

- Home ki 7 goliyan meals se banti hain. Check = log hai aur kcal, protein, carbs, fat limit ke andar. Dash = kisi ek se upar. Khali ring = din guzar gaya, meal nahi. Aaj ka number. Aane wala din dashed. Tap se us din ki diary.
- Average sirf logged days ka hai. Khali din use neeche nahi kheenchta. On target `done/7`. Current week se aage nahi ja sakte.
- Weight ka bada number trend hai (aakhri 7 weigh-ins ka average). Dots scale hain, line trend hai. 3 hafte mein 0.2 kg se kam change par: “One small change is enough. No crash cut.”
- Progress photos free user ko gallery nahi dikhati. “These stay on your phone.” Pro par Front/Side, then-vs-now sirf front ke saath front, hold karke delete. Reminder copy: har 2 hafte.
- Weekly report: Home card sirf Monday–Wednesday. Progress → Weekly report kisi bhi din. Free ko sirf “Hit X of 7 calorie days”, phir **See the week · Pro**. Pro par **Your week in macros**: hit days (calories 90–110% aur protein ≥ 90%), average protein + target, is hafte ki streak, best day, lowest day, 7 bars, aur next week focus. Pregnancy ya breastfeeding par focus “eat enough” hai, cut nahi.

### App mein kaise jayega

- Home `WeekStrip` pehle se `GET /users/weekly-progress` use karti hai. Client par future week ka arrow band karo. Progress average ko logged days tak rakho (`progress.tsx` yeh kar chuka hai).
- Weight chart par do series: raw logs + rolling 7 average. Bada number trend ho.
- `progress-photos.tsx` free par list pehle se chhupata hai. Pose chips aur then/now compare add karo. Delete long-press pehle se hai.
- Nayi screen `weekly-report.tsx`. Home par Mon–Wed card. Progress row hamesha. Free preview “Hit X of 7”. Full sheet Pro, title **Your week in macros**. Lines `coachEngine.service.ts` ke `renderWeeklySummary` jaisi: hit days, avg protein + target, longest hit streak, best day, lowest day, next week focus. Hit ka matlab calories 90–110% aur protein ≥ 90%. Chart ka “done” alag hai: koi macro limit ke upar nahi.

### Backend mein kya update lagega

- Weekly status ka endpoint pehle se hai. Naya endpoint mat banao usi hisaab ke liye. Client future week na maange.
- Weight history response mein har point par `trendKg` do, `weightTrend.service.ts` ke rolling average se, taaki iOS aur Android alag math na karein. `plateaued` pehle se hai.
- `ProgressPhoto` par `pose: "front" | "side"`. Public profile aur chat payload mein yeh photos kabhi mat bhejo. Reminder scheduler ko 7 din se 14 din karo.
- Naya `GET /users/weekly-report` — Pro. Body wahi numbers jo `buildWeeklySummaryBase` already nikalta hai: `hitDays`, `avgProtein`, `proteinTarget`, `longestStreak`, `bestDay`, `worstDay`, `nextWeekFocus`, `days[7]`. Naya model mat lagao. `daysLogged === 0` par `empty: true`. Pregnant ya breastfeeding ho to focus “Eat enough today. This plan does not ask you to cut.” Sunday push abhi band hai; is endpoint se use on mat karo. Opt-out `prefs.coach.weekly`.

## Main app mein hai, demo mein abhi nahi

Agli demo entry yahin likho. Main app mein yeh dubara mat lagaana.

- **Ask coach** (Pro). Home coach card aur Profile → Coach. Social Chat tab par nahi. Jawab sirf user ke meals, water, streak, plan, scan, reminders, aur EatAI ke features par. Baaki sawaalon par fixed refusal. Free / guest ko pehle reason, phir paywall. AI consent ke bina chat nahi. Files: `eatai-app/src/app/coach-chat.tsx`, `eatAi/src/services/coachChat.service.ts`.

## Demo try karna

`eatai-demo/index.html` kholo.

- OTP `123456`. Password mein letter, number, aur symbol.
- `priya@eat.ai` / `rahul@eat.ai` password `EatAI1!`. `sam@demo.app` aur `aisha@eat.ai` code se login.
- Razorpay par offer `SAVE20`.
- Version long-press: personas aur Slow network.
- Diary search: `poha` ya `dosa`, phir **Log today**.
- Naya guest: Get started → Home par **Dal chawal** chip → Add to diary. Scan mein teen photo scan, chautha paywall. **Food list** mein `anda` search.
- Profile → **Bigger text**.
- Streak: Profile → Streak. Hit goal aur freeze Pro. Rahul (`?persona=rahul`) pehle se Pro hai, isliye freeze aur AI read seed se khulte hain.
