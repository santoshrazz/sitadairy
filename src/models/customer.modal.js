import mongoose, { Schema } from 'mongoose'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
const userSchema = new Schema({
    id: {
        type: String,
        required: [true, "Id is required"],
    },
    name: {
        type: String,
        required: [true, "name is required"],
    },
    mobile: {
        type: String,
        required: [true, "mobile number is required"],
        trim: true
    },
    collectionCenter: {
        type: String,
        required: [true, "collection center name is required"],
    },
    dailryName: {
        type: String,
        required: [true, "collection center name is required"],
    },
    fatherName: {
        type: String,
        required: [true, "father name is required"],
    },
    password: {
        type: String,
        minLength: [5, "Minimum 6 character required"],
        required: [true, "Password is require"]
    },
    address: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profilePic: {
        type: String,
        default: "https://res.cloudinary.com/dskra60sa/image/upload/v1743086699/man_rqv4zk.png"
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User"
    },
    // byUser: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "user",
    //     required: true
    // }
}, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcryptjs.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return bcryptjs.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error("Password comparison failed");
    }
}

userSchema.methods.generateAuthToken = async function () {
    return jwt.sign({ id: this.id, _id: this._id },
        process.env.JWT_SECRET_KEY,
    )
}

export const userModal = mongoose.models.users || mongoose.model("user", userSchema)
