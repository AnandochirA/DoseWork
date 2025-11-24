## 10-Day Solo Developer Plan

| Day    | Goal                        | Tasks                                                                                                    | Output                              |
|--------|-----------------------------|----------------------------------------------------------------------------------------------------------|-------------------------------------|
| **Day 1** | **Setup & Avatar**             | - Sign up: Ready Player Me<br>- Create DOSE avatar (female, calm, professional)<br>- Export `.glb` file<br>- Set up React + Three.js project | `dose-avatar.glb`, Vite project     |
| **Day 2** | **3D Avatar in Browser**       | - Load `.glb` with `@react-three/fiber`<br>- Add idle animation (breathing)<br>- Add speaking animation (lip-sync via blendshapes)<br>- Add hover/click to speak | Live 3D avatar on page              |
| **Day 3** | **Backend + OpenAI**           | - `npm init` + Express<br>- Create `/chat` endpoint<br>- Prompt: "You are DOSE, an empathetic ADHD coach..."<br>- Test with Postman | API returns AI response             |
| **Day 4** | **Voice: Text-to-Speech**      | - Sign up ElevenLabs<br>- Clone calm female voice<br>- Add `/tts` endpoint → returns audio URL<br>- Play audio when AI speaks | Avatar speaks with voice            |
| **Day 5** | **Voice Input (Mic)**          | - Add mic button<br>- Use Web Speech API or Whisper<br>- Send audio → backend → Whisper → text<br>- Chain to AI | User speaks → avatar listens        |
| **Day 6** | **Lip-Sync Animation**         | - Detect when audio is playing<br>- Trigger `mouthOpen` blendshape<br>- Smooth start/stop | Avatar lips move with speech        |
| **Day 7** | **Chat UI + Memory**           | - Floating chat bubble (bottom-right)<br>- Show user + AI messages<br>- Save to PostgreSQL (`user_id`, message, timestamp)<br>- Load last 5 messages | Persistent chat                     |
| **Day 8** | **Fine-Tune AI**               | - Collect 50 real ADHD Q&A pairs<br>- Upload to OpenAI<br>- Fine-tune `gpt-4o-mini`<br>- Switch API to use fine-tuned model | 95% accurate responses              |
| **Day 9** | **Embed on DOSE Site**         | - Build avatar as widget<br>- Add `<script src="dose-avatar.js"></script>`<br>- Trigger on button click or auto after 10s<br>- Mobile responsive | Works on `dose41.netlify.app`       |
| **Day 10**| **Test & Launch**              | - Test 20 real users<br>- Fix bugs<br>- Add fallback: "Transfer to human coach"<br>- Deploy to Vercel + Render | LIVE AI AVATAR                      |

