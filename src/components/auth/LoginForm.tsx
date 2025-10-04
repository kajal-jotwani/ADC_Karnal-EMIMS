import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, School } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LoginCredentials } from "../../types/auth";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password is required"),
});

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLogginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  //submit handler
  const onSubmit = async (credentials: LoginCredentials) => {
    setLogginError(null);
    const success = await login(credentials.email, credentials.password);

    if (!success) {
      setLogginError("Invalid email or password. Please try again");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-6 lg:px-8 bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: `url('src/public/background.png')`,
      }}
    >
      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl space-y-8 transition-transform duration-500 hover:scale-[1.01]">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-md">
            <img
              src="src/public/logo.png"
              alt="Government of Haryana Logo"
              className="h-50 w-30 object-contain"
            />
          </div>
          <h2 className="mt-4 text-2xl font-heading font-bold text-gray-900 leading-tight">
            Education Management System Karnal
          </h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Error Banner */}
          {loginError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {loginError}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                {...register("email")}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="mt-1 input"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
              </span>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>

      {/* Background animation keyframes */}
      <style>{`
        @keyframes bgMove {
          0% { background-position: 0 0; }
          100% { background-position: 1000px 1000px; }
        }
        .animate-bgMove {
          animation: bgMove 60s linear infinite;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(5px);
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
