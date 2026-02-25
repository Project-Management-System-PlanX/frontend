import type { ApiError } from "../types/models";
import { API_BASE_URL } from "./config";

interface RequestConfig extends RequestInit {
	token?: string;
	queryParams?: Record<string, string>;
}

export async function fetchClient<T>(
	endpoint: string,
	{ token, queryParams, headers: customHeaders, ...customConfig }: RequestConfig = {},
): Promise<T> {
	// Build query string if provided
	let url = `${API_BASE_URL}${endpoint}`;
	if (queryParams && Object.keys(queryParams).length > 0) {
		const searchParams = new URLSearchParams();
		Object.entries(queryParams).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				searchParams.append(key, value);
			}
		});
		url = `${url}?${searchParams.toString()}`;
	}

	// Setup default headers including Authorization
	const headers = new Headers(customHeaders);
	headers.set("Content-Type", "application/json");
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	const config: RequestInit = {
		...customConfig,
		headers,
	};

	const response = await fetch(url, config);

	// If response is not ok, extract error
	if (!response.ok) {
		let message = "An error occurred";
		try {
			const data = await response.json();
			message = data.message || `HTTP error! status: ${response.status}`;
		} catch {
			message = response.statusText || message;
		}
		const error: ApiError = { message, status: response.status };
		throw error;
	}

	// Handle No Content (DELETE typically)
	if (response.status === 204) {
		return {} as T;
	}

	try {
		const textResult = await response.text();
		if (!textResult) return {} as T;
		return JSON.parse(textResult);
	} catch (_error) {
		return {} as T;
	}
}

// Convenience Methods
export const apiClient = {
	get: <T>(endpoint: string, config?: RequestConfig) =>
		fetchClient<T>(endpoint, { ...config, method: "GET" }),
	post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
		fetchClient<T>(endpoint, {
			...config,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		}),
	patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) =>
		fetchClient<T>(endpoint, {
			...config,
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
		}),
	delete: <T>(endpoint: string, config?: RequestConfig) =>
		fetchClient<T>(endpoint, { ...config, method: "DELETE" }),
};
