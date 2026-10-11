import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  Power,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

export default function ManageLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modal states
  const [deleteModalLink, setDeleteModalLink] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalLink, setEditModalLink] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [analyticsModalLink, setAnalyticsModalLink] = useState(null);

  const { addToast } = useToast();

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await api.getLinks({
        search,
        status: statusFilter,
        page,
        limit: 15
      });
      if (res.success) {
        setLinks(res.links);
        setPagination(res.pagination);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch links', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, [search, statusFilter, page]);

  function copyShortLink(code) {
    const fullUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    addToast('Short link copied to clipboard!', 'success');
  }

  async function handleToggleStatus(link) {
    const newStatus = link.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await api.updateLink({
        code: link.code,
        status: newStatus
      });
      if (res.success) {
        addToast(`Link "${link.code}" is now ${newStatus}.`, 'success');
        loadLinks();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteModalLink) return;
    setDeleteLoading(true);
    try {
      const res = await api.deleteLink(deleteModalLink.code);
      if (res.success) {
        addToast(res.message, 'success');
        setDeleteModalLink(null);
        loadLinks();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete link', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  function openEditModal(link) {
    setEditModalLink(link);
    setEditForm({
      code: link.code,
      title: link.title || '',
      destinationUrl: link.destinationUrl,
      status: link.status,
      flowType: link.flowType || 'two-step',
      countdownStep1: link.countdownStep1 || 10,
      countdownStep2: link.countdownStep2 || 8,
      expiresAt: link.expiresAt ? link.expiresAt.slice(0, 16) : ''
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await api.updateLink({
        ...editForm,
        countdownStep1: parseInt(editForm.countdownStep1, 10),
        countdownStep2: parseInt(editForm.countdownStep2, 10),
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).toISOString() : null
      });
      if (res.success) {
        addToast('Link settings updated successfully', 'success');
        setEditModalLink(null);
        loadLinks();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update link', 'error');
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Manage Short Links</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Monitor click volume, edit destination URLs, toggle status, and preview links.
          </p>
        </div>
        <button onClick={loadLinks} className="btn btn-secondary btn-sm" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, short code, or destination..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-dim)" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title / Short Link</th>
                <th>Destination URL</th>
                <th>Created</th>
                <th>Total Clicks</th>
                <th>Today</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && links.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading links...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No short links found matching your criteria.
                  </td>
                </tr>
              ) : (
                links.map((link) => {
                  const isExpired = link.isExpired || (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now());
                  return (
                    <tr key={link.code}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{link.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.2rem' }}>
                          <code style={{ color: '#F87171', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                            /{link.code}
                          </code>
                          <span className="badge badge-step" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
                            {link.flowType}
                          </span>
                        </div>
                      </td>
                      <td>
                        <a
                          href={link.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8125rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            maxWidth: '240px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={link.destinationUrl}
                        >
                          <span>{link.destinationUrl}</span>
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {link.totalVisits || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          {link.todayVisits || 0}
                        </span>
                      </td>
                      <td>
                        {isExpired ? (
                          <span className="badge badge-expired">Expired</span>
                        ) : link.status === 'active' ? (
                          <span className="badge badge-active">Active</span>
                        ) : (
                          <span className="badge badge-disabled">Disabled</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                          <button
                            onClick={() => copyShortLink(link.code)}
                            className="btn btn-secondary btn-sm"
                            title="Copy Short URL"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Copy size={13} />
                          </button>
                          <a
                            href={`/${link.code}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="Preview Interstitial Page"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            onClick={() => openEditModal(link)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Link Settings"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(link)}
                            className="btn btn-secondary btn-sm"
                            title={link.status === 'active' ? 'Disable Link' : 'Enable Link'}
                            style={{
                              padding: '0.3rem 0.5rem',
                              color: link.status === 'active' ? 'var(--warning)' : 'var(--success)'
                            }}
                          >
                            <Power size={13} />
                          </button>
                          <button
                            onClick={() => setAnalyticsModalLink(link)}
                            className="btn btn-secondary btn-sm"
                            title="View Link Click Funnel"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <BarChart2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteModalLink(link)}
                            className="btn btn-danger btn-sm"
                            title="Delete Link"
                            style={{ padding: '0.3rem 0.5rem' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border)'
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Showing {links.length} of {pagination.total} links
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteModalLink)}
        onClose={() => setDeleteModalLink(null)}
        title="Confirm Link Deletion"
        footer={
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setDeleteModalLink(null)}
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Are you sure you want to delete short link <strong>/{deleteModalLink?.code}</strong>?
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
              Visitors who navigate to this link will receive a 404 Not Found error. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit Link Modal */}
      <Modal
        isOpen={Boolean(editModalLink)}
        onClose={() => setEditModalLink(null)}
        title={`Edit Link: /${editModalLink?.code}`}
        footer={
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setEditModalLink(null)}
              disabled={editLoading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleEditSubmit}
              disabled={editLoading}
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Link Title</label>
            <input
              type="text"
              className="form-input"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination URL</label>
            <input
              type="url"
              className="form-input"
              value={editForm.destinationUrl || ''}
              onChange={(e) => setEditForm({ ...editForm, destinationUrl: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={editForm.status || 'active'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Flow Type</label>
              <select
                className="form-select"
                value={editForm.flowType || 'two-step'}
                onChange={(e) => setEditForm({ ...editForm, flowType: e.target.value })}
              >
                <option value="one-step">One-step Flow</option>
                <option value="two-step">Two-step Flow</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Step 1 Countdown (s)</label>
              <input
                type="number"
                min="3"
                max="60"
                className="form-input"
                value={editForm.countdownStep1 || 10}
                onChange={(e) => setEditForm({ ...editForm, countdownStep1: e.target.value })}
              />
            </div>

            {editForm.flowType === 'two-step' && (
              <div className="form-group">
                <label className="form-label">Step 2 Countdown (s)</label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  className="form-input"
                  value={editForm.countdownStep2 || 8}
                  onChange={(e) => setEditForm({ ...editForm, countdownStep2: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Expiration Date (Optional)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={editForm.expiresAt || ''}
              onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Link Analytics Quick View Modal */}
      <Modal
        isOpen={Boolean(analyticsModalLink)}
        onClose={() => setAnalyticsModalLink(null)}
        title={`Click Analytics: /${analyticsModalLink?.code}`}
        footer={
          <button className="btn btn-secondary btn-sm" onClick={() => setAnalyticsModalLink(null)}>
            Close
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-card-sub)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              {analyticsModalLink?.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', wordBreak: 'break-all' }}>
              Target: {analyticsModalLink?.destinationUrl}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: 'var(--bg-input)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Visits</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {analyticsModalLink?.totalVisits || 0}
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Step 2 Visits</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F87171' }}>
                {analyticsModalLink?.step2Visits || 0}
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Redirects</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                {analyticsModalLink?.redirects || 0}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
