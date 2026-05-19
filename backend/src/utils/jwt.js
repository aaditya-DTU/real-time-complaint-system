import jwt from "jsonwebtoken";

export const generateToken = ({ userId, role }) => {
  if (!userId) throw new Error("Missing userId in token generation");

  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
