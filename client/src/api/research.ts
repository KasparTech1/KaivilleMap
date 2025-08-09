interface GenerateResearchRequest {
  model: 'claude' | 'gpt4' | 'grok';
  prompt: string;
  templateId?: string;
  promptSegments?: any;
  savePrompt?: boolean;
}

interface GenerateResearchResponse {
  content: string;
  model: string;
}

export async function generateResearch(
  request: GenerateResearchRequest
): Promise<GenerateResearchResponse> {
  const response = await fetch('/api/research/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}