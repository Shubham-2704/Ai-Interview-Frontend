import React, { useContext, useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schema";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import ForgotPasswordDialog from "./ForgotPasswordPage";
import { GoogleLogin } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  ArrowRight,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { toast } from "sonner";

const Login = ({ onChangePage }) => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showAdminTokenModal, setShowAdminTokenModal] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [adminTokenLoading, setAdminTokenLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const navigate = useNavigate();

  const { updateUser } = useContext(UserContext);
  const { settings, loading: settingsLoading } = useSettings();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Function to handle signup button click
  const handleSignupClick = () => {
    if (settingsLoading) {
      toast.info("Loading settings...");
      return;
    }

    if (!settings.allowRegistration) {
      // Show popup dialog instead of inline alert
      setShowRegistrationPopup(true);
    } else {
      onChangePage("signup");
    }
  };

  // Google Login Handler - WITH REGISTRATION CHECK
  const handleGoogleLogin = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.GOOGLE_SIGNUP, {
        token: credentialResponse.credential,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        // Store user data for admin check
        setUserData(response.data);

        // Check if user is admin
        if (role === "admin") {
          // Show admin token modal instead of navigating directly
          setShowAdminTokenModal(true);
        } else {
          // Regular user - navigate to dashboard
          navigate("/dashboard");
          toast.success("Logged in successfully!", {
            position: "top-center",
          });
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        // Check if error is about registration closed
        if (
          error.response.data.message.includes("registrations") ||
          error.response.data.message.includes("closed")
        ) {
          // Show the popup dialog
          setShowRegistrationPopup(true);
        } else {
          toast.error(error.response.data.message, {
            position: "bottom-center",
          });
        }
      } else {
        toast.error("Failed to login with Google. Please try again.", {
          position: "bottom-right",
        });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.", {
      position: "bottom-right",
    });
  };

  async function onSubmit(data) {
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        // Store user data for later use
        setUserData(response.data);

        // Check if user is admin
        if (role === "admin") {
          // Show admin token modal instead of navigating directly
          setShowAdminTokenModal(true);
        } else {
          // Regular user - navigate to dashboard
          navigate("/dashboard");
          toast.success("Logged in successfully!", {
            position: "top-center",
          });
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message, {
          position: "bottom-center",
        });
      } else {
        toast.error("Something went wrong. Please try again.", {
          position: "bottom-right",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle admin token verification
  const handleVerifyAdminToken = async () => {
    if (!adminToken.trim()) {
      toast.error("Please enter admin token");
      return;
    }

    setAdminTokenLoading(true);
    try {
      // Verify admin token (public endpoint - no auth needed)
      const response = await axiosInstance.post(API_PATHS.AUTH.VERIFY_TOKEN, {
        adminToken: adminToken.trim(),
      });

      if (response.data) {
        toast.success("Admin token verified!");

        // Navigate based on user role
        if (userData?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }

        setShowAdminTokenModal(false);
      } else {
        toast.error("Invalid admin token");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Invalid admin token");
      }
    } finally {
      setAdminTokenLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerifyAdminToken();
    }
  };

  // Reset admin token when modal closes
  useEffect(() => {
    if (!showAdminTokenModal) {
      setAdminToken("");
    }
  }, [showAdminTokenModal]);

  // Show loading while fetching settings
  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Google Login Button */}
      <div className="mb-6">
        {googleLoading ? (
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6 border-gray-300"
            disabled
          >
            <Spinner size="sm" />
            Signing in with Google...
          </Button>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={handleGoogleError}
            text="signin_with"
            size="large"
            width="100%"
            theme="outline"
            shape="rectangular"
            logo_alignment="left"
            useOneTap={false}
            auto_select={false}
          />
        )}
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex justify-between items-center -mb-2">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Button
                    type="button"
                    variant="link"
                    className="p-1 text-sm"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your password"
                  />
                  <span
                    variant={"icon"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye className="size-[22px]" />
                    ) : (
                      <EyeOff className="size-[22px]" />
                    )}
                  </span>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            className="bg-black hover:bg-primary hover:text-primary-foreground transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner />
                Loading...
              </>
            ) : (
              "LOGIN"
            )}
          </Button>

          <FieldDescription>
            Don&apos;t have an account?{" "}
            <span
              className="text-primary font-medium underline cursor-pointer"
              onClick={handleSignupClick}
            >
              Sign Up
            </span>
          </FieldDescription>
        </FieldGroup>
      </form>

      <ForgotPasswordDialog open={showForgot} onOpenChange={setShowForgot} />

      {/* Registration Closed Popup Dialog */}
      <Dialog
        open={showRegistrationPopup}
        onOpenChange={setShowRegistrationPopup}
      >
        <DialogContent className=" sm:max-w-sm px-4 py-2 rounded-lg">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Info className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Registrations Temporarily Closed
            </DialogTitle>
            <DialogDescription className="text-center">
              New user registrations are currently unavailable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">
                    We're not accepting new registrations at this time.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    This is a temporary measure. Please check back later to
                    create your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  <strong>Already have an account?</strong> You can still login
                  using your existing credentials.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRegistrationPopup(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setShowRegistrationPopup(false);
                  // Optionally, you could automatically focus on login fields here
                }}
              >
                Continue to Login
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Token Modal */}
      <Dialog open={showAdminTokenModal} onOpenChange={setShowAdminTokenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Admin Access Required
            </DialogTitle>
            <DialogDescription className="text-center">
              Welcome, {userData?.name}! Please enter the admin token to access
              the admin panel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="h-4 w-4" />
                <span>Enter admin token:</span>
              </div>
              <Input
                type="password"
                placeholder="Enter admin token"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-center text-lg font-mono tracking-wider"
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center">
                Contact system administrator if you don't have the token
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAdminTokenModal(false)}
                disabled={adminTokenLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleVerifyAdminToken}
                disabled={adminTokenLoading || !adminToken.trim()}
              >
                {adminTokenLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Token
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> This is an additional security layer
                  for admin access. Regular users don't need this token.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;