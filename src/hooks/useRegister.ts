import { useState } from "react";
import { API_BASE_URL } from "@/config";

interface Address {
  country: string;
  city: string;
  postcode: string;
  street: string;
  number: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
  address: Address;
}

/**
 * Custom hook to handle user registration.
 *
 * @returns {Object} An object containing:
 * - register: Function to register a new user
 * - loading: Boolean indicating if the request is in progress
 * - error: Error message if any occurred during the request
 * - success: Boolean indicating if the registration was successful
 */
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      setSuccess(true);
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, success };
}