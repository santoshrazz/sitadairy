import { customAlphabet } from 'nanoid'
const nanoId = customAlphabet("1234567890", 5)
import { userModal } from '../models/customer.model.js'
import { ApiError } from '../middleware/errorHandler.middleware.js'

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
        const password = nanoId(5);
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
        const userId = request.params.id;
        if (!userId) {
            return next(new ApiError("userId is required to get the user info", 400))
        }
        const userDetails = await userModal.findOne({ id: userId })
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

export const updateUserDetails = async (request, response, next) => {
    try {
        const userId = request.user?._id
        if (!userId) {
            next(new ApiError("userId is required to update user", 400))
        }
        const { name, mobile, fatherName, address, profilePic } = request.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (mobile) updateData.mobile = mobile
        if (fatherName) updateData.fatherName = fatherName
        if (address) updateData.address = address

        // Profile pic should be in base-64 format
        if (profilePic) updateData.profilePic = profilePic
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
        console.log("error", error)
        next(new ApiError("Error while trying to update admin password", 400))
    }
}