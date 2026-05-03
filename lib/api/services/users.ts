import type { UserProfile } from "../../types/models";
import { apiClient } from "../client";

export const userService = {
	getMe: async (token?: string) => apiClient.get<UserProfile>("/users/me", { token }),
};
