const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are a friendly menu assistant for Bella Cucina, an Italian restaurant. Help guests understand ingredients, flag allergens, and answer dietary questions (gluten-free, dairy-free, nut-free, vegetarian). Be warm and concise. Only use the menu data provided below. If a guest has a severe allergy, always recommend they also speak with their server. Never guess.

MENU DATA:

DISH 1: Chicken Piccata
Ingredients: chicken breast, all-purpose flour, butter, olive oil, garlic, capers, lemon juice, white wine, chicken broth, fresh parsley, salt, black pepper.
Cooking: Stainless steel sauté pan. Chicken dredged in flour and pan-fried in butter and olive oil.
Allergens: GLUTEN (flour), DAIRY (butter).
Contains alcohol (white wine).
Not gluten-free. Not dairy-free.
Nut-free. No fish/shellfish.

DISH 2: Rigatoni alla Norma
Ingredients: rigatoni pasta, eggplant, crushed San Marzano tomatoes, garlic, fresh basil, olive oil, ricotta salata cheese, salt, red pepper flakes.
Cooking: Eggplant fried in olive oil, tomato sauce built separately, pasta boiled in salted water.
Allergens: GLUTEN (pasta), DAIRY (ricotta salata).
Vegetarian. Not gluten-free. Not dairy-free.
Nut-free. No fish/shellfish. No alcohol.

DISH 3: Osso Buco
Ingredients: veal shanks, onion, carrots, celery, garlic, crushed tomatoes, dry white wine, beef or veal broth, butter, olive oil, flour, lemon zest, fresh parsley, anchovy paste, salt, black pepper.
Cooking: Braised in a Dutch oven at 325°F for 2–2.5 hours, seared first on stovetop.
Allergens: GLUTEN (flour), DAIRY (butter), FISH (anchovy paste).
Contains alcohol (white wine). Not vegetarian.
Not gluten-free. Not dairy-free.
Nut-free.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let messages;
  try {
    ({ messages } = JSON.parse(event.body));
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages');
    }
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Bad request: messages array required' }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server misconfiguration: missing API key' }),
    };
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0]?.text ?? 'Sorry, I could not generate a response.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error('Anthropic API error:', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to reach AI service. Please try again.' }),
    };
  }
};
