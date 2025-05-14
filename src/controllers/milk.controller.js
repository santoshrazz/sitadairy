import { ApiError } from "../middleware/errorHandler.middleware.js"

export const createMilkEntry = (request, response, next) => {
    try {
        const { weight, price, sf, shift } = request.body
        if (!weight || !price || !sf || !shift) {
            return next(new ApiError("No required data to create milk entry", 400))
        }
        
    } catch (error) {
        next(new ApiError("Error getting single user details", 400))
    }
}