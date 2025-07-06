import React, { useState } from 'react';
import { Label } from './Label';
import { Input } from './Input';
import { cn } from '@/lib/utils';
import { useLogin } from '@/hooks/useLogin';

/**
 * SignInForm component for user authentication.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Function to call when the form is closed.
 * @param {Function} props.onSwitch - Function to switch to the sign-up form.
 * @returns {JSX.Element} The rendered sign-in form.
 */
export function SignInForm({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const { login, loading } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    try {
      await login({ email, password });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="p-4">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-[2rem] md:p-8 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Welcome back!</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Please enter your credentials to sign in.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="name.surname@gmail.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </LabelInputContainer>

          <LabelInputContainer className="mb-8">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </LabelInputContainer>

          {formError && <div className="mb-4 text-red-600 text-center text-sm">{formError}</div>}

          <div className="flex justify-center w-full">
            <button
              className="cursor-pointer group/btn relative mt-8 block h-10 w-[100vw] rounded-[2rem] bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <BottomGradient />
            </button>
          </div>
          <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Don’t have an account?{' '}
            <button
              type="button"
              onClick={onSwitch}
              className="cursor-pointer font-semibold text-black dark:text-white hover:text-blue-500"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
};
