import { getAllLibraries, getLibraryById } from '../data/librariesData.js';
import { AppError } from '../middleware/errorHandler.js';

export const getLibraries = (req, res, next) => {
  try {
    const libraries = getAllLibraries();
    
    res.json({
      success: true,
      count: libraries.length,
      data: libraries
    });
  } catch (error) {
    next(error);
  }
};

export const getLibraryDetails = (req, res, next) => {
  try {
    const { id } = req.params;
    const library = getLibraryById(id);

    if (!library) {
      throw new AppError(`Library with id '${id}' not found`, 404);
    }

    res.json({
      success: true,
      data: library
    });
  } catch (error) {
    next(error);
  }
};
