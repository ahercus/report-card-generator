// api/generate.js
export const config = {
    runtime: 'edge', // Use edge runtime for better performance
  };
  
  export default async function handler(req) {
    // Ensure request method is POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  
    try {
      const { prompt } = await req.json();
  
      // Validate environment variable exists
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }
  
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ "role": "user", "content": prompt }],
          temperature: 0.7,
          max_tokens: 500
        })
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }
  
      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }