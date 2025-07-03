const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,  // Ensure email is unique

        },
        password: {
            type: String,
            required: true,
        },
        salt: {
            type: String,

        },
        profileImageURL: {
            type: String,
            default: "/image/default.png",
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
        },
    },
    { timestamps: true }
);

userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next(); 

    const salt = randomBytes(16).toString("hex") ; // Fix: Add "hex" encoding
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");

    user.salt = salt;
    user.password = hashedPassword;
    next();
});
userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User not found');

    const salt = user.salt;   //retriving stored data
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");

    if (hashedPassword !== userProvidedHash) {
        console.error("Password mismatch!");
        throw new Error("Incorrect password");
    }
    console.log("Password matched!");
    
    const token = createTokenForUser(user)

    return token;

})

const User = model("User", userSchema); 

module.exports = User; 
