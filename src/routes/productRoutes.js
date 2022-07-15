import express from 'express'
import {
    getProducts,
    newProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteProductReview,
    getAllBrandNames
} from '../controllers/productController.js'

import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js'

const router = express.Router()


router.route('/products').get(getProducts)

router.route('/products/brands').get(getAllBrandNames)

router.route('/product/:id').get(getSingleProduct)

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct)

router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)

router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct)

router.route('/review').put(isAuthenticatedUser, createProductReview)

router.route('/reviews').get(getProductReviews)

router.route('/reviews').delete(deleteProductReview)

export default router;

