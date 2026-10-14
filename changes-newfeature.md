# Demo changes and new features

Last updated: 2026-10-14

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
- Share meal, progress photo add, Discover, 10 se zyada saved meals, aur hips/chest measurements bhi Pro paywall. Waist, water, aur diary log free rehte hain.

## Main app mein hai, demo mein abhi nahi

Agli demo entry yahin likho. Main app mein yeh dubara mat lagaana.

- **Ask coach** (Pro). Home coach card aur Profile → Coach. Social Chat tab par nahi. Jawab sirf user ke meals, water, streak, plan, scan, reminders, aur EatAI ke features par. Baaki sawaalon par fixed refusal. Free / guest ko pehle reason, phir paywall. AI consent ke bina chat nahi. Files: `eatai-app/src/app/coach-chat.tsx`, `eatAi/src/services/coachChat.service.ts`.

## Demo try karna

`eatai-demo/index.html` kholo.

- OTP `123456`. Password mein letter, number, aur symbol.
- `priya@eat.ai` / `rahul@eat.ai` password `EatAI1!`. `sam@demo.app` aur `aisha@eat.ai` code se login.
- Razorpay par offer `SAVE20`.
- Version long-press: personas aur Slow network.
