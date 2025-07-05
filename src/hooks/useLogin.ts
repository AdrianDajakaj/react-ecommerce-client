import { useState } from "react";
import { API_BASE_URL } from "@/config";

interface LoginData {
  email: string;
  password: string;
}

/*
    * Custom hook to handle user login and logout.
    *
    * @returns {Object} An object containing:
    * - login: Function to log in the user
    * - logout: Function to log out the user
    * - loading: Boolean indicating if the request is in progress
    * - error: Error message if any occurred during the request
    * - token: JWT token if login was successful
    */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        }
        throw new Error(errorData.message || "Login failed");
      }
      const result = await response.json();
      console.log(result)
      setToken(result.token);
      sessionStorage.setItem("jwt_token", result.token);
      if (result.user && result.user.id) {
        sessionStorage.setItem("user_id", result.user.id.toString());
      }
      console.log("JWT token:", result.token);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("user_id");
  };

  return { login, logout, loading, error, token };
}
