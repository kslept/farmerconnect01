# Farmer AI Assistant (Prototype)

Files:
- index.html
- style.css
- script.js
- api/chat.js
- vercel.json

Deployment:
1. Push this repo to GitHub.
2. Add project on Vercel and import the repo.
3. In Vercel Project Settings → Environment Variables, add:
   - Name: OPENAI_API_KEY
   - Value: (your OpenAI secret key, starts with sk-...)
4. Deploy. Wait for the build to finish.

Test:
- Open: https://your-vercel-url/api/chat should return {"answer":"Only POST requests allowed."} for GET.
- Use the web UI to ask questions, upload images, or use the speak button (Chrome + HTTPS required).

Security:
- Do not commit your API key to the repo. Put it only in Vercel Environment Variables.
