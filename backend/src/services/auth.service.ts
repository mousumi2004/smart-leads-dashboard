import { User, type UserDocument } from "../models/User.js";
import { AppError } from "../utils/apiResponse.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAuthToken } from "../utils/jwt.js";
import type { UserRole } from "../constants/roles.js";

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

const toSafeUser = (user: UserDocument): SafeUser => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role
});

export const register = async (input: { name: string; email: string; password: string; role: UserRole }) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: await hashPassword(input.password),
    role: input.role
  });

  return { token: signAuthToken(user), user: toSafeUser(user) };
};

export const login = async (input: { email: string; password: string }) => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user || !(await comparePassword(input.password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  return { token: signAuthToken(user), user: toSafeUser(user) };
};
