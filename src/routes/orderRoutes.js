import express from 'express'
import {
    newOrder,
    getAllOrders,
    getOrder,
    myOrders,
    processOrder,
    deleteOrder
} from '../controllers/orderController.js'

import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js'

const router = express.Router()

router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders)

router.route('/admin/order/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), processOrder)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder)


router.route('/order/:id').get(isAuthenticatedUser, getOrder)

router.route('/orders/me').get(isAuthenticatedUser, myOrders)

router.route('/order/new').post(isAuthenticatedUser, newOrder)


export default router