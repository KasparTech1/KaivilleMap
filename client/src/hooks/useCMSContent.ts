import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

interface CMSContent {
  [key: string]: any;
}

export function useCMSContent(pageType: string, pageId: string, defaultContent: CMSContent = {}) {
  const [content, setContent] = useState<CMSContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, [pageType, pageId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('simple_content')
        .select('content')
        .eq('page_type', pageType)
        .eq('page_id', pageId)
        .single();

      if (fetchError) {
        // If no content found, use default
        if (fetchError.code === 'PGRST116') {
          setContent(defaultContent);
        } else {
          throw fetchError;
        }
      } else if (data) {
        setContent(data.content);
      }
    } catch (err) {
      console.error('Error fetching CMS content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
      // Use default content on error
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  return { content, loading, error, refetch: fetchContent };
}