import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Admin authentication class for Kaiville CMS
 */
export class KaivilleAuth {
  constructor() {
    this.sessionKey = 'kaiville_admin_session';
  }

  /**
   * Authenticate admin with password
   * @param {string} password - Admin password
   * @param {Object} metadata - Additional metadata (ip, userAgent)
   * @returns {Object} Authentication result
   */
  async authenticate(password, metadata = {}) {
    try {
      // Check password against site settings
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_password')
        .single();

      if (error) throw error;

      const storedPassword = settings.setting_value;
      
      if (password !== storedPassword) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }

      // Generate session token
      const sessionToken = crypto.randomBytes(32).toString('hex');
      
      // Create session in database
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          session_token: sessionToken,
          ip_address: metadata.ip || null,
          user_agent: metadata.userAgent || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Clean up old sessions
      await this.cleanupSessions();

      return {
        success: true,
        token: sessionToken,
        expiresAt: session.expires_at
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate an existing session token
   * @param {string} token - Session token
   * @returns {Object} Validation result
   */
  async validateSession(token) {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    try {
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return { valid: false, error: 'Invalid or expired session' };
      }

      return { 
        valid: true, 
        session,
        remainingTime: new Date(session.expires_at) - new Date()
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Logout and destroy session
   * @param {string} token - Session token
   */
  async logout(token) {
    try {
      const { error } = await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', token);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupSessions() {
    try {
      const { error } = await supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }

  /**
   * Middleware to protect routes (for Express/API)
   */
  middleware() {
    return async (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                   req.cookies?.admin_session ||
                   req.headers['x-admin-token'];

      const validation = await this.validateSession(token);
      
      if (!validation.valid) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: validation.error 
        });
      }

      req.adminSession = validation.session;
      next();
    };
  }
}

/**
 * Content management functions
 */
export class KaivilleCMS {
  constructor(supabaseClient) {
    this.supabase = supabaseClient || supabase;
  }

  /**
   * Update page content
   * @param {string} pageSlug - Page slug
   * @param {Object} updates - Content updates
   * @param {string} sessionToken - Admin session token
   */
  async updatePageContent(pageSlug, updates, sessionToken) {
    // Validate session
    const auth = new KaivilleAuth();
    const validation = await auth.validateSession(sessionToken);
    
    if (!validation.valid) {
      return { success: false, error: 'Invalid session' };
    }

    try {
      // Get page
      const { data: page, error: pageError } = await this.supabase
        .from('pages')
        .select('*')
        .eq('slug', pageSlug)
        .single();

      if (pageError) throw pageError;

      // Save current state as revision
      await this.createRevision(page.id, 'page', page, 'Page update');

      // Update page
      const { data: updatedPage, error: updateError } = await this.supabase
        .from('pages')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return { success: true, page: updatedPage };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update content blocks
   * @param {string} pageId - Page ID
   * @param {Array} blocks - Content blocks
   * @param {string} sessionToken - Admin session token
   */
  async updateContentBlocks(pageId, blocks, sessionToken) {
    const auth = new KaivilleAuth();
    const validation = await auth.validateSession(sessionToken);
    
    if (!validation.valid) {
      return { success: false, error: 'Invalid session' };
    }

    try {
      // Get current blocks for revision
      const { data: currentBlocks } = await this.supabase
        .from('content_blocks')
        .select('*')
        .eq('page_id', pageId)
        .order('order_index');

      // Create revision
      await this.createRevision(pageId, 'blocks', currentBlocks, 'Content blocks update');

      // Delete existing blocks
      await this.supabase
        .from('content_blocks')
        .delete()
        .eq('page_id', pageId);

      // Insert new blocks
      const newBlocks = blocks.map((block, index) => ({
        page_id: pageId,
        block_type: block.type,
        order_index: index,
        content: block.content,
        style_config: block.style_config || {},
        is_visible: block.is_visible !== false
      }));

      const { data: insertedBlocks, error } = await this.supabase
        .from('content_blocks')
        .insert(newBlocks)
        .select();

      if (error) throw error;

      return { success: true, blocks: insertedBlocks };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create content revision
   * @param {string} pageId - Page ID
   * @param {string} type - Revision type
   * @param {Object} data - Data to save
   * @param {string} note - Revision note
   */
  async createRevision(pageId, type, data, note = '') {
    try {
      await this.supabase
        .from('content_revisions')
        .insert({
          page_id: pageId,
          revision_type: type,
          revision_data: data,
          revision_note: note
        });
    } catch (error) {
      console.error('Revision creation error:', error);
    }
  }

  /**
   * Get page with all content
   * @param {string} pageSlug - Page slug
   */
  async getPageContent(pageSlug) {
    try {
      // Get page with article
      const { data: page, error: pageError } = await this.supabase
        .from('pages')
        .select(`
          *,
          articles(*),
          content_blocks(*),
          hero_image:assets!pages_hero_image_id_fkey(*)
        `)
        .eq('slug', pageSlug)
        .single();

      if (pageError) throw pageError;

      // Sort content blocks
      if (page.content_blocks) {
        page.content_blocks.sort((a, b) => a.order_index - b.order_index);
      }

      return { success: true, page };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instances
export const kaivilleAuth = new KaivilleAuth();
export const kaivilleCMS = new KaivilleCMS();