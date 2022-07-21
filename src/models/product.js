import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: [true, "Please enter product Brand"],
        trim: true,
        maxLength: [20, "Product name cannot exceed 100 characters"]
    },
    name: {
        type: String,
        required: [true, "Please ender product Name"],
        trim: true,
        maxLength: [100, "Product name cannot exceed 100 characters"]
    },
    price: {
        type: Number,
        required: [true, "Please ender product Price"],
        maxLength: [5, "Product price cannot exceed 5 characters"],
        default: 0.0
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: {
        type: [],
        required: [true, "Please Provide Images of the product"]
    },
    release: {
        type: String,
        required: [true, 'Release Date is missing']
    },
    dimension: {
        type: String
    },
    os: {
        type: String
    },
    storage: {
        type: String
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                "Smartphone",
                "Electronics",
                "Cameras",
                "Laptop",
                "Accessories",
                "Headphones",
                "Food",
                "Books",
                "Cloths/Shoes",
                "Beauty/Health",
                "Sports",
                "Outdoor",
                "Home"
            ],
            massage: "Please select correct category for the product"
        }
    },
    seller: {
        type: String,
        required: [true, "Please enter product Seller"]
    },
    stock: {
        type: Number,
        required: [true, "Please Ender product Stock"],
        maxLength: [5, "Product Stock cannot exceed 5 characters"]
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            name: {
                type: String,
            },
            rating: {
                type: Number,
            },
            comment: {
                type: String,
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    spec: {
        type: [
            {
                title: String,
                specs: [
                    {}
                ]
            }
        ]
    }
})

export default mongoose.model("Product", productSchema);