// Database Service - semua operasi Supabase ada di sini
import { supabase, handleSupabaseError } from '../config/supabase.js';

// ============================================
// LIBRARIES
// ============================================

/**
 * Ambil semua library dari database
 */
export const getAllLibrariesFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('libraries')
      .select('*')
      .order('name');

    if (error) return handleSupabaseError(error, 'getAllLibraries');

    // Map snake_case DB columns ke camelCase
    const mapped = data.map(mapLibrary);
    return { success: true, data: mapped };
  } catch (err) {
    return handleSupabaseError(err, 'getAllLibraries');
  }
};

/**
 * Ambil satu library berdasarkan ID
 */
export const getLibraryByIdFromDB = async (id) => {
  try {
    const { data, error } = await supabase
      .from('libraries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Library not found' };
      }
      return handleSupabaseError(error, 'getLibraryById');
    }

    return { success: true, data: mapLibrary(data) };
  } catch (err) {
    return handleSupabaseError(err, 'getLibraryById');
  }
};

// ============================================
// GENERATION HISTORY
// ============================================

/**
 * Simpan history generate commands
 */
export const saveGenerationHistory = async (sessionId, libraryId, deviceSpecs) => {
  try {
    const { data, error } = await supabase
      .from('generation_history')
      .insert({
        session_id: sessionId,
        library_id: libraryId,
        os: deviceSpecs.os,
        cpu: deviceSpecs.cpu || null,
        gpu: deviceSpecs.gpu || null,
        ram: deviceSpecs.ram || null,
      })
      .select()
      .single();

    if (error) return handleSupabaseError(error, 'saveGenerationHistory');

    return { success: true, data };
  } catch (err) {
    return handleSupabaseError(err, 'saveGenerationHistory');
  }
};

/**
 * Ambil history generate berdasarkan session
 */
export const getGenerationHistoryBySession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('generation_history')
      .select(`
        *,
        libraries (id, name, icon)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) return handleSupabaseError(error, 'getGenerationHistoryBySession');

    return { success: true, data };
  } catch (err) {
    return handleSupabaseError(err, 'getGenerationHistoryBySession');
  }
};

// ============================================
// AI CHAT HISTORY
// ============================================

/**
 * Simpan history chat AI
 */
export const saveAIChatHistory = async (sessionId, userMessage, aiResponse, context = {}) => {
  try {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .insert({
        session_id: sessionId,
        library_id: context?.library?.id || null,
        os: context?.deviceSpecs?.os || null,
        user_message: userMessage,
        ai_response: aiResponse.message,
        suggestions: aiResponse.suggestions || [],
      })
      .select()
      .single();

    if (error) return handleSupabaseError(error, 'saveAIChatHistory');

    return { success: true, data };
  } catch (err) {
    return handleSupabaseError(err, 'saveAIChatHistory');
  }
};

/**
 * Ambil history chat AI berdasarkan session
 */
export const getAIChatHistoryBySession = async (sessionId) => {
  try {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) return handleSupabaseError(error, 'getAIChatHistoryBySession');

    return { success: true, data };
  } catch (err) {
    return handleSupabaseError(err, 'getAIChatHistoryBySession');
  }
};

// ============================================
// ANALYTICS
// ============================================

/**
 * Ambil statistik penggunaan library
 */
export const getLibraryUsageStats = async () => {
  try {
    const { data, error } = await supabase
      .from('library_usage_stats')
      .select('*');

    if (error) return handleSupabaseError(error, 'getLibraryUsageStats');

    return { success: true, data };
  } catch (err) {
    return handleSupabaseError(err, 'getLibraryUsageStats');
  }
};

/**
 * Ambil distribusi OS dari history
 */
export const getOSDistribution = async () => {
  try {
    const { data, error } = await supabase
      .from('os_distribution')
      .select('*');

    if (error) return handleSupabaseError(error, 'getOSDistribution');

    return { success: true, data };
  } catch (err) {
    return handleSupabaseError(err, 'getOSDistribution');
  }
};

// ============================================
// HELPER: Map DB row ke format frontend
// ============================================
const mapLibrary = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  version: row.version,
  icon: row.icon,
  difficulty: row.difficulty,
  platforms: row.platforms || [],
  dependencies: row.dependencies || [],
  documentation: row.documentation,
  features: row.features || [],
  comingSoon: row.coming_soon,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
