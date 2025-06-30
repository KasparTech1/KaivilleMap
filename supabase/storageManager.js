import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Admin client with service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * List all buckets
 */
export async function listBuckets() {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw error;
  return data;
}

/**
 * List files in a bucket
 * @param {string} bucket - Bucket name
 * @param {string} path - Path within bucket (optional)
 * @param {Object} options - List options (limit, offset, search)
 */
export async function listFiles(bucket, path = '', options = {}) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(path, {
      limit: options.limit || 100,
      offset: options.offset || 0,
      search: options.search
    });
  
  if (error) throw error;
  return data;
}

/**
 * Move/rename a file
 * @param {string} bucket - Bucket name
 * @param {string} fromPath - Current path
 * @param {string} toPath - New path
 */
export async function moveFile(bucket, fromPath, toPath) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .move(fromPath, toPath);
  
  if (error) throw error;
  return data;
}

/**
 * Copy a file
 * @param {string} bucket - Bucket name
 * @param {string} fromPath - Source path
 * @param {string} toPath - Destination path
 */
export async function copyFile(bucket, fromPath, toPath) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .copy(fromPath, toPath);
  
  if (error) throw error;
  return data;
}

/**
 * Delete files
 * @param {string} bucket - Bucket name
 * @param {string[]} paths - Array of file paths to delete
 */
export async function deleteFiles(bucket, paths) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .remove(paths);
  
  if (error) throw error;
  return data;
}

/**
 * Create a signed URL for private files
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Seconds until expiration
 */
export async function createSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Download a file
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 */
export async function downloadFile(bucket, path) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path);
  
  if (error) throw error;
  return data;
}

/**
 * Get file metadata
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 */
export async function getFileMetadata(bucket, path) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(path.split('/').slice(0, -1).join('/'), {
      limit: 1,
      offset: 0,
      search: path.split('/').pop()
    });
  
  if (error) throw error;
  return data[0] || null;
}

/**
 * Update bucket settings
 * @param {string} bucketId - Bucket ID
 * @param {Object} options - Bucket options
 */
export async function updateBucket(bucketId, options) {
  const { data, error } = await supabaseAdmin.storage.updateBucket(bucketId, options);
  if (error) throw error;
  return data;
}

/**
 * Empty a bucket (delete all files)
 * @param {string} bucket - Bucket name
 */
export async function emptyBucket(bucket) {
  console.log(`⚠️  Emptying bucket: ${bucket}`);
  
  async function deleteRecursive(path = '') {
    const { data: files, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(path);
    
    if (error) throw error;
    
    // Delete files in current directory
    const filePaths = files
      .filter(item => !item.name.endsWith('/'))
      .map(file => path ? `${path}/${file.name}` : file.name);
    
    if (filePaths.length > 0) {
      await deleteFiles(bucket, filePaths);
      console.log(`Deleted ${filePaths.length} files from ${path || 'root'}`);
    }
    
    // Recursively delete subdirectories
    const folders = files.filter(item => item.name.endsWith('/'));
    for (const folder of folders) {
      const folderPath = path ? `${path}/${folder.name}` : folder.name;
      await deleteRecursive(folderPath.replace(/\/$/, ''));
    }
  }
  
  await deleteRecursive();
  console.log(`✅ Bucket ${bucket} emptied`);
}

/**
 * Create folder structure by path
 * @param {string} bucket - Bucket name
 * @param {string} folderPath - Folder path to create
 */
export async function createFolder(bucket, folderPath) {
  const placeholderContent = new Blob([''], { type: 'text/plain' });
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(`${folderPath}/.placeholder`, placeholderContent, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  return data;
}

/**
 * Batch operations helper
 * @param {string} bucket - Bucket name
 * @param {Array} operations - Array of operations
 */
export async function batchOperations(bucket, operations) {
  const results = [];
  
  for (const op of operations) {
    try {
      let result;
      switch (op.type) {
        case 'move':
          result = await moveFile(bucket, op.from, op.to);
          break;
        case 'copy':
          result = await copyFile(bucket, op.from, op.to);
          break;
        case 'delete':
          result = await deleteFiles(bucket, [op.path]);
          break;
        default:
          throw new Error(`Unknown operation type: ${op.type}`);
      }
      results.push({ success: true, operation: op, result });
    } catch (error) {
      results.push({ success: false, operation: op, error: error.message });
    }
  }
  
  return results;
}

// CLI utilities
if (process.argv[1] === import.meta.url) {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  async function runCommand() {
    try {
      switch (command) {
        case 'list-buckets':
          const buckets = await listBuckets();
          console.log('Buckets:', buckets);
          break;
          
        case 'list-files':
          if (!args[0]) throw new Error('Bucket name required');
          const files = await listFiles(args[0], args[1]);
          console.log(`Files in ${args[0]}/${args[1] || ''}:`, files);
          break;
          
        case 'create-folder':
          if (!args[0] || !args[1]) throw new Error('Bucket and folder path required');
          await createFolder(args[0], args[1]);
          console.log(`Created folder: ${args[1]} in ${args[0]}`);
          break;
          
        default:
          console.log('Available commands:');
          console.log('  list-buckets');
          console.log('  list-files <bucket> [path]');
          console.log('  create-folder <bucket> <path>');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  runCommand();
}