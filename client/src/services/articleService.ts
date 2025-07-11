import { supabase } from '../config/supabase';

export interface ArticleUpdateData {
  headline?: string;
  subheadline?: string;
  tags?: string[];
  primary_category?: string;
  section_title?: string;
  card_description?: string;
  author_name?: string;
  reading_time?: number;
  last_edited_at?: string;
  last_edited_by?: string;
}

export interface ArticleEditHistory {
  timestamp: string;
  edited_by: string;
  changes: {
    tags_changed: boolean;
    category_changed: boolean;
    content_changed: boolean;
  };
}

export class ArticleService {
  /**
   * Update an article with new data
   */
  static async updateArticle(articleId: string, data: ArticleUpdateData) {
    try {
      // First, get the current article to track changes
      const { data: currentArticle, error: fetchError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (fetchError) throw fetchError;

      // Prepare edit history entry
      const editEntry: ArticleEditHistory = {
        timestamp: new Date().toISOString(),
        edited_by: data.last_edited_by || 'user',
        changes: {
          tags_changed: JSON.stringify(currentArticle.tags) !== JSON.stringify(data.tags),
          category_changed: currentArticle.primary_category !== data.primary_category,
          content_changed: 
            currentArticle.headline !== data.headline ||
            currentArticle.subheadline !== data.subheadline ||
            currentArticle.card_description !== data.card_description
        }
      };

      // Update edit history
      const editHistory = currentArticle.edit_history || [];
      editHistory.unshift(editEntry);
      // Keep only last 50 entries
      if (editHistory.length > 50) {
        editHistory.splice(50);
      }

      // Update the article
      const { data: updatedArticle, error: updateError } = await supabase
        .from('articles')
        .update({
          ...data,
          edit_history: editHistory,
          last_edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Also update the article card if card_description changed
      if (data.card_description !== undefined) {
        const { error: cardError } = await supabase
          .from('article_cards')
          .update({
            card_description: data.card_description
          })
          .eq('article_id', articleId);

        if (cardError) {
          console.error('Error updating article card:', cardError);
          // Don't throw, as the main update succeeded
        }
      }

      return { data: updatedArticle, error: null };
    } catch (error) {
      console.error('Error updating article:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a single article by ID with all related data
   */
  static async getArticleById(articleId: string) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          pages (
            id,
            slug,
            title,
            published_at,
            is_published
          ),
          article_cards (
            id,
            card_title,
            card_description,
            card_image_id
          )
        `)
        .eq('id', articleId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching article:', error);
      return { data: null, error };
    }
  }

  /**
   * Get article by page slug
   */
  static async getArticleBySlug(slug: string) {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select(`
          *,
          articles (
            *,
            article_cards (
              id,
              card_title,
              card_description,
              card_image_id
            )
          )
        `)
        .eq('slug', slug)
        .eq('page_type', 'article')
        .single();

      if (pageError) throw pageError;

      return { data: pageData, error: null };
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user has permission to edit (placeholder for future auth)
   */
  static async canUserEdit(): Promise<boolean> {
    // TODO: Implement proper authentication check
    // For now, return true to allow all edits
    return true;
  }

  /**
   * Validate article data before saving
   */
  static validateArticleData(data: ArticleUpdateData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.headline !== undefined && data.headline.trim().length === 0) {
      errors.push('Headline cannot be empty');
    }

    if (data.primary_category !== undefined) {
      const validCategories = ['News', 'Community', 'Technology', 'Sports', 'Arts & Culture', 'Business', 'Environment'];
      if (!validCategories.includes(data.primary_category)) {
        errors.push('Invalid category selected');
      }
    }

    if (data.reading_time !== undefined && (data.reading_time < 1 || data.reading_time > 60)) {
      errors.push('Reading time must be between 1 and 60 minutes');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}