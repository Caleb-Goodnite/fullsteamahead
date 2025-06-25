// Function to generate a response using OpenRouter API
export async function generateResponse(prompt, explicit = false) {
  try {
    // Get the API key from the main process
    let apiKey = '';
    if (window.electronAPI) {
      try {
        apiKey = await window.electronAPI.getApiKey();
      } catch (error) {
        console.error('Error getting API key:', error);
        throw new Error('Failed to retrieve API key. Please check your .env file.');
      }
    }
    
    if (!apiKey) {
      throw new Error('API key not found. Please make sure your .env file contains OPENROUTER_API_KEY=your_api_key');
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://openrouter.ai",
        "X-Title": "Steamy Storyteller",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
        messages: [
          {
            role: "system",
            content: `You are a creative and engaging storyteller with a ${explicit ? 'steamy and explicit' : 'romantic and suggestive'} style. 
              Create a captivating story based on the user's prompt. Make it engaging, descriptive, and immersive. 
              Focus on building tension and chemistry between characters. ${explicit ? 'Include explicit and detailed intimate scenes.' : 'Keep things sensual but tasteful.'}
              Always respond with just the story content, no additional notes or disclaimers.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 15000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.6,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Failed to generate response';
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'No response generated';
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw new Error(error.message || 'An error occurred while generating the response');
  }
}