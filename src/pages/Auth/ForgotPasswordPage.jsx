
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import ResetPasswordDialog from "./ResetPasswordPage";

const ForgotPasswordDialog = ({ open, onOpenChange }) => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showReset, setShowReset] = useState(false);

  // send otp
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setResendLoading(true);

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      toast.success("OTP sent to your email");
      setTimeLeft(res.data.expiresIn || 600);
      setStep("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setResendLoading(false);
    }
  };

  // verify otp
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post(API_PATHS.AUTH.VERIFY_RESET_OTP, { email, otp });
      toast.success("OTP verified Successfully");
      setShowReset(true);
      onOpenChange(false);
      // setStep("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // timer countdown
  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;

    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  const formatTime = (sec) =>
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;

  // reset state when closed
  useEffect(() => {
    if (!open) {
      setStep("email");
      // setEmail("");
      setOtp("");
      setTimeLeft(0);
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === "email" ? "Forgot Password" : "Verify OTP"}
            </DialogTitle>
            <DialogDescription>
              {step === "email"
                ? "We’ll send an OTP to your email to reset your password."
                : "Enter the OTP sent to your email to reset your password"}
            </DialogDescription>
          </DialogHeader>

          {/* EMAIL STEP */}
          {step === "email" && (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                disabled={resendLoading}
                onClick={handleSendOtp}
              >
                {resendLoading ? (
                  <>
                    <Spinner /> Sending…
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <Label>Enter OTP</Label>
              <Input
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                required
              />

              <Button disabled={loading || timeLeft <= 0}>
                {loading ? (
                  <>
                    <Spinner /> Verifying…
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {timeLeft > 0 ? (
                <p className="text-sm text-center">
                  Expires in: <b>{formatTime(timeLeft)}</b>
                </p>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleSendOtp}
                  className="ml-3"
                >
                  {loading ? (
                    <>
                      <Spinner /> Resending…
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </Button>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ResetPasswordDialog
        open={showReset}
        onOpenChange={setShowReset}
        email={email}
      />
    </>
  );
};

export default ForgotPasswordDialog;
