import {
  generateInstallationCommands,
  generateProjectStructure,
  generatePathSetup,
  generateExampleCode,
  generateCMakeFile
} from '../services/commandService.js';
import { getLibraryById } from '../data/librariesData.js';
import { getLibraryByIdFromDB, saveGenerationHistory } from '../services/databaseService.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

export const generateCommands = async (req, res, next) => {
  try {
    const { libraryId, deviceSpecs, sessionId } = req.body;

    // Get library (from database or static data)
    let library;
    if (isSupabaseConfigured()) {
      const result = await getLibraryByIdFromDB(libraryId);
      if (result.success) {
        library = result.data;
      } else {
        library = getLibraryById(libraryId);
      }
    } else {
      library = getLibraryById(libraryId);
    }

    // Validate library exists
    if (!library) {
      throw new AppError(`Library '${libraryId}' not found`, 404);
    }

    // Check if library is available
    if (library.comingSoon) {
      throw new AppError(`Library '${library.name}' is coming soon`, 400);
    }

    // Validate OS is supported
    if (!library.platforms.includes(deviceSpecs.os)) {
      throw new AppError(
        `Library '${library.name}' is not supported on ${deviceSpecs.os}`,
        400
      );
    }

    // Generate all data
    const commands = generateInstallationCommands(libraryId, deviceSpecs);
    const projectStructure = generateProjectStructure(libraryId);
    const pathSetup = generatePathSetup(libraryId, deviceSpecs.os);
    const exampleCode = generateExampleCode(libraryId);
    const cmakeFile = generateCMakeFile(libraryId);

    // Save to database (if configured)
    if (isSupabaseConfigured() && sessionId) {
      const saveResult = await saveGenerationHistory(sessionId, libraryId, deviceSpecs);
      if (!saveResult.success) {
        console.warn('⚠️  Failed to save generation history:', saveResult.error);
      }
    }

    res.json({
      success: true,
      data: {
        library: {
          id: library.id,
          name: library.name,
          version: library.version
        },
        deviceSpecs: {
          os: deviceSpecs.os,
          cpu: deviceSpecs.cpu,
          gpu: deviceSpecs.gpu || 'Not specified',
          ram: deviceSpecs.ram || 'Not specified'
        },
        commands,
        projectStructure,
        pathSetup,
        exampleCode,
        cmakeFile,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};
