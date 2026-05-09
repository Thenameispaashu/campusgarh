import api from './api';

export const collegeService = {
  // Get all colleges with filters
  getColleges: (params) => api.get('/colleges', { params }),

  // Get featured colleges
  getFeatured: (params) => api.get('/colleges/featured', { params }),
  
  uploadLogo: (id, file) => {
    const form = new FormData();
    form.append('logo', file);
    return api.patch(`/colleges/${id}/logo`, form);
  },


  getOnline: (params) => api.get('/colleges/online', { params }),

  // Get colleges by course
  getCollegesByCourse: (courseId, params) => api.get(`/colleges/course/${courseId}`, { params }),

  // Get college by slug
  getCollegeBySlug: (slug) => api.get(`/colleges/slug/${slug}`),

  // Get college by ID
  getCollegeById: (id) => api.get(`/colleges/${id}`),

  // Programmatic SEO: colleges by course slug + location
  getCollegesByCourseAndLocation: (courseSlug, location, params) =>
    api.get(`/colleges/seo/${courseSlug}/${location}`, { params }),

  // Create college (admin)
  createCollege: (data) => api.post('/colleges', data),

  // Update college (admin)
  updateCollege: (id, data) => api.patch(`/colleges/${id}`, data),

  // Delete college (admin)
  deleteCollege: (id) => api.delete(`/colleges/${id}`),

  uploadCoverImage: (id, file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    return api.patch(`/colleges/${id}/cover-image`, formData);
  },

  uploadGalleryImages: (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('galleryImages', file));
    return api.patch(`/colleges/${id}/gallery`, formData);
  },

};