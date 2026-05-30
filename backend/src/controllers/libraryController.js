import { getAllLibraries, getLibraryById } from '../data/librariesData.js';
import { getAllLibrariesFromDB, getLibraryByIdFromDB } from '../services/databaseService.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const getLibraries = async (req, res, next) => {
  try {
    let libraries;

    // Try to get from database first
    if (isSupabaseConfigured()) {
      const result = await getAllLibrariesFromDB();
      if (result.success && result.data.length > 0) {
        libraries = result.data;
      } else {
        // Fallback to static data if database fails OR is empty
        if (!result.success) console.warn('⚠️  Database query failed, using static data');
        else console.warn('⚠️  Database is empty, using static data');
        libraries = getAllLibraries();
      }
    } else {
      // Use static data if database not configured
      libraries = getAllLibraries();
    }
    
    res.json({
      success: true,
      count: libraries.length,
      data: libraries,
      source: isSupabaseConfigured() ? 'database' : 'static'
    });
  } catch (error) {
    next(error);
  }
};

export const getLibraryDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let library;

    // Try to get from database first
    if (isSupabaseConfigured()) {
      const result = await getLibraryByIdFromDB(id);
      if (result.success) {
        library = result.data;
      } else {
        // Fallback to static data (DB empty, not found, or error)
        console.warn('⚠️  Database query failed or empty, using static data');
        library = getLibraryById(id);
      }
    } else {
      // Use static data if database not configured
      library = getLibraryById(id);
    }

    if (!library) {
      throw new AppError(`Library with id '${id}' not found`, 404);
    }

    res.json({
      success: true,
      data: library,
      source: isSupabaseConfigured() ? 'database' : 'static'
    });
  } catch (error) {
    next(error);
  }
};
