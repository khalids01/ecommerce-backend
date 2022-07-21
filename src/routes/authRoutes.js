import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getMe,
    updatePassword,
    updateProfile,
    allUsers,
    getUser,
    updateUserByAdmin,
    deleteUser,
} from '../controllers/authController.js';

import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js'

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logoutUser);

router.route('/me').get(isAuthenticatedUser, getMe);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);

router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getUser)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUserByAdmin)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);
;

export default router;