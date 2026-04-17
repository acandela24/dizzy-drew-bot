<<<<<<< HEAD
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a friendly allergy and dietary assistant for a restaurant.
Your only job is to answer questions about ingredients, allergens, and dietary info for our three dishes.
Be concise, warm, and helpful. If someone asks about something not on the menu, politely say you can only help with our three dishes.

HERE IS OUR COMPLETE MENU WITH ALL INGREDIENTS:

--- DISH 1: SPAGHETTI CARBONARA ---
Ingredients: spaghetti pasta (wheat flour, eggs), guanciale (cured pork cheek), eggs, Pecorino Romano cheese, Parmesan cheese, black pepper, salt
Cooking method: Pan-cooked, pasta boiled in salted water, emulsified sauce
Allergens: GLUTEN (pasta), EGGS, DAIRY (cheese), PORK
NOT gluten-free | NOT vegetarian | NOT dairy-free | NOT vegan

--- DISH 2: MARGHERITA PIZZA ---
Ingredients: pizza dough (wheat flour, water, yeast, salt), San Marzano tomato sauce, fresh mozzarella (buffalo milk), fresh basil, olive oil
Cooking method: Wood-fired oven at 700-900°F, hand-stretched dough
Allergens: GLUTEN (wheat crust), DAIRY (mozzarella)
NOT gluten-free | IS vegetarian | NOT dairy-free | NOT vegan
Note: Gluten-free crust sometimes available — customer should ask staff

--- DISH 3: RISOTTO AI FUNGHI (Mushroom Risotto) ---
Ingredients: Arborio rice, mixed mushrooms (porcini, cremini), onion, shallots, garlic, white wine, vegetable or chicken broth, Parmesan cheese, butter, olive oil
Cooking method: Slow stovetop, broth added gradually, finished with butter and cheese (mantecatura)
Allergens: DAIRY (butter, Parmesan), may contain ALCOHOL (white wine, mostly cooked off), SULFITES (wine)
IS gluten-free | IS vegetarian (if vegetable broth used) | NOT dairy-free
Note: Can be made vegan with substitutions — ask staff

Always end your response with a friendly note like: "If you have a severe allergy, please also let your server know so the kitchen can take extra precautions."`;

app.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  const messages = [
    ...(history || []),
    { role: 'user', content: message }
  ];

  const response = await client.messages.create({
    model: 'claude-opus-4-6', 
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages
  });

  res.json({ reply: response.content[0].text });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Restaurant chatbot running on port ${PORT}`));
=======
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MENU_FILE = path.join(__dirname, 'menu.json');
const JWT_SECRET = process.env.JWT_SECRET || 'flanigans-secret-change-in-production';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── Helpers ──────────────────────────────────────────────────────────────────

function readMenu() {
  return JSON.parse(fs.readFileSync(MENU_FILE, 'utf8'));
}

function writeMenu(data) {
  fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2));
}

function buildSystemPrompt(menu) {
  const menuText = menu.map((dish, i) =>
    `${i + 1}. ${dish.name.toUpperCase()}\n   Ingredients: ${dish.ingredients}\n   Allergens: ${dish.allergens}\n   Dietary: ${dish.dietary}`
  ).join('\n\n');

  return `You are "Big Daddy's Helper", the friendly menu assistant at Flanigan's Seafood Bar & Grill — a beloved South Florida institution founded in 1959 by "Big Daddy" Joe Flanigan. Flanigan's is known for its laid-back nautical vibe, enormous portions, family atmosphere, and legendary food. You help guests understand what's in their food so they can order with confidence.

=== FULL MENU WITH ALLERGEN INFORMATION ===

${menuText}

=== END MENU ===

Your job:
- Answer questions about ingredients, allergens, and dietary needs (gluten-free, vegetarian, vegan, dairy-free, egg-free, fish-free, etc.)
- Be warm, casual, and fun — South Florida vibes, like a friendly local who knows every dish by heart
- Keep responses short and conversational (2–4 sentences when possible)
- ALWAYS remind guests with SEVERE or LIFE-THREATENING allergies to speak directly with their server or the kitchen before ordering — never skip this
- If asked about something not on this menu, say you can only speak to the listed dishes and suggest asking a server for the full menu
- Never make up ingredients or allergen info — only state what is listed above
- Use light South Florida/nautical flair when it feels natural ("Great catch!", "Dive right in!", "No worries, amigo!", "Reel it in!")`;
}

// ── Auth middleware ───────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.admin = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Chat ──────────────────────────────────────────────────────────────────────

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const menu = readMenu();
    const systemPrompt = buildSystemPrompt(menu);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const reply = textBlock ? textBlock.text : "Sorry, I couldn't come up with an answer. Try asking your server!";

    res.json({ reply });

  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error:', error.status, error.message);
      res.status(502).json({ error: 'AI service error. Please try again.' });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error. Please try again.' });
    }
  }
});

// ── Admin: login ──────────────────────────────────────────────────────────────

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminHash) {
    return res.status(500).json({ error: 'Admin password not configured on server.' });
  }

  if (username !== adminUser) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, adminHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// ── Admin: menu CRUD ──────────────────────────────────────────────────────────

app.get('/admin/menu', requireAuth, (req, res) => {
  res.json(readMenu());
});

app.put('/admin/menu', requireAuth, (req, res) => {
  const { menu } = req.body;
  if (!Array.isArray(menu)) {
    return res.status(400).json({ error: 'menu must be an array' });
  }
  writeMenu(menu);
  res.json({ ok: true });
});

app.post('/admin/dishes', requireAuth, (req, res) => {
  const { name, ingredients, allergens, dietary } = req.body;
  if (!name || !ingredients || !allergens || !dietary) {
    return res.status(400).json({ error: 'name, ingredients, allergens, and dietary are required' });
  }
  const menu = readMenu();
  const maxId = menu.reduce((m, d) => Math.max(m, d.id), 0);
  const dish = { id: maxId + 1, name, ingredients, allergens, dietary };
  menu.push(dish);
  writeMenu(menu);
  res.status(201).json(dish);
});

app.put('/admin/dishes/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, ingredients, allergens, dietary } = req.body;
  const menu = readMenu();
  const idx = menu.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Dish not found' });
  menu[idx] = { id, name, ingredients, allergens, dietary };
  writeMenu(menu);
  res.json(menu[idx]);
});

app.delete('/admin/dishes/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const menu = readMenu();
  const filtered = menu.filter(d => d.id !== id);
  if (filtered.length === menu.length) return res.status(404).json({ error: 'Dish not found' });
  writeMenu(filtered);
  res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flanigan's chatbot running on port ${PORT}`));
>>>>>>> 4a38777 (Add Flanigan's Seafood Bar & Grill chatbot with admin menu editor)
