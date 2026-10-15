# Demo changes and new features

Last updated: 2026-10-15

Main app (`eatai-app` + `eatAi`) mein kuch dalne se pehle yeh file padho. Yahan sirf `eatai-demo` ka hisaab hai: kya naya dikhta hai, kaunsa flow badla, aur kya main app mein pehle se hai.

Demo local browser prototype hai. Sign-in, scan, aur payment simulated hain. Purana saved demo `eatai-demo-v2` key par nahi tikta — refresh naya install hai.

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
