import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaStar, FaRegStar, FaImage, FaCamera, FaPhotoVideo } from 'react-icons/fa';
import { collegeService } from '../../services/collegeService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';
import imgStyles from './ManageCollegesImages.module.css';

const ManageColleges = () => {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  // Track per-college upload states: { [collegeId]: { logo|cover|gallery: 'idle'|'uploading'|'done'|'error' } }
  const [uploadState, setUploadState] = useState({});
  const queryClient = useQueryClient();

  const setCollegeUploadState = (id, key, state) =>
    setUploadState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: state } }));

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-colleges', page, search],
    queryFn: () => collegeService.getColleges({ page, limit: 20, ...(search && { search }) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => collegeService.deleteCollege(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-colleges'] }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }) => collegeService.updateCollege(id, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-colleges'] });
      queryClient.invalidateQueries({ queryKey: ['featuredColleges'] });
    },
  });

  const onlineMutation = useMutation({
    mutationFn: ({ id, isOnline }) => collegeService.updateCollege(id, { isOnline }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-colleges'] });
      queryClient.invalidateQueries({ queryKey: ['onlineColleges'] });
    },
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogoUpload = async (id, file) => {
    if (!file) return;
    setCollegeUploadState(id, 'logo', 'uploading');
    try {
      await collegeService.uploadLogo(id, file);
      setCollegeUploadState(id, 'logo', 'done');
      queryClient.invalidateQueries({ queryKey: ['admin-colleges'] });
      setTimeout(() => setCollegeUploadState(id, 'logo', 'idle'), 2500);
    } catch {
      setCollegeUploadState(id, 'logo', 'error');
      setTimeout(() => setCollegeUploadState(id, 'logo', 'idle'), 3000);
    }
  };

  const handleCoverUpload = async (id, file) => {
    if (!file) return;
    setCollegeUploadState(id, 'cover', 'uploading');
    try {
      await collegeService.uploadCoverImage(id, file);
      setCollegeUploadState(id, 'cover', 'done');
      queryClient.invalidateQueries({ queryKey: ['admin-colleges'] });
      setTimeout(() => setCollegeUploadState(id, 'cover', 'idle'), 2500);
    } catch {
      setCollegeUploadState(id, 'cover', 'error');
      setTimeout(() => setCollegeUploadState(id, 'cover', 'idle'), 3000);
    }
  };

  const handleGalleryUpload = async (id, files) => {
    if (!files || files.length === 0) return;
    setCollegeUploadState(id, 'gallery', 'uploading');
    try {
      await collegeService.uploadGalleryImages(id, Array.from(files));
      setCollegeUploadState(id, 'gallery', 'done');
      queryClient.invalidateQueries({ queryKey: ['admin-colleges'] });
      setTimeout(() => setCollegeUploadState(id, 'gallery', 'idle'), 2500);
    } catch {
      setCollegeUploadState(id, 'gallery', 'error');
      setTimeout(() => setCollegeUploadState(id, 'gallery', 'idle'), 3000);
    }
  };

  const raw        = data?.data?.data;
  const colleges   = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const totalPages = pagination.pages || pagination.totalPages || 1;
  const featuredCount = colleges.filter(c => c.featured).length;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>

      <div className={styles.header}>
        <div>
          <h1>Manage Colleges</h1>
          {featuredCount > 0 && (
            <p className={styles.headerNote}>
              <FaStar style={{ color: '#f59e0b', marginRight: 4 }} />
              {featuredCount} college{featuredCount !== 1 ? 's' : ''} featured on homepage
            </p>
          )}
        </div>
        <Link to="/admin/colleges/create" className={styles.addBtn}>+ Add College</Link>
      </div>

      <div className={styles.searchWrap}>
        <input
          type="text"
          placeholder="Search colleges by name…"
          className={styles.searchInput}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {error && <div className={styles.error}>Failed to load colleges.</div>}
      {isLoading ? <Loader /> : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>College</th>
                  <th>Images</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Verified</th>
                  <th>Homepage</th>
                  <th>Online</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {colleges.length === 0 ? (
                  <tr><td colSpan={8} className={styles.empty}>No colleges found.</td></tr>
                ) : colleges.map((c) => {
                  const us = uploadState[c._id] || {};
                  return (
                    <tr key={c._id}>

                      {/* ── College name ── */}
                      <td>
                        <div className={styles.collegeCell}>
                          {c.logoUrl
                            ? <img src={c.logoUrl} alt="" className={styles.collegeLogo} />
                            : <div className={styles.collegeLogoPlaceholder}>
                                {(c.shortName || c.name).slice(0, 2).toUpperCase()}
                              </div>
                          }
                          <div>
                            <div className={styles.collegeName}>{c.name}</div>
                            {c.shortName && c.shortName !== c.name && (
                              <div className={styles.collegeShort}>{c.shortName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ── Image uploads ── */}
                      <td>
                        <div className={imgStyles.uploadGroup}>

                          {/* Logo */}
                          <ImageUploadBtn
                            icon={<FaCamera />}
                            label={c.logoUrl ? 'Logo ✓' : 'Logo'}
                            hasImage={!!c.logoUrl}
                            state={us.logo || 'idle'}
                            accept="image/*"
                            multiple={false}
                            onChange={e => handleLogoUpload(c._id, e.target.files[0])}
                          />

                          {/* Cover */}
                          <ImageUploadBtn
                            icon={<FaImage />}
                            label={c.coverImageUrl ? 'Cover ✓' : 'Cover'}
                            hasImage={!!c.coverImageUrl}
                            state={us.cover || 'idle'}
                            accept="image/*"
                            multiple={false}
                            onChange={e => handleCoverUpload(c._id, e.target.files[0])}
                          />

                          {/* Gallery */}
                          <ImageUploadBtn
                            icon={<FaPhotoVideo />}
                            label={c.galleryImages?.length ? `Gallery (${c.galleryImages.length})` : 'Gallery'}
                            hasImage={!!(c.galleryImages?.length)}
                            state={us.gallery || 'idle'}
                            accept="image/*"
                            multiple={true}
                            onChange={e => handleGalleryUpload(c._id, e.target.files)}
                          />

                        </div>
                      </td>

                      {/* ── Type ── */}
                      <td>
                        <span className={styles.badge}>{c.fundingType || '—'}</span>
                      </td>

                      {/* ── City ── */}
                      <td>{c.contact?.city || '—'}</td>

                      {/* ── Verified ── */}
                      <td>
                        <span className={c.isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                          {c.isVerified ? '✓ Verified' : 'Unverified'}
                        </span>
                      </td>

                      {/* ── Homepage (featured) ── */}
                      <td>
                        <button
                          className={c.featured ? styles.featuredBtnActive : styles.featuredBtn}
                          onClick={() => featureMutation.mutate({ id: c._id, featured: !c.featured })}
                          disabled={featureMutation.isPending}
                          title={c.featured ? 'Remove from homepage' : 'Add to homepage'}
                        >
                          {c.featured ? <><FaStar /> Featured</> : <><FaRegStar /> Feature</>}
                        </button>
                      </td>

                      {/* ── Online ── */}
                      <td>
                        <button
                          className={c.isOnline ? styles.onlineBtnActive : styles.onlineBtn}
                          onClick={() => onlineMutation.mutate({ id: c._id, isOnline: !c.isOnline })}
                          disabled={onlineMutation.isPending}
                          title={c.isOnline ? 'Mark as offline' : 'Mark as online'}
                        >
                          {c.isOnline ? '🌐 Online' : '+ Online'}
                        </button>
                      </td>

                      {/* ── Actions ── */}
                      <td>
                        <div className={styles.actionCell}>
                          <Link to={`/colleges/${c.slug}`} className={styles.viewBtn} target="_blank" rel="noopener noreferrer">View</Link>
                          <Link to={`/admin/colleges/edit/${c._id}`} className={styles.editBtn}>Edit</Link>
                          <Link to={`/admin/colleges/${c._id}/courses`} className={styles.editBtn}>Courses</Link>
                          <button
                            className={styles.deleteBtn}
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(c._id, c.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function ImageUploadBtn({ icon, label, hasImage, state, accept, multiple, onChange }) {
  const ref = useRef();
  const isUploading = state === 'uploading';
  const isDone      = state === 'done';
  const isError     = state === 'error';

  return (
    <label
      className={`${imgStyles.uploadBtn}
        ${hasImage ? imgStyles.uploadBtnHas : ''}
        ${isUploading ? imgStyles.uploadBtnLoading : ''}
        ${isDone     ? imgStyles.uploadBtnDone : ''}
        ${isError    ? imgStyles.uploadBtnError : ''}`}
      title={isError ? 'Upload failed — try again' : label}
    >
      <span className={imgStyles.uploadBtnIcon}>
        {isUploading ? <span className={imgStyles.spinner} /> : icon}
      </span>
      <span className={imgStyles.uploadBtnText}>
        {isDone ? '✓ Saved' : isError ? '✗ Failed' : label}
      </span>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={e => { onChange(e); e.target.value = ''; }}
        disabled={isUploading}
      />
    </label>
  );
}

export default ManageColleges;
