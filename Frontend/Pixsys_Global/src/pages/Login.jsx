import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { authService } from "../Services/authService";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const {
    executeAuth,
    verifyOtp,
    handleResendOtp,
    isLoading,
    error,
    setError,
    signupSuccess,
    setSignupSuccess,
    isOtpStep,
    setIsOtpStep,
  } = useLogin();

  const location = useLocation();
  const resetSuccess = location.state?.resetSuccess;

  useEffect(() => {
    authService.clearTokens();
  }, []);

  useEffect(() => {
    if (signupSuccess) {
      setIsSignup(false);
      setPassword("");
    }
  }, [signupSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOtpStep) {
      if (!otpCode) return;
      await verifyOtp(otpCode);
    } else {
      if (!email || !password) return;
      if (isSignup && !phoneNumber) return;
      if (signupSuccess) setSignupSuccess(false);
      await executeAuth(email, password, isSignup, phoneNumber);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img src="/Pixsys.png" alt="Pixsys Logo" className="h-12 w-auto mb-4" />
        <h2 className="mt-2 text-center text-xl font-bold tracking-widest uppercase text-zinc-900">
          {isOtpStep
            ? "Verify OTP"
            : isSignup
              ? "Create an Account"
              : "Welcome Back"}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 text-center">
          {isOtpStep
            ? `Enter the 6-digit code sent to ${email}`
            : isSignup
              ? "Sign up to access exclusive downloads."
              : "Sign in to access your downloads."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-zinc-200 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Success Message */}
            {signupSuccess && !isSignup && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium text-center">
                Account created successfully! Please sign in below.
              </div>
            )}
            
            {resetSuccess && !isSignup && !signupSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium text-center">
                Password updated successfully! Please sign in with your new password.
              </div>
            )}

            {/* OTP Step Render */}
            {isOtpStep ? (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2"
                >
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm tracking-widest text-center"
                    placeholder="123456"
                  />
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setIsOtpStep(false)}
                    className="text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Back to login
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-[#da0e19] hover:text-red-800"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Login / Signup Render */
              <>
                {isSignup && (
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2"
                    >
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required={isSignup}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2"
                  >
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold text-zinc-900 uppercase tracking-widest"
                    >
                      Password
                    </label>
                    {!isSignup && (
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-[#da0e19] hover:text-red-800 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={
                        isSignup ? "new-password" : "current-password"
                      }
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-[#da0e19] rounded-md text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xs font-bold tracking-widest uppercase text-white bg-[#da0e19] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#da0e19] transition-colors disabled:opacity-70"
              >
                {isLoading
                  ? "Processing..."
                  : isOtpStep
                    ? "Verify & Sign In"
                    : isSignup
                      ? "Create Account"
                      : "Continue to OTP"}
              </button>
            </div>
          </form>

          {!isOtpStep && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setSignupSuccess(false);
                  setError(null);
                }}
                className="text-sm font-medium text-[#da0e19] hover:text-red-800 transition-colors"
              >
                {isSignup
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
