import {
  getLibraryUsageStats,
  getOSDistribution,
  getGenerationHistoryBySession,
  getAIChatHistoryBySession,
  testDatabaseConnection
} from '../services/databaseService.js';
import { isSupabaseConfigured } from '../config/supabase.js';

/**
 * Get library usage statistics
 */
export const getUsageStats = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({
        success: false,
        message: 'Database not configured'
      });
    }

    const result = await getLibraryUsageStats();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get OS distribution statistics
 */
export const getOSStats = async (req, res, next) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({
        success: false,
        message: 'Database not configured'
      });
    }

    const result = await getOSDistribution();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user session history
 */
export const getSessionHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!isSupabaseConfigured()) {
      return res.json({
        success: false,
        message: 'Database not configured'
      });
    }

    const [generationResult, chatResult] = await Promise.all([
      getGenerationHistoryBySession(sessionId),
      getAIChatHistoryBySession(sessionId)
    ]);

    res.json({
      success: true,
      data: {
        generations: generationResult.success ? generationResult.data : [],
        chats: chatResult.success ? chatResult.data : []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test database connection
 */
export const testConnection = async (req, res, next) => {
  try {
    const result = await testDatabaseConnection();

    res.json({
      success: result.success,
      message: result.message,
      configured: isSupabaseConfigured()
    });
  } catch (error) {
    next(error);
  }
};
