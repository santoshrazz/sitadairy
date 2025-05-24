import { ApiError } from "../middleware/errorHandler.middleware.js"
import { milkModal } from "../models/milk.modal.js"
import { orderModal } from "../models/order.modal.js"

export const createMilkEntry = async (request, response, next) => {
    try {
        const { weight, price, snf, shift, rate, date, userId } = request.body
        if (!weight || !price || !snf || !shift || !rate || !userId || !date) {
            return next(new ApiError("No required data to create milk entry", 400))
        }
        const dateObj = new Date(date);

        // Check if already the same entry is created for the same date and the the same shift
        const isExistingEntry = await milkModal.find({ byUser: userId, date: dateObj, shift });
        if (isExistingEntry.length > 0) {
            return next(new ApiError("Entry is already created", 400))
        }

        const createdEntry = await milkModal.create({ weight, price, shift, date: dateObj, rate, snf, byUser: userId })
        response.status(200).json({ success: true, message: "Milk Entry Created", data: createdEntry })
    } catch (error) {
        next(new ApiError("Error creating milk entry", 400))
    }
}

export const updateMilkEntry = async (request, response, next) => {
    try {
        const { weight, price, sf, shift, rate, userId, date } = request.body;
        const id = request.params.id;
        if (!id) {
            return next(new ApiError("Entry ID is required to update milk entry", 400));
        }

        const updatedData = {};

        // Only include fields if they are provided
        if (weight !== undefined) updatedData.weight = weight;
        if (price !== undefined) updatedData.price = price;
        if (sf !== undefined) updatedData.sf = sf;
        if (shift !== undefined) updatedData.shift = shift;
        if (rate !== undefined) updatedData.rate = rate;
        if (userId !== undefined) updatedData.byUser = userId;
        if (date !== undefined) {
            const dateObj = new Date(date);
            updatedData.date = dateObj
        }

        const updatedEntry = await milkModal.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedEntry) {
            return next(new ApiError("Milk entry not found", 404));
        }

        response.status(200).json({ success: true, message: "Milk Entry Updated", data: updatedEntry });
    } catch (error) {
        next(new ApiError("Error updating milk entry", 400));
    }
};

export const deleteMilkEntry = async (request, response, next) => {
    try {
        const { id } = request.params;

        if (!id) {
            return next(new ApiError("Entry ID is required to delete milk entry", 400));
        }

        const deletedEntry = await milkModal.findByIdAndDelete(id);

        if (!deletedEntry) {
            return next(new ApiError("Milk entry not found", 404));
        }

        response.status(200).json({ success: true, message: "Milk Entry Deleted", data: deletedEntry });
    } catch (error) {
        next(new ApiError("Error deleting milk entry", 400));
    }
};

export const getMilkEntriesByUser = async (request, response, next) => {
    try {
        const { startDate, endDate, date, userId, shift } = request.query;

        const filter = {};

        // Filter by specific date
        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            filter.date = { $gte: targetDate, $lt: nextDay };
        }

        // Filter by date range
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999); // Include the full end day

            filter.date = {
                $gte: start,
                $lte: end,
            };
        }

        // Filter by user
        if (userId) {
            filter.byUser = userId;
        }

        // Filter by shift
        if (shift) {
            filter.shift = shift;
        }

        const entries = await milkModal.find(filter).populate('byUser', "name id").sort({ date: -1 });

        response.status(200).json({ success: true, data: entries });
    } catch (error) {
        next(new ApiError("Error retrieving milk entries", 400));
    }
};


export const getMilkEntryById = async (request, response, next) => {
    try {
        const id = request.params.id;

        if (!id) {
            return next(new ApiError("Entry ID is required", 400));
        }

        // Find the entry by ID first
        const entry = await milkModal.findById(id);

        if (!entry) {
            return next(new ApiError("Milk entry not found", 404));
        }

        // Return the entry if all conditions are met
        response.status(200).json({ success: true, data: entry, message: "Entry retrived successfully" });
    } catch (error) {
        next(new ApiError("Error retrieving milk entry", 400));
    }
};

export const createMilkOrder = async (request, response, next) => {
    try {
        const { date, weight, contact, } = request.body;
        const userId = request.user._id;
        // check if the entry is already created for the same date and still pending
        const dateObj = new Date(date);
        const isExistingEntry = await orderModal.find({ date: dateObj, status: "Pending", contact });
        if (isExistingEntry.length > 0) {
            next(new ApiError("Order status is pending", 400));
        }
        const createdOrder = await orderModal.create({ date: dateObj, contact, byUser: userId, weight })
        response.status(200).json({ success: true, data: createdOrder, message: "Order Placed successfully" });
    } catch (error) {
        next(new ApiError("error creating milk order", 400));
    }
}
export const getMilkOrder = async (request, response, next) => {
    try {
        const userId = request.query.userId;
        const status = request.query.status;
        let filter = {};
        if (userId) {
            filter.byUser = userId
        }
        if (status) {
            filter.status = status
        }
        const orders = await orderModal.find(filter).populate('byUser', 'name').sort({ date: -1 })
        response.status(200).json({ success: true, data: orders, message: "Entry retrived successfully" });
    } catch (error) {
        next(new ApiError("error getting milk order", 400));
    }
}