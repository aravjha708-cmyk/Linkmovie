import { authenticateRequest } from './lib/auth.mjs';
import { linksStore } from './lib/storage.mjs';
import {
  jsonResponse,
  errorResponse,
  getNormalizedHeaders
} from './lib/handler-helper.mjs';

export default async function handler(req) {
  const headers = getNormalizedHeaders(req);
  const auth = await authenticateRequest({ headers });
  if (!auth.authenticated) {
    return errorResponse(auth.error, 401);
  }

  // Parse query params if URL available
  const url = req.url ? new URL(req.url, 'http://localhost') : new URL('http://localhost');
  const search = url.searchParams.get('search')?.toLowerCase() || '';
  const statusFilter = url.searchParams.get('status') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  // List all link keys from store
  const blobList = await linksStore.list({ prefix: 'link:' });
  const links = [];

  for (const item of blobList) {
    const key = item.key;
    const link = await linksStore.get(key);
    if (link) {
      // Check expiration dynamically
      if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
        link.isExpired = true;
      } else {
        link.isExpired = false;
      }
      links.push(link);
    }
  }

  // Filter
  let filtered = links.filter((link) => {
    if (statusFilter === 'active' && (link.status !== 'active' || link.isExpired)) return false;
    if (statusFilter === 'disabled' && link.status !== 'disabled') return false;
    if (statusFilter === 'expired' && !link.isExpired) return false;

    if (search) {
      const matchCode = link.code?.toLowerCase().includes(search);
      const matchTitle = link.title?.toLowerCase().includes(search);
      const matchDest = link.destinationUrl?.toLowerCase().includes(search);
      return matchCode || matchTitle || matchDest;
    }
    return true;
  });

  // Sort descending by creation date
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return jsonResponse({
    success: true,
    links: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
}
