interface GenerateResearchRequest {
  model: 'claude' | 'gpt5' | 'grok';
  prompt: string;
  templateId?: string;
  promptSegments?: any;
  savePrompt?: boolean;
}

interface GenerateResearchResponse {
  content: string;
  model: string;
  thinking?: string[];
  usage?: any;
}

interface SubmitResearchArticleRequest {
  content: string;
  metadata?: any;
}

interface SubmitResearchArticleResponse {
  article: {
    id: string;
    slug: string;
    title: string;
    year: number;
    summary: string;
  };
  upload_id: string;
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

export async function submitResearchArticle(
  request: SubmitResearchArticleRequest
): Promise<SubmitResearchArticleResponse> {
  const response = await fetch('/api/research/paste', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error?.message || error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function updateResearchArticle(id: string, updates: any): Promise<any> {
  const response = await fetch(`/api/research/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.error?.message || error.message || 'Failed to update article');
  }
  
  const data = await response.json();
  return data.article;
}