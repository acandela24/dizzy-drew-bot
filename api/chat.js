const axios = require('axios');

exports.handler = async (event) => {
    const response = await axios.post('https://api.anthropic.com/claude', {
        prompt: event.body.prompt, // The prompt sent to the Claude API
        model: 'claude-v1', // Specify the model to be used
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`, // Replace with your API key
            'Content-Type': 'application/json',
        },
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ response: response.data }),
    };
};