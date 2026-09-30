import { getCuisineTree } from '../services/cuisineService.js';

export async function tree(req, res, next) {
  try {
    res.json({ success: true, data: await getCuisineTree() });
  } catch (error) {
    next(error);
  }
}