import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload an asset to Supabase Storage and create metadata record
 * @param {File} file - The file to upload
 * @param {string} bucket - The bucket name (e.g., 'kaiville-assets')
 * @param {string} path - The path within the bucket (e.g., 'maps/svg/full')
 * @param {Object} metadata - Additional metadata to store
 */
export async function uploadAsset(file, bucket, path, metadata = {}) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${path}/${fileName}`;

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (storageError) throw storageError;

    // Create asset record in database
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .insert({
        bucket_name: bucket,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        mime_type: file.type,
        metadata: {
          ...metadata,
          original_name: file.name,
          upload_timestamp: timestamp
        }
      })
      .select()
      .single();

    if (assetError) throw assetError;

    return { success: true, asset: assetData };
  } catch (error) {
    console.error('Error uploading asset:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get public URL for an asset
 * @param {string} bucket - The bucket name
 * @param {string} filePath - The file path within the bucket
 */
export function getAssetUrl(bucket, filePath) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Upload a map SVG with multiple sizes
 * @param {File} file - The SVG file to upload
 * @param {Object} mapData - Map metadata (name, description, bounds, etc.)
 */
export async function uploadMapSvg(file, mapData) {
  try {
    // Upload original full-size SVG
    const fullSizeResult = await uploadAsset(
      file,
      'kaiville-assets',
      'maps/svg/full',
      { size_variant: 'full', ...mapData }
    );

    if (!fullSizeResult.success) throw new Error(fullSizeResult.error);

    // Create map record
    const { data: map, error: mapError } = await supabase
      .from('maps')
      .insert({
        name: mapData.name,
        description: mapData.description,
        asset_id: fullSizeResult.asset.id,
        bounds: mapData.bounds,
        zoom_levels: mapData.zoom_levels,
        interactive_regions: mapData.interactive_regions || []
      })
      .select()
      .single();

    if (mapError) throw mapError;

    return { success: true, map, asset: fullSizeResult.asset };
  } catch (error) {
    console.error('Error uploading map SVG:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all maps with their assets
 */
export async function getMaps() {
  const { data, error } = await supabase
    .from('maps')
    .select(`
      *,
      asset:assets(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maps:', error);
    return [];
  }

  // Add public URLs to each map
  return data.map(map => ({
    ...map,
    publicUrl: map.asset ? getAssetUrl(map.asset.bucket_name, map.asset.file_path) : null
  }));
}

/**
 * Create or update a page with assets
 * @param {Object} pageData - Page data (title, slug, content, etc.)
 * @param {Array} assetIds - Array of asset IDs to associate with the page
 */
export async function upsertPageWithAssets(pageData, assetIds = []) {
  try {
    // Upsert page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .upsert({
        ...pageData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pageError) throw pageError;

    // Update page assets if provided
    if (assetIds.length > 0) {
      // Remove existing associations
      await supabase
        .from('page_assets')
        .delete()
        .eq('page_id', page.id);

      // Create new associations
      const pageAssets = assetIds.map((assetId, index) => ({
        page_id: page.id,
        asset_id: assetId,
        order_index: index
      }));

      const { error: assetsError } = await supabase
        .from('page_assets')
        .insert(pageAssets);

      if (assetsError) throw assetsError;
    }

    return { success: true, page };
  } catch (error) {
    console.error('Error upserting page:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a page with all its assets
 * @param {string} slug - The page slug
 */
export async function getPageWithAssets(slug) {
  const { data, error } = await supabase
    .from('pages')
    .select(`
      *,
      page_assets(
        usage_type,
        order_index,
        asset:assets(*)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching page:', error);
    return null;
  }

  // Add public URLs to assets
  if (data.page_assets) {
    data.page_assets = data.page_assets.map(pa => ({
      ...pa,
      asset: {
        ...pa.asset,
        publicUrl: getAssetUrl(pa.asset.bucket_name, pa.asset.file_path)
      }
    }));
  }

  return data;
}

/**
 * Delete an asset (removes from storage and database)
 * @param {string} assetId - The asset ID
 */
export async function deleteAsset(assetId) {
  try {
    // Get asset details first
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(asset.bucket_name)
      .remove([asset.file_path]);

    if (storageError) throw storageError;

    // Delete from database (cascades to related tables)
    const { error: dbError } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting asset:', error);
    return { success: false, error: error.message };
  }
}