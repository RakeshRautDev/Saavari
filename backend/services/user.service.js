import { User } from "../models/user.model.js";

export const createUser = async ({
    firstname,
    lastname,
    email,
    password,
    avatarUrl
}) => {

    console.log("createUser service called");
    console.log("User data:", {
        firstname,
        lastname,
        email
    });

    if (!firstname || !lastname || !email || !password) {
        console.log("Validation failed: Missing required fields");
        throw new Error("All fields are required");
    }

    console.log("All required fields are present");

    const hashedPassword = await User.hashPassword(password);

    console.log("Password hashed successfully");

    const user = await User.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password: hashedPassword,
        avatarUrl: avatarUrl || ""
    });

    console.log("User created successfully");
    console.log("Created user ID:", user._id);

    return user;
};