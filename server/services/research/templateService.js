const { supabase } = require('./supabaseClient');

class TemplateService {
  // Get all active templates
  async getTemplates() {
    const { data, error } = await supabase
      .from('research_templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get template with all segments and options
  async getTemplateWithSegments(templateId) {
    // Get template
    const { data: template, error: templateError } = await supabase
      .from('research_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;

    // Get segments with options
    const { data: segments, error: segmentsError } = await supabase
      .from('research_segments')
      .select(`
        *,
        research_segment_options (
          *
        )
      `)
      .eq('template_id', templateId)
      .order('display_order', { ascending: true });

    if (segmentsError) throw segmentsError;

    // Sort options within each segment
    segments.forEach(segment => {
      if (segment.research_segment_options) {
        segment.research_segment_options.sort((a, b) => a.display_order - b.display_order);
      }
    });

    return {
      ...template,
      segments
    };
  }

  // Get quick starts for a template
  async getQuickStarts(templateId) {
    const { data, error } = await supabase
      .from('research_quick_starts')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Create new template
  async createTemplate(templateData) {
    const { data, error } = await supabase
      .from('research_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update template
  async updateTemplate(templateId, updates) {
    const { data, error } = await supabase
      .from('research_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Create segment
  async createSegment(segmentData) {
    const { data, error } = await supabase
      .from('research_segments')
      .insert(segmentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Create segment option
  async createSegmentOption(optionData) {
    const { data, error } = await supabase
      .from('research_segment_options')
      .insert(optionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update segment option
  async updateSegmentOption(optionId, updates) {
    const { data, error } = await supabase
      .from('research_segment_options')
      .update(updates)
      .eq('id', optionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete segment option (soft delete)
  async deleteSegmentOption(optionId) {
    const { data, error } = await supabase
      .from('research_segment_options')
      .update({ is_active: false })
      .eq('id', optionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get default template
  async getDefaultTemplate() {
    const { data, error } = await supabase
      .from('research_templates')
      .select('*')
      .eq('is_default', true)
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new TemplateService();