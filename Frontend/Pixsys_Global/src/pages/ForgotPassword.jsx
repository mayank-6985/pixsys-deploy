import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";

const ForgotPassword = () => {
  const {
    step,
    setStep,
    emailForReset,
    requestPasswordReset,
    verifyOtp,
    confirmNewPassword,
    isLoading,
    error,
    setError,
  } = useForgotPassword();

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === "email") {
      if (!email) return;
      await requestPasswordReset(email);
    } else if (step === "otp") {
      if (!otpCode) return;
      await verifyOtp(otpCode);
    } else if (step === "password") {
      if (!newPassword || !confirmPassword) return;
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      await confirmNewPassword(newPassword);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img src="/Pixsys.png" alt="Pixsys Logo" className="h-12 w-auto mb-4" />
        <h2 className="mt-2 text-center text-xl font-bold tracking-widest uppercase text-zinc-900">
          {step === "email"
            ? "Reset Password"
            : step === "otp"
              ? "Verify OTP"
              : "New Password"}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 text-center">
          {step === "email"
            ? "Enter your email to receive a reset code."
            : step === "otp"
              ? `Enter the 6-digit code sent to ${emailForReset}`
              : "Create a new strong password."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-zinc-200 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === "email" && (
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
            )}

            {step === "otp" && (
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
                    onClick={() => {
                      setStep("email");
                      setError(null);
                    }}
                    className="text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={() => requestPasswordReset(emailForReset)}
                    disabled={isLoading}
                    className="text-xs font-bold text-[#da0e19] hover:text-red-800"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {step === "password" && (
              <>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2"
                  >
                    New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 focus:border-[#da0e19] focus:ring-1 focus:ring-[#da0e19] outline-none transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold text-zinc-900 uppercase tracking-widest mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  : step === "email"
                    ? "Send Reset Code"
                    : step === "otp"
                      ? "Verify Code"
                      : "Update Password"}
              </button>
            </div>
          </form>

          {step === "email" && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-[#da0e19] hover:text-red-800 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
