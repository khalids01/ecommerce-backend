import Order from "../models/order.js";
import Product from "../models/product.js";

import Errorhandler from '../utils/errorHandler.js'
import catchAsyncError from '../middlewares/catchAsyncError.js'
import order from "../models/order.js";

// Get all orders => /api/v1/admin/order/all
export const getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        count: orders.length,
        totalAmount,
        orders
    })
})

// Create a new order => /api/v1/order/new
export const newOrder = catchAsyncError(async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })

})


// Get single order => /api/v1/order/:id
export const getOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new Errorhandler('Order not found', 404))
    }
    res.status(200).json({
        success: true,
        order
    })
})

// Get logged in user orders => /api/v1/orders/me
export const myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id });
    if (!orders) {
        return next(new Errorhandler('Order not found', 404))
    }
    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    })
})

// Update / Process order => /api/v1/admin/order/:id
export const processOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (order.orderStatus === 'Delivered') {
        return next(new Errorhandler('You have already delivered this', 400))
    }

    order.orderItems.forEach(async item => {
        await updateStoke(item.product, item.quantity)
    })

    order.orderStatus = req.body.status
    order.deliveredAt = Date.now()

    await order.save()

    res.status(200).json({
        success: true,
        processedOrders: order
    })
})
// function for processing order
async function updateStoke(id, quantity) {
    const product = await Product.findById(id)

    product.stock = product.stock - quantity

    await product.save({ validateBeforeSave: false })
}

// Delete order => /api/v1/admin/order/:id
export const deleteOrder = catchAsyncError(async (req, res, next) => {

    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new Errorhandler('No Order found to Delete', 404))
    }

    await order.remove()

    res.status(200).json({
        success: true,
        message: 'Order removed'
    })
})