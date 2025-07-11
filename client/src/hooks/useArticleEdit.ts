import { useState, useCallback } from 'react';
import { ArticleService, ArticleUpdateData } from '../services/articleService';

interface UseArticleEditOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useArticleEdit(articleId: string, options: UseArticleEditOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateArticle = useCallback(async (data: ArticleUpdateData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate data
      const validation = ArticleService.validateArticleData(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check permissions
      const canEdit = await ArticleService.canUserEdit();
      if (!canEdit) {
        throw new Error('You do not have permission to edit this article');
      }

      // Update article
      const { data: updatedArticle, error: updateError } = await ArticleService.updateArticle(
        articleId,
        data
      );

      if (updateError) throw updateError;

      // Call success callback
      if (options.onSuccess) {
        options.onSuccess();
      }

      return updatedArticle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update article';
      setError(errorMessage);
      
      // Call error callback
      if (options.onError) {
        options.onError(err instanceof Error ? err : new Error(errorMessage));
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [articleId, options]);

  return {
    updateArticle,
    loading,
    error,
    clearError: () => setError(null)
  };
}