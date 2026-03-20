# Bella Cucina — Allergen Chatbot

A mobile-friendly restaurant allergen chatbot. Guests scan a QR code at their table and can instantly ask about ingredients, allergens, gluten-free options, and more — powered by Claude AI.

---

## Project Structure

```
.
├── allergen-chatbot.html   # Single-file frontend (mobile-first)
├── functions/
│   └── chat.js             # Netlify serverless function (Claude API call)
├── netlify.toml            # Netlify routing + build config
├── package.json            # Node dependencies for the function
├── .env.example            # Environment variable template
└── README.md
```

---

## Deploy to Netlify

### 1. Push to GitHub

If you haven't already, create a GitHub repo and push this project:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign in (or create a free account).
2. Click **"Add new site" → "Import an existing project"**.
3. Choose **GitHub** and select your repository.
4. Netlify will auto-detect the settings from `netlify.toml`. Leave them as-is.
5. Click **"Deploy site"**.

### 3. Set the API Key Environment Variable

1. In Netlify, go to **Site settings → Environment variables**.
2. Click **"Add a variable"**.
3. Set:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))
4. Click **Save**.
5. **Redeploy the site** so the function picks up the new variable:
   - Go to **Deploys → Trigger deploy → Deploy site**.

### 4. Verify It Works

- Open your Netlify site URL (e.g. `https://your-site-name.netlify.app`).
- The chat interface should load. Try asking "Is the Chicken Piccata gluten-free?" — you should get a response within a couple of seconds.

---

## Generate a QR Code for the Table

Once your site is live, generate a QR code guests can scan:

**Option A — Free online tool:**
1. Go to [qr-code-generator.com](https://www.qr-code-generator.com) or [goqr.me](https://goqr.me).
2. Paste your Netlify URL.
3. Download as PNG or SVG and print.

**Option B — Command line (macOS/Linux):**
```bash
# Install qrencode if needed: brew install qrencode
qrencode -o qr-code.png "https://your-site-name.netlify.app"
```

Print the QR code, add a small label like *"Scan for ingredient & allergen info"*, and place it on each table or on the menu.

---

## Local Development

To run the serverless function locally you need the Netlify CLI:

```bash
npm install -g netlify-cli
npm install              # install @anthropic-ai/sdk
cp .env.example .env    # add your real API key to .env
netlify dev             # starts on http://localhost:8888
```

Open `http://localhost:8888/allergen-chatbot.html` in your browser.

---

## Customizing for Another Restaurant

1. **Update the menu data** in `functions/chat.js` inside `SYSTEM_PROMPT`.
2. **Update the dish names** in the chip buttons inside `allergen-chatbot.html`.
3. **Change the restaurant name** in the `<title>`, `<header>`, and the welcome message in `allergen-chatbot.html`.
4. Redeploy — done.

---

## Security Notes

- The Anthropic API key is **never** sent to the browser. It lives only in Netlify's environment variables and is accessed exclusively by the serverless function.
- The frontend calls `/api/chat` (your own Netlify function), not the Anthropic API directly.
