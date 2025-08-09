const { supabase } = require('./supabaseClient');

class PromptService {
  // Save a new prompt and get ID
  async savePrompt(promptData) {
    const { data, error } = await supabase
      .from('research_prompts')
      .insert({
        user_id: promptData.userId || null,
        template_id: promptData.templateId,
        model: promptData.model,
        prompt_segments: promptData.promptSegments,
        assembled_prompt: promptData.assembledPrompt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Save response for a prompt
  async saveResponse(responseData) {
    const { data, error } = await supabase
      .from('research_responses')
      .insert({
        prompt_id: responseData.promptId,
        model: responseData.model,
        content: responseData.content,
        tokens_used: responseData.tokensUsed || null,
        response_time_ms: responseData.responseTimeMs || null,
        error_message: responseData.errorMessage || null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get prompt history for a user
  async getPromptHistory(userId, limit = 50, offset = 0) {
    let query = supabase
      .from('research_prompts')
      .select(`
        *,
        research_templates (
          name,
          icon
        ),
        research_responses (
          id,
          content,
          created_at,
          error_message
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // Get specific prompt with response
  async getPromptWithResponse(promptId) {
    const { data, error } = await supabase
      .from('research_prompts')
      .select(`
        *,
        research_templates (
          name,
          icon
        ),
        research_responses (
          *
        )
      `)
      .eq('id', promptId)
      .single();

    if (error) throw error;
    return data;
  }

  // Get statistics for prompts
  async getPromptStats(userId = null) {
    let promptQuery = supabase
      .from('research_prompts')
      .select('model, created_at', { count: 'exact' });

    if (userId) {
      promptQuery = promptQuery.eq('user_id', userId);
    }

    const { data: prompts, count, error: promptError } = await promptQuery;

    if (promptError) throw promptError;

    // Get model usage stats
    const modelStats = prompts.reduce((acc, prompt) => {
      acc[prompt.model] = (acc[prompt.model] || 0) + 1;
      return acc;
    }, {});

    // Get daily usage for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUsage = prompts
      .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
      .reduce((acc, prompt) => {
        const date = new Date(prompt.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

    return {
      totalPrompts: count,
      modelStats,
      dailyUsage,
      lastUsed: prompts[0]?.created_at || null
    };
  }

  // Search prompts by content
  async searchPrompts(searchTerm, userId = null, limit = 20) {
    let query = supabase
      .from('research_prompts')
      .select(`
        *,
        research_templates (
          name,
          icon
        ),
        research_responses (
          id,
          content,
          created_at
        )
      `)
      .or(`assembled_prompt.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  // Clone a prompt (create new with same segments)
  async clonePrompt(promptId) {
    const { data: original, error: fetchError } = await supabase
      .from('research_prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (fetchError) throw fetchError;

    const { data: cloned, error: cloneError } = await supabase
      .from('research_prompts')
      .insert({
        user_id: original.user_id,
        template_id: original.template_id,
        model: original.model,
        prompt_segments: original.prompt_segments,
        assembled_prompt: original.assembled_prompt
      })
      .select()
      .single();

    if (cloneError) throw cloneError;
    return cloned;
  }
}

module.exports = new PromptService();