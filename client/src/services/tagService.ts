import { supabase } from '../config/supabase';

export interface TagWithCount {
  tag: string;
  count: number;
}

export interface CategoryWithCount {
  category: string;
  count: number;
}

export class TagService {
  /**
   * Fetch all unique tags with their counts from published articles
   */
  static async getUniqueTags(): Promise<{ data: TagWithCount[] | null; error: any }> {
    try {
      // Get all published articles with their tags
      const { data: articles, error } = await supabase
        .from('articles')
        .select('tags, pages!inner(is_published, status)')
        .eq('pages.is_published', true)
        .eq('pages.status', 'published');

      if (error) throw error;

      // Count tags manually since Supabase doesn't support unnest in RPC easily
      const tagCounts = new Map<string, number>();
      
      articles?.forEach(article => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach(tag => {
            if (tag && tag.trim()) {
              const normalizedTag = tag.trim().toLowerCase();
              tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
            }
          });
        }
      });

      // Convert to array and sort by count
      const tagsArray: TagWithCount[] = Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      return { data: tagsArray, error: null };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return { data: null, error };
    }
  }

  /**
   * Fetch all unique categories with their counts
   */
  static async getUniqueCategories(): Promise<{ data: CategoryWithCount[] | null; error: any }> {
    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('primary_category, pages!inner(is_published, status)')
        .eq('pages.is_published', true)
        .eq('pages.status', 'published');

      if (error) throw error;

      // Count categories
      const categoryCounts = new Map<string, number>();
      
      articles?.forEach(article => {
        if (article.primary_category) {
          const category = article.primary_category;
          categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        }
      });

      // Convert to array and sort by predefined order
      const categoryOrder = ['News', 'Technology', 'Community', 'Sports', 'Business', 'Arts & Culture', 'Environment'];
      const categoriesArray: CategoryWithCount[] = categoryOrder
        .filter(cat => categoryCounts.has(cat))
        .map(category => ({ 
          category, 
          count: categoryCounts.get(category) || 0 
        }));

      return { data: categoriesArray, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }
  }

  /**
   * Get suggested tags based on selected categories
   */
  static async getSuggestedTags(categories: string[]): Promise<string[]> {
    if (categories.length === 0) return [];

    try {
      const { data: articles, error } = await supabase
        .from('articles')
        .select('tags')
        .in('primary_category', categories)
        .limit(50);

      if (error) throw error;

      // Collect all tags from these articles
      const tagSet = new Set<string>();
      articles?.forEach(article => {
        article.tags?.forEach(tag => {
          if (tag && tag.trim()) {
            tagSet.add(tag.trim().toLowerCase());
          }
        });
      });

      return Array.from(tagSet).slice(0, 10); // Return top 10 suggested tags
    } catch (error) {
      console.error('Error fetching suggested tags:', error);
      return [];
    }
  }
}