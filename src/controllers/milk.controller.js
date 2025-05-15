import { ApiError } from "../middleware/errorHandler.middleware.js"
import { milkModal } from "../models/milk.modal.js"

export const createMilkEntry = async (request, response, next) => {
    try {
        const { weight, price, sf, shift, rate, userId } = request.body
        if (!weight || !price || !sf || !shift || !rate || !userId) {
            return next(new ApiError("No required data to create milk entry", 400))
        }
        const createdEntry = await milkModal.create({ weight, price, shift, rate, sf, byUser: userId })

        response.status(200).json({ success: true, message: "Milk Entry Created", data: createdEntry })
    } catch (error) {
        next(new ApiError("Error creating milk entry", 400))
    }
}