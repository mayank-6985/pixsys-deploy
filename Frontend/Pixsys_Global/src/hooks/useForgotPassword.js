import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../Services/authService";

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Step 1: "email", Step 2: "otp", Step 3: "password"
  const [step, setStep] = useState("email");
  const [emailForReset, setEmailForReset] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const navigate = useNavigate();

  const extractErrorMessage = (err, defaultMessage = "An error occurred. Please try again.") => {
    if (err.response && err.response.data) {
      const data = err.response.data;
      if (typeof data === "string") return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.detail) return data.detail;
      
      if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          if (Array.isArray(data[firstKey])) {
            return data[firstKey][0];
          } else if (typeof data[firstKey] === "string") {
            return data[firstKey];
          }
        }
      }
    }
    return err.message || defaultMessage;
  };

  const requestPasswordReset = async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.passwordResetRequest(email);
      setEmailForReset(email);
      setStep("otp");
    } catch (err) {
      console.error("Password reset request failed:", err);
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.passwordResetVerify({
        email: emailForReset,
        otp_code: otp,
      });
      setOtpCode(otp);
      setStep("password");
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(extractErrorMessage(err, "Invalid OTP code. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmNewPassword = async (newPassword) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.passwordResetConfirm({
        email: emailForReset,
        new_password: newPassword,
      });
      navigate("/login", { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      console.error("Password confirm failed:", err);
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    setStep,
    emailForReset,
    requestPasswordReset,
    verifyOtp,
    confirmNewPassword,
    isLoading,
    error,
    setError,
  };
};
