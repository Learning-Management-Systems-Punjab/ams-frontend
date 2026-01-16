import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, GraduationCap } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/auth.service";
import { useAppDispatch } from "../../store/hooks";
import { setCredentials, setLoading } from "../../store/slices/authSlice";
import type { LoginRequest, UserRole } from "../../types";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginRequest]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const validate = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    dispatch(setLoading(true));
    setApiError("");

    try {
      const response = await authService.login(formData);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("profile", JSON.stringify(response.profile));

      dispatch(
        setCredentials({
          user: response.user,
          profile: response.profile,
          token: response.token,
        })
      );

      const dashboardRoutes: Record<UserRole, string> = {
        SysAdmin: "/sysadmin/dashboard",
        DistrictHead: "/districthead/dashboard",
        CollegeAdmin: "/collegeadmin/dashboard",
        Teacher: "/teacher/dashboard",
        Student: "/student/dashboard",
      };

      navigate(dashboardRoutes[response.user.role]);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setApiError(message);
      dispatch(setLoading(false));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AMS</h1>
              <p className="text-primary-100 text-sm">
                Attendance Management System
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Welcome to
            <br />
            Punjab College
            <br />
            Attendance System
          </h2>
          <p className="text-xl text-primary-100 max-w-lg">
            Streamline your attendance tracking and management with our
            comprehensive solution.
          </p>

          <div className="space-y-4 mt-8">
            {[
              "Real-time attendance tracking",
              "Role-based access control",
              "Comprehensive reporting",
              "Multi-college support",
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-primary-200 text-sm">
            © 2026 Punjab College System. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center space-x-3">
              <div className="bg-primary-600 p-3 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">AMS</h1>
                <p className="text-gray-600 text-sm">Attendance Management</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-600 mt-2">
                Enter your credentials to access your account
              </p>
            </div>

            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
                autoComplete="email"
                disabled={isLoading}
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={<Lock className="w-5 h-5" />}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Access restricted to authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
};
