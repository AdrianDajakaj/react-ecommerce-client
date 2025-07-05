import React, { useState, useEffect } from "react";
import { Label } from "./Label";
import { Input } from "./Input";
import { cn } from "@/lib/utils";
import { useRegister } from "@/hooks/useRegister";

export function SignUpForm({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    street: "",
    number: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { register, loading, error: apiError } = useRegister();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSuccess, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstname.trim()) newErrors.firstname = "First name is required.";
    if (!formData.lastname.trim()) newErrors.lastname = "Last name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email format is invalid.";
    } else if (apiError && apiError.toLowerCase().includes('email already in use')) {
      newErrors.email = "Email is already registered.";
    }

    const password = formData.password;
    if (!password) {
      newErrors.password = "Password is required.";
    } else {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
      const isLongEnough = password.length >= 8;

      if (!isLongEnough || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
        newErrors.password =
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
      }
    }

    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match.";

    if (!formData.street.trim()) newErrors.street = "Street address is required.";
    if (!formData.number.trim()) newErrors.number = "Building number is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required.";
    if (!formData.country.trim()) newErrors.country = "Country is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: formData.firstname,
        surname: formData.lastname,
        address: {
          country: formData.country,
          city: formData.city,
          postcode: formData.postalCode,
          street: formData.street,
          number: formData.number,
        },
      };

      await register(registerData);
      setIsSuccess(true);
    } catch (err) {
      console.log(err);
    }
  };

  if (isSuccess) {
    return (
      <div className="shadow-input mx-auto w-full max-w-4xl rounded-none bg-white p-4 md:rounded-[2rem] md:p-8 dark:bg-black py-16">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            Registration Successful!
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Thank you for registering. You will be redirected in {countdown} seconds...
          </p>
          <div className="mt-6 h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-input mx-auto w-full max-w-4xl rounded-none bg-white p-4 md:rounded-[2rem] md:p-8 dark:bg-black py-16">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome to Apple Premium Reseller!
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Fill out the form to register.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex flex-col space-y-4 md:w-1/2">
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="firstname">First name</Label>
                <Input
                  id="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="Tyler"
                  type="text"
                />
                {errors.firstname && <ErrorText>{errors.firstname}</ErrorText>}
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="lastname">Last name</Label>
                <Input
                  id="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Durden"
                  type="text"
                />
                {errors.lastname && <ErrorText>{errors.lastname}</ErrorText>}
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="projectmayhem@fc.com"
                type="email"
              />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
              {apiError && apiError.toLowerCase().includes('email') && <ErrorText>{apiError}</ErrorText> }         
  
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                type="password"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Must include uppercase, lowercase, number, and special character.
              </p>
              {errors.password && <ErrorText>{errors.password}</ErrorText>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                type="password"
              />
              {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
            </LabelInputContainer>
          </div>

          <div className="mx-auto my-4 h-px w-full bg-neutral-300 dark:bg-neutral-700 md:mx-0 md:my-0 md:h-auto md:w-px" />

          <div className="flex flex-col space-y-4 md:w-1/2">
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Main Street"
                  type="text"
                />
                {errors.street && <ErrorText>{errors.street}</ErrorText>}
              </LabelInputContainer>
              <LabelInputContainer className="w-24">
                <Label htmlFor="number">Number</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={handleChange}
                  placeholder="123"
                  type="text"
                />
                {errors.number && <ErrorText>{errors.number}</ErrorText>}
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                type="text"
              />
              {errors.city && <ErrorText>{errors.city}</ErrorText>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="10001"
                type="text"
              />
              {errors.postalCode && <ErrorText>{errors.postalCode}</ErrorText>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="USA"
                type="text"
              />
              {errors.country && <ErrorText>{errors.country}</ErrorText>}
            </LabelInputContainer>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <button
            className="cursor-pointer group/btn relative mt-8 block h-10 w-[100vw] rounded-[2rem] bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Sign up"
            )}
            <BottomGradient />
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="cursor-pointer font-semibold text-black dark:text-white hover:text-blue-500"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}

const ErrorText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-red-500">{children}</p>
);

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;