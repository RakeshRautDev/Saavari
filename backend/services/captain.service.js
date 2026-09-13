import { captainModel as Captain } from "../models/captain.model.js";

export const createCaptain = async ({
    firstname,
    lastname,
    email,
    password,
    color,
    plate,
    capacity,
    vehicleType,
    avatarUrl
}) => {

    console.log("createCaptain service called");

    if (
        !firstname ||
        !lastname ||
        !email ||
        !password ||
        !color ||
        !plate ||
        !capacity ||
        !vehicleType
    ) {
        console.log("Validation failed: Missing required fields");
        throw new Error("All fields are required");
    }

    console.log("All required fields are present");

    const hashedPassword = await Captain.hashPassword(password);

    console.log("Password hashed successfully");

    const captain = await Captain.create({
        fullname: {
            firstname,
            lastname
        },
        email,
        password: hashedPassword,
        avatarUrl: avatarUrl || "",
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    });

    console.log("Captain created successfully");
    console.log("Created captain ID:", captain._id);

    return captain;
};
export const toggleStatusService = async (captainId, newStatus) => {
    if (!captainId || !newStatus) {
        throw new Error("Captain ID and newStatus are required");
    }

    if (!["active", "inactive"].includes(newStatus)) {
        throw new Error("Invalid status");
    }

    const captain = await Captain.findById(captainId);
    if (!captain) {
        throw new Error("Captain not found");
    }

    captain.status = newStatus;
    await captain.save();

    return captain;
};
