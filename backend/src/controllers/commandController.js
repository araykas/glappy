import {
  generateInstallationCommands,
  generateProjectStructure,
  generatePathSetup,
  generateExampleCode,
  generateCMakeFile
} from '../services/commandService.js';
import { getLibraryById } from '../data/librariesData.js';
import { AppError } from '../middleware/errorHandler.js';

export const generateCommands = (req, res, next) => {
  try {
    const { libraryId, deviceSpecs } = req.body;

    // Validate library exists
    const library = getLibraryById(libraryId);
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
