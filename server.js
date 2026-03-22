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
