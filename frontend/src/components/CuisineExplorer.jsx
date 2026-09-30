import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchCuisineTree } from '../services/api.js';

function flattenCuisineTree(nodes, level = 0, result = []) {
  for (const node of nodes) {
    result.push({ ...node, treeLevel: level });
    flattenCuisineTree(node.children || [], level + 1, result);
  }
  return result;
}

function collectCuisineNodes(nodes, result = []) {
  for (const node of nodes) {
    if (node.level === 'country' || node.level === 'region' || node.level === 'subregion') {
      result.push(node);
    }
    collectCuisineNodes(node.children || [], result);
  }
  return result;
}

function findCuisineNode(nodes, slug) {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    const found = findCuisineNode(node.children || [], slug);
    if (found) return found;
  }
  return null;
}

export default function CuisineExplorer({ preview = false }) {
  const query = useQuery({ queryKey: ['cuisine-tree'], queryFn: fetchCuisineTree, enabled: true });
  const [search, setSearch] = useState('');
  const indiaNode = findCuisineNode(query.data || [], 'india');
  const countryNodes = useMemo(() => {
    const source = search.trim()
      ? collectCuisineNodes(indiaNode?.children || [])
      : (indiaNode?.children || []);
    const normalized = search.trim().toLowerCase();
    if (!normalized) return source;
    return source.filter((node) => node.name.toLowerCase().includes(normalized));
  }, [indiaNode, search]);

  if (query.isPending) return <div className="status-panel" role="status">Loading cuisines…</div>;
  if (query.isError) return <div className="status-panel error-panel" role="alert"><strong>Cuisines are unavailable.</strong><span>Check the MongoDB connection and try again.</span><button className="text-button" type="button" onClick={() => query.refetch()}>Try again</button></div>;

  if (preview) {
    const featured = (indiaNode?.children || []).filter((node) => node.recipeCount > 0)
      .sort((left, right) => right.recipeCount - left.recipeCount || left.name.localeCompare(right.name))
      .slice(0, 4);
    return <div className="cuisine-list">
      {featured.map((cuisine, index) => <Link key={cuisine.slug} className="cuisine-link" to={`/recipes?cuisine=${encodeURIComponent(cuisine.slug)}`}><span>0{index + 1}</span><strong>{cuisine.name}</strong><span className="cuisine-count">{cuisine.recipeCount}</span><span aria-hidden="true">↗</span></Link>)}
      <Link className="underlined-link" to="/cuisines">Explore all cuisines <span aria-hidden="true">→</span></Link>
    </div>;
  }

  return <div className="cuisine-explorer">
    <div className="indian-cuisine-heading"><p className="eyebrow">INDIA</p><h2>{indiaNode?.recipeCount || 0} Indian recipes</h2></div>
    <label className="cuisine-search-box">
      <span className="sr-only">Search Indian cuisines</span>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5" /><path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search an Indian state or cuisine" />
    </label>
    <div className="cuisine-country-grid">
      {countryNodes.length ? countryNodes.map((node) => (
        <Link key={node.slug} className="cuisine-country-card" to={`/recipes?cuisine=${encodeURIComponent(node.slug)}`}>
          <span className="cuisine-country-name">{node.name}</span>
          <span className="cuisine-country-count">{node.recipeCount || 0} recipes</span>
        </Link>
      )) : <div className="status-panel empty-panel"><strong>No cuisine results</strong><span>Try a different region or search term.</span></div>}
    </div>
  </div>;
}