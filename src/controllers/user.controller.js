import { userModal } from '../models/customer.modal.js'
import { ApiError } from '../middleware/errorHandler.middleware.js'
import { milkModal } from '../models/milk.modal.js'
import { uploadToCloudinery } from '../utils/cloudinery.js'

export const handleCreateUser = async (request, response, next) => {
    try {
        const { name, collectionCenter, dailryName, fatherName, mobile } = request.body
        if (!name || !collectionCenter || !dailryName || !fatherName || !mobile) {
            return next(new ApiError("No required information available", 400))
        }
        const isUserExists = await userModal.findOne({ mobile })
        if (isUserExists) {
            return next(new ApiError("User already exists try logging into your account", 400))
        }
        const password = mobile.slice(0, 5);
        const createdUser = await userModal.create({
            id: password,
            name,
            collectionCenter,
            dailryName,
            fatherName,
            mobile,
            password,
        })
        if (!createdUser) {
            return next(new ApiError("Unable to create user", 400))
        }

        const newUser = await userModal.findById(createdUser._id).select("-password -isVerified");
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            mobile: newUser.mobile,
            role: newUser.role,
            profilePic: newUser.profilePic,
            fatherName: newUser.fatherName
        };
        const token = await newUser.generateAuthToken();
        newUser.token = token;
        response.status(201).json({ message: "User created", token, user: userResponse, success: true })

    } catch (error) {
        console.log("error", error)
        next(new ApiError("Error creating user", 400))
    }
}

export const handleLoginUser = async (request, response, next) => {
    const { mobile, password } = request.body;
    try {
        const user = await userModal.findOne({ mobile }).select("+password +role");
        // Check if the user exists
        if (!user) {
            return next(new ApiError("User does not exist. Please register first.", 404));
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return next(new ApiError("Invalid email or password.", 401));
        }

        // Generate an authentication token
        const token = await user.generateAuthToken();

        // Exclude sensitive fields before sending the user data
        const userResponse = {
            id: user.id,
            name: user.name,
            mobile: user.mobile,
            role: user.role,
            profilePic: user.profilePic,
            fatherName: user.fatherName
        };

        // Send the response
        response.status(200).json({
            success: true,
            message: "Logged in successfully.",
            token,
            user: userResponse,
        });

    } catch (error) {
        next(new ApiError("Error logging user", 400))
    }
}

export const getAllCustomerList = async (request, response, next) => {
    try {
        const allCustomers = await userModal.find({ role: "User" })
        response.status(200).json({
            success: true,
            message: "customers retrieved successfully.",
            users: allCustomers,
        });
    } catch (error) {
        next(new ApiError("Error getting all customer list", 400))
    }
}

export const getSingleCustomerDetail = async (request, response, next) => {
    try {
        const userId = request.user._id;
        if (!userId) {
            return next(new ApiError("userId is required to get the user info", 400))
        }
        const userDetails = await userModal.findById(userId)
        if (!userDetails) {
            return next(new ApiError("No user found with the given id", 400))
        }
        response.status(200).json({
            success: true,
            message: "user detail retrieved successfully.",
            user: userDetails,
        });
    } catch (error) {
        next(new ApiError("Error getting single user details", 400))
    }
}
export const getSingleCustomerDetailAdmin = async (request, response, next) => {
    try {
        const userId = request.params.id;
        if (!userId) {
            return next(new ApiError("userId is required to get the user info", 400))
        }
        const userDetails = await userModal.findById(userId)
        if (!userDetails) {
            return next(new ApiError("No user found with the given id", 400))
        }
        const milkWithCustomer = await milkModal.find({ byUser: userId }).sort({ createdAt: -1 })
        response.status(200).json({
            success: true,
            message: "user detail retrieved successfully.",
            user: userDetails,
            entry: milkWithCustomer
        });
    } catch (error) {
        next(new ApiError("Error getting single user details", 400))
    }
}

export const updateUserDetails = async (request, response, next) => {
    try {
        const userId = request.user?._id
        if (!userId) {
            next(new ApiError("userId is required to update user", 400))
        }
        const { name, mobile, fatherName, address } = request.body;
        const updateData = {};

        const profilePic = request?.file?.buffer;
        let userUploadedProfilePic = "";

        if (profilePic) {
            const uploadUrl = await uploadToCloudinery(profilePic)
            if (!uploadUrl) {
                return new ApiError("Error  Uploading Profile Pic", 400)
            }
            userUploadedProfilePic = uploadUrl
        }

        if (name) updateData.name = name;
        if (mobile) updateData.mobile = mobile
        if (fatherName) updateData.fatherName = fatherName
        if (address) updateData.address = address
        if (userUploadedProfilePic) updateData.profilePic = userUploadedProfilePic;

        const updatedUser = await userModal.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
        response.status(200).json({ success: true, message: "User details updated successfully", user: updatedUser })
    } catch (error) {
        next(new ApiError("Error updating user details", 400))
    }
}

export const updateAdminPassword = async (request, response, next) => {
    try {
        const { oldPassword, newPassword } = request.body;
        const userId = request.user._id;
        if (!oldPassword || !newPassword) {
            return next(new ApiError("oldPassword and new password required", 400))
        }
        const currentUser = await userModal.findById(userId);
        if (!currentUser) {
            return next(new ApiError("no user found", 400))
        }

        const isCorrectPassword = await currentUser.comparePassword(oldPassword)
        if (!isCorrectPassword) {
            return next(new ApiError("Incorrect Password", 400))
        }
        currentUser.password = newPassword;
        await currentUser.save()
        response.status(200).json({ success: true, message: "password updated" })
    } catch (error) {
        next(new ApiError("Error while trying to update admin password", 400))
    }
}


// =====> Dashboard Data Controller <=========
export const dashboardData = async (request, response, next) => {
    const userId = request.user._id;
    try {
        const reqUser = await userModal.findById(userId);
        if (reqUser?.role === "Admin") {
            const totalCustomers = await userModal.collection.countDocuments({ role: "User" })
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            const monthlyData = await milkModal.find({
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });
            const totalMonthlyEarnings = monthlyData.reduce((acc, entry) => acc + parseFloat(entry.price), 0).toFixed(1);
            const totalMonthlyMilk = monthlyData.reduce((acc, entry) => acc + parseFloat(entry.weight), 0).toFixed(1);

            const todayData = await milkModal.find({
                date: { $gte: startOfToday, $lt: endOfToday }
            });
            const totalTodaysEarnings = todayData.reduce((acc, entry) => acc + parseFloat(entry.price), 0).toFixed(1);
            const totalTodaysMilk = todayData.reduce((acc, entry) => acc + parseFloat(entry.weight), 0).toFixed(1);;
            const lastFiveEntries = await milkModal.find({})
                .sort({ date: -1 }) // or use createdAt
                .limit(5).populate("byUser", "name profilePic");
            const allDashboardData = {
                totalCustomers: totalCustomers,
                totalMonthlyEarnings,
                totalMonthlyMilk,
                totalTodaysMilk,
                totalTodaysEarnings,
                lastFiveEntries
            }
            response.status(200).json({ message: "Success", success: true, data: allDashboardData })
        }
        else {
            const now = new Date();
            // Time ranges
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            // Monthly data
            const monthlyData = await milkModal.find({
                byUser: userId,
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            // Today's data
            const todayData = await milkModal.find({
                byUser: userId,
                date: { $gte: startOfToday, $lt: endOfToday }
            });

            // Last 5 entries
            const lastFiveEntries = await milkModal.find({ byUser: userId })
                .sort({ date: -1 }) // or use createdAt
                .limit(5).populate("byUser", "name profilePic");

            // Earnings and milk totals
            const totalMonthlyEarnings = monthlyData.reduce((acc, entry) => acc + parseFloat(entry.price), 0).toFixed(1);
            const totalMonthlyMilk = monthlyData.reduce((acc, entry) => acc + parseFloat(entry.weight), 0).toFixed(1);

            const totalTodaysEarnings = todayData.reduce((acc, entry) => acc + parseFloat(entry.price), 0).toFixed(1);
            const totalTodaysMilk = todayData.reduce((acc, entry) => acc + parseFloat(entry.weight), 0).toFixed(1);

            // Fat and SNF values for today
            const todaysFatValues = todayData.length ? todayData.map(entry => parseFloat(entry.fat || 0)).toFixed(1) : "0";
            const todaysSnfValues = todayData.length ? todayData.map(entry => parseFloat(entry.snf || 0)).toFixed(1) : "0";

            const allDashboardData = {
                monthlyEarning: totalMonthlyEarnings,
                totalMonthlyMilk,
                totalTodaysEarnings,
                totalTodaysMilk,
                todaysFatValues,
                todaysSnfValues,
                lastFiveEntries
            }
            response.status(200).json({ message: "Success", success: true, data: allDashboardData })
        }
    } catch (error) {
        next(new ApiError("Error while trying to update admin password", 400))
    }
}

// =====> Seller Controllers  <======
export const createSeller = async (request, response, next) => {
    try {
        const { name, collectionCenter, dailryName, fatherName, mobile } = request.body
        if (!name || !collectionCenter || !dailryName || !fatherName || !mobile) {
            return next(new ApiError("No required information available", 400))
        }
        const isUserExists = await userModal.findOne({ mobile })
        if (isUserExists) {
            return next(new ApiError("User already exists try logging into your account", 400))
        }
        const password = mobile.slice(0, 5);
        const createdUser = await userModal.create({
            id: password,
            name,
            collectionCenter,
            dailryName,
            fatherName,
            mobile,
            password,
            role: "Seller"
        })
        if (!createdUser) {
            return next(new ApiError("Unable to create user", 400))
        }

        const newUser = await userModal.findById(createdUser._id).select("-password -isVerified");
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            mobile: newUser.mobile,
            role: newUser.role,
            profilePic: newUser.profilePic,
            fatherName: newUser.fatherName
        };
        const token = await newUser.generateAuthToken();
        newUser.token = token;
        response.status(201).json({ message: "User created", token, user: userResponse, success: true })
    } catch (error) {
        next(new ApiError("Error while trying to update admin password", 400))
    }
}
export const getAllSellerList = async (request, response, next) => {
    try {
        const allCustomers = await userModal.find({ role: "Seller" })
        response.status(200).json({
            success: true,
            message: "customers retrieved successfully.",
            users: allCustomers,
        });
    } catch (error) {
        next(new ApiError("Error getting all customer list", 400))
    }
}