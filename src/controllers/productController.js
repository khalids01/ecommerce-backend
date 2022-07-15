import Product from '../models/product.js'
import APIFeatures from '../utils/apiFeatures.js'
import ErrorHandler from '../utils/errorHandler.js'
import catchAsyncError from '../middlewares/catchAsyncError.js'

export const newProduct = catchAsyncError(async (req, res, next) => {
    req.body.user = req.user.id;

    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product
    })
})


export const getProducts = catchAsyncError(async (req, res, next) => {
    const resultsPerPage = 20;
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultsPerPage);

    console.log(req.query);


    const products = await apiFeatures.query;

    res.status(200).json({
        success: true,
        productsGot: products.length,
        pageCount: Math.ceil(productCount / resultsPerPage),
        productCount,
        products
    });
})

export const getAllBrandNames = catchAsyncError(async (req, res, next) => {
    const brands = await Product.find().distinct('brand')

    res.status(200).json({
        success: true,
        brands
    })
})

export const getSingleProduct = async (req, res, next) => {

    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler('Product Not Found. Please Provide a valid id', 404))
    }

    res.status(200).json({
        success: true,
        product
    });

}

export const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id)
        if (product) {
            product = await Product.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            })

            res.status(200).json({
                success: true,
                massage: 'Product updated',
                product
            })
        }


    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Product not found'
        })
    }

}

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if (product) {
            await product.remove()

            res.status(200).json({
                success: true,
                massage: 'Product is Deleted',
                product
            })
        }


    } catch (err) {
        res.status(500).json({
            success: false,
            massage: err.message,
            error: err.name
        })
    }
}

// Create new Review => /api/v1/product/:id/review
export const createProductReview = catchAsyncError(async (req, res, next) => {
    const { ratings, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        ratings: Number(ratings),
        comment
    }

    const product = await Product.findById(productId)


    const isReviewed = await product.reviews.find(
        r => {
            console.log(r.user);
            r.user.toString() === req.user._id.toString()
        }
    )

    if (isReviewed) {
        product.reviews.forEach(r => {
            if (r.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.ratings = ratings
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    product.ratings = product.reviews.reduce((acc, item) => item.ratings + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
    })
})

// Get Product Reviews => /api/v1/product/:id/reviews
export const getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete product Review => /api/v1/product/:id/review/:reviewId
export const deleteProductReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id)

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.ratings + acc, 0) / reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    )

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})
