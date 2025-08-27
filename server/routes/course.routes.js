import { Router } from 'express';
import {
  addLectureToCourseById,
  createCourse,
  deleteCourseById,
  getAllCourses,
  getLecturesByCourseId,
  removeLectureFromCourse,
  updateCourseById,
} from '../controllers/course.controller.js';
import {
  authorizeRoles,
  authorizeSubscribers,
  isLoggedIn,
} from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

/**
 * GET /api/v1/courses
 * POST /api/v1/courses
 */
router
  .route('/')
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizeRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
  );

/**
 * DELETE /api/v1/courses/remove-lecture?courseId=...&lectureId=...
 * Must be above /:id to avoid Express route conflict
 */
router.delete(
  '/remove-lecture',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  removeLectureFromCourse
);

/**
 * DELETE /api/v1/courses/:id
 * GET /api/v1/courses/:id
 * POST /api/v1/courses/:id
 * PUT /api/v1/courses/:id
 */
router
  .route('/:id')
  .delete(isLoggedIn, authorizeRoles('ADMIN'), deleteCourseById)
  .get(isLoggedIn, authorizeSubscribers, getLecturesByCourseId)
  .post(
    isLoggedIn,
    authorizeRoles('ADMIN'),
    upload.single('lecture'),
    addLectureToCourseById
  )
  .put(isLoggedIn, authorizeRoles('ADMIN'), updateCourseById);

export default router;
