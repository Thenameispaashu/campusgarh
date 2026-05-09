const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const collegeService = require('../services/collegeService');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err); else resolve(result);
    }).end(buffer);
  });

class CollegeController {
  createCollege = catchAsync(async (req, res) => {
    const college = await collegeService.createCollege(req.body);
    ResponseHandler.success(res, college, 'College created', 201);
  });

  getAllColleges = catchAsync(async (req, res) => {
    const { page, limit, ...filters } = req.query;
    const result = await collegeService.searchColleges(filters, { page, limit });
    ResponseHandler.success(res, result);
  });

  getCollegeById = catchAsync(async (req, res) => {
    const college = await collegeService.findById(req.params.id);
    ResponseHandler.success(res, college);
  });

  getCollegeBySlug = catchAsync(async (req, res) => {
    try {
      const college = await collegeService.getBySlug(req.params.slug);
      // Increment views in background (non-blocking)
      collegeService.incrementViews(college._id).catch(() => {});
      ResponseHandler.success(res, college);
    } catch (error) {
      console.error('Controller error:', error);
      throw error; // Let global error handler handle it
    }
  });
  updateCollege = catchAsync(async (req, res) => {
    const college = await collegeService.updateCollege(req.params.id, req.body);
    ResponseHandler.success(res, college, 'College updated');
  });

  uploadLogo = catchAsync(async (req, res) => {
    if (!req.file) return ResponseHandler.error(res, { message: 'No file uploaded' }, 400);
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'campusgarh/College/logos',
      transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    });
    const college = await collegeService.updateCollege(req.params.id, { logoUrl: result.secure_url });
    ResponseHandler.success(res, { logoUrl: result.secure_url, college }, 'Logo uploaded');
  });

  uploadCoverImage = catchAsync(async (req, res) => {
    if (!req.file) return ResponseHandler.error(res, { message: 'No file uploaded' }, 400);
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'campusgarh/College/covers',
      transformation: [{ width: 1200, height: 600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    });
    const college = await collegeService.updateCollege(req.params.id, { coverImageUrl: result.secure_url });
    ResponseHandler.success(res, { coverImageUrl: result.secure_url, college }, 'Cover image uploaded');
  });

  uploadGalleryImages = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) return ResponseHandler.error(res, { message: 'No files uploaded' }, 400);
    const uploaded = await Promise.all(req.files.map(file =>
      uploadToCloudinary(file.buffer, {
        folder: 'campusgarh/College/gallery',
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      }).then(r => r.secure_url)
    ));
    const college = await collegeService.updateCollege(req.params.id, { $push: { galleryImages: { $each: uploaded } } });
    ResponseHandler.success(res, { galleryImages: uploaded, college }, 'Gallery images uploaded');
  });

  deleteCollege = catchAsync(async (req, res) => {
    const result = await collegeService.deleteById(req.params.id);
    ResponseHandler.success(res, result, 'College deleted');
  });

  getFeaturedColleges = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const result = await collegeService.getFeatured({ page, limit });
    ResponseHandler.success(res, result);
  });

  getOnlineColleges = catchAsync(async (req, res) => {
    const { page, limit } = req.query;
    const result = await collegeService.getOnline({ page, limit });
    ResponseHandler.success(res, result);
  });


  getCollegesByCourse = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const { page, limit } = req.query;
    const result = await collegeService.getCollegesByCourse(courseId, { page, limit });
    ResponseHandler.success(res, result);
  });

  getCollegesByCourseAndLocation = catchAsync(async (req, res) => {
    const { courseSlug, location } = req.params;
    const { page, limit } = req.query;
    const result = await collegeService.getCollegesByCourseAndLocation(courseSlug, location, { page, limit });
    ResponseHandler.success(res, result);
  });
}

module.exports = new CollegeController();