import React, { useEffect, useState } from "react";
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
import { Eye, EyeOff, Lock } from "lucide-react";

const ResetPasswordDialog = ({ open, onOpenChange, email }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        email,
        newPassword: password,
      });

      toast.success("Password reset successfully");
      onOpenChange(false); // close dialog
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setPassword(""); // reset password on open
      setConfirm(""); // reset confirm on open
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set New Password</DialogTitle>
          <DialogDescription>
            Your new password must be different from previous ones.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleReset}>
          {/* PASSWORD */}
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          <Button className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner /> Resetting…
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
