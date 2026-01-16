
import React, { useContext, useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/schema";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import ProfilePhotoSelector from "@/components/Inputs/ProfilePhotoSelector";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import uploadImage from "@/utils/uploadImage";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const Signup = ({ onChangePage }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  // Watch password field for real-time validation
  const password = useWatch({
    control: form.control,
    name: "password",
  });

  // Update validation states when password changes
  useEffect(() => {
    if (!password) {
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
      return;
    }

    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  async function onSubmit(data) {
    let profileImageUrl = "";

    setLoading(true);
    try {
      // Upload image if present
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: data.fullName,
        email: data.email.toLowerCase().trim(),
        password: data.password,
        profileImageUrl,
      });

      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
        toast.success("Account created successfully!");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const validationRules = [
    {
      id: "length",
      label: "At least 8 characters",
      valid: passwordValidation.length,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter (A-Z)",
      valid: passwordValidation.uppercase,
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter (a-z)",
      valid: passwordValidation.lowercase,
    },
    {
      id: "number",
      label: "At least one number (0-9)",
      valid: passwordValidation.number,
    },
    {
      id: "special",
      label: "At least one special character (!@#$%^&*)",
      valid: passwordValidation.special,
    },
  ];

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your full name"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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

          {/* Password Field with Validation */}
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter your password"
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 cursor-pointer" />
                    ) : (
                      <Eye className="size-5 cursor-pointer" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            Object.values(passwordValidation).filter(Boolean)
                              .length === 5
                              ? "bg-green-500"
                              : Object.values(passwordValidation).filter(
                                  Boolean
                                ).length >= 3
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${
                              (Object.values(passwordValidation).filter(Boolean)
                                .length /
                                5) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {Object.values(passwordValidation).filter(Boolean)
                          .length === 5
                          ? "Strong"
                          : Object.values(passwordValidation).filter(Boolean)
                              .length >= 3
                          ? "Medium"
                          : "Weak"}
                      </span>
                    </div>

                    {/* Validation Rules */}
                    <div className="space-y-1.5">
                      {validationRules.map((rule) => (
                        <div key={rule.id} className="flex items-center gap-2">
                          {rule.valid ? (
                            <Check className="size-4 text-green-500" />
                          ) : (
                            <X className="size-4 text-gray-300" />
                          )}
                          <span
                            className={`text-xs ${
                              rule.valid ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            className="bg-black hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !form.formState.isValid}
          >
            {loading ? (
              <>
                <Spinner />
                Creating Account...
              </>
            ) : (
              "SIGN UP"
            )}
          </Button>

          <FieldDescription>
            Already have an account?{" "}
            <span
              className="text-primary font-medium underline cursor-pointer"
              onClick={() => onChangePage("login")}
            >
              Login
            </span>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
};

export default Signup;
