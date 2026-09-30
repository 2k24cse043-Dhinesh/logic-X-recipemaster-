import Cuisine from '../models/Cuisine.js';
import Recipe from '../models/Recipe.js';

export async function getCuisineTree() {
  const [cuisines, recipeCounts] = await Promise.all([
    Cuisine.find({ status: 'active' }).select('name slug level parentCuisine country continent description image').sort({ level: 1, name: 1 }).lean(),
    Recipe.aggregate([
      { $match: { status: 'published', visibility: 'public' } },
      {
        $project: {
          cuisineNames: {
            $filter: {
              input: { $setUnion: [['$cuisine.primary'], ['$cuisine.regional']] },
              as: 'name',
              cond: { $and: [{ $ne: ['$$name', null] }, { $ne: ['$$name', ''] }] },
            },
          },
        },
      },
      { $unwind: '$cuisineNames' },
      { $group: { _id: '$cuisineNames', count: { $sum: 1 } } },
    ]),
  ]);
  const counts = new Map(recipeCounts.map(({ _id, count }) => [_id, count]));
  const nodes = cuisines.map((cuisine) => ({ ...cuisine, recipeCount: counts.get(cuisine.name) || 0, children: [] }));
  const byId = new Map(nodes.map((node) => [String(node._id), node]));
  const roots = [];

  for (const node of nodes) {
    const parent = node.parentCuisine ? byId.get(String(node.parentCuisine)) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortTree = (items) => {
    items.sort((left, right) => left.name.localeCompare(right.name));
    items.forEach((item) => sortTree(item.children));
  };
  sortTree(roots);
  return roots;
}

export async function getCuisineDescendantNames(slug) {
  const selected = await Cuisine.findOne({ slug, status: 'active' }).select('_id name').lean();
  if (!selected) return null;

  const all = await Cuisine.find({ status: 'active' }).select('_id name parentCuisine').lean();
  const children = new Map();
  for (const node of all) {
    if (!node.parentCuisine) continue;
    const parentId = String(node.parentCuisine);
    const entries = children.get(parentId) || [];
    entries.push(node);
    children.set(parentId, entries);
  }

  const names = [];
  const pending = [selected._id];
  const visited = new Set();
  while (pending.length) {
    const currentId = pending.pop();
    const key = String(currentId);
    if (visited.has(key)) continue;
    visited.add(key);
    const current = all.find((node) => String(node._id) === key);
    if (current) names.push(current.name);
    for (const child of children.get(key) || []) pending.push(child._id);
  }
  return names;
}