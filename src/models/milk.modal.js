import mongoose, { Schema } from 'mongoose'
const milkSchema = new Schema({
    weight: {
        type: String,
        required: [true, "Weight is required"],
        trim: true
    },
    price: {
        type: String,
        required: [true, "price is required"],
        trim: true,
    },
    rate: {
        type: String,
        required: [true, "rate is required"],
        trim: true,
    },
    sf: {
        type: String,
        required: [true, "sf value is required"]
    },
    shift: {
        type: String,
        required: [true, "shift is required"],
        enum: ["Morning", "Evening"],
    },
    byUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true })

export const milkModal = mongoose.models.milks || mongoose.model("milk", milkSchema)
