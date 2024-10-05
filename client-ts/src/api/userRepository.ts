import { UserCreateModel, ReadUserProfileModel } from "../models/userModel";

const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

export const login = async (email: string, password: string): Promise<Response> => {
    const formDataToSend = new URLSearchParams();
    formDataToSend.append("grant_type", "password");
    formDataToSend.append("username", email);
    formDataToSend.append("password", password);
    formDataToSend.append("scope", "");
    formDataToSend.append("client_id", "");
    formDataToSend.append("client_secret", "");

    const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDataToSend.toString(),
    });

    return response;
};

export const getUserProfile = async (token: string): Promise<ReadUserProfileModel> => {
    const response = await fetch(`${API_URL}/users/profile`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }
    const data = await response.json();
    return {
        username: data.username,
        age: data.age || "",
        gender: data.gender || "",
        congenital_disorders: data.congenital_disorders || "",
    };
};
