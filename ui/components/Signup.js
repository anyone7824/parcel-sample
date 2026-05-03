import { useRef, useReducer, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { z, ZodIssueCode } from "zod";
import { axiosAPI } from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const CODE_TTL_SECONDS = 60;

const zodValidate = (schema) => async (values) => {
  const result = await schema.safeParseAsync(values);

  if (result.success) return {};

  const errors = {};

  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    errors[field] = issue.message;
  });

  return errors;
};

const fieldStyles =
  "border-b-2 w-70 sm:w-80 h-10 pl-2 font-mono text-sm sm:text-md text-black focus:outline-none focus:border-green-400";

const buttonStyles =
  "h-10 w-40 bg-[#9CD5FF] text-sm sm:text-md rounded-lg font-mono font-bold text-black cursor-pointer hover:bg-blue-200";

const initialUIState = {
  showOrgPass: false,
  showConPass: false,
  sending: false,
  showCode: false,
  resendTimer: CODE_TTL_SECONDS,
  resendAvail: false,
  emailVerified: false,
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_ORG_PASS":
      return { ...state, showOrgPass: !state.showOrgPass };
    case "TOGGLE_CON_PASS":
      return { ...state, showConPass: !state.showConPass };
    case "SET_SENDING":
      return { ...state, sending: action.payload };
    case "SHOW_CODE":
      return { ...state, showCode: true };
    case "HIDE_CODE":
      return { ...state, showCode: false };
    case "START_RESEND":
      return {
        ...state,
        resendAvail: true,
        resendTimer: CODE_TTL_SECONDS,
      };
    case "TICK_RESEND":
      return { ...state, resendTimer: state.resendTimer - 1 };
    case "RESET_RESEND":
      return {
        ...state,
        resendTimer: CODE_TTL_SECONDS,
        resendAvail: false,
      };
    case "SET_EMAIL_VERIFIED":
      return { ...state, emailVerified: action.payload };
    default:
      return state;
  }
};

const Signup = () => {
  const [uiState, dispatch] = useReducer(uiReducer, initialUIState);
  const emailChecked = useRef(false);
  const currentEmail = useRef("");
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (uiState.resendAvail && uiState.resendTimer > 0) {
      timer = setTimeout(() => dispatch({ type: "TICK_RESEND" }), 1000);
    }
    if (uiState.resendTimer === 0) {
      dispatch({ type: "RESET_RESEND" });
    }
    return () => clearTimeout(timer);
  }, [uiState.resendAvail, uiState.resendTimer]);

  const validationSchema = z
    .object({
      fullName: z.string().trim().min(1, "Required"),
      dob: z.string().min(1, "Required").pipe(z.coerce.date()),
      email: z
        .string()
        .trim()
        .min(1, "Required")
        .email("Invalid email")
        .superRefine(async (email, ctx) => {
          if (!email.endsWith("@gmail.com")) {
            ctx.addIssue({
              path: ["email"],
              message: "Only Gmail address is allowed",
              code: z.ZodIssueCode.custom,
            });
            return;
          }
          if (email !== currentEmail.current) {
            currentEmail.current = email;
            emailChecked.current = false;
          }
          if (!emailChecked.current && email) {
            emailChecked.current = true;
            try {
              const res = await axiosAPI.get(`/check-email?email=${email}`);
              if (res.data.message) {
                ctx.addIssue({
                  path: ["email"],
                  message: res.data.message,
                  code: ZodIssueCode.custom,
                });
              }
              if (res.data.exists) {
                ctx.addIssue({
                  path: ["email"],
                  message: "Email already exists",
                  code: ZodIssueCode.custom,
                });
              }
            } catch (error) {
              ctx.addIssue({
                path: ["email"],
                message: "Error validating email",
                code: ZodIssueCode.custom,
              });
            }
          }
        }),
      password: z
        .string()
        .trim()
        .min(1, "Required")
        .min(8, "Password must be atleast 8 characters.")
        .superRefine((password, ctx) => {
          if (!/[A-Z]/.test(password)) {
            ctx.addIssue({
              message: "Password must contain atleast one capital letter",
              code: ZodIssueCode.custom,
            });
          }

          if (!/[a-z]/.test(password)) {
            ctx.addIssue({
              message: "Password must contain atleast one small letter",
              code: ZodIssueCode.custom,
            });
          }

          if (!/[0-9]/.test(password)) {
            ctx.addIssue({
              message: "Password must contain atleast one number",
              code: ZodIssueCode.custom,
            });
          }

          if (!/[.!@#$%^&*_]/.test(password)) {
            ctx.addIssue({
              message:
                "Password must contain atleast one special character (.!@#$%^&*_)",
              code: ZodIssueCode.custom,
            });
          }
        }),
      confirmPassword: z.string().trim().min(1, "Required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password does not match.",
      path: ["confirmPassword"],
    });

  const sendDetails = async (values, { resetForm }) => {
    try {
      const res = await axiosAPI.post("/signup", values);
      if (res.data.success) resetForm();
      alert(res.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  const sendCode = async (values) => {
    dispatch({ type: "SET_SENDING", payload: true });
    try {
      const res = await axiosAPI.post("/send-code", values);
      if (res.data.success) {
        dispatch({ type: "SHOW_CODE" });
        dispatch({ type: "START_RESEND" });
      }
      alert(res.data.message);
    } catch (error) {
      alert(error.message);
    } finally {
      dispatch({ type: "SET_SENDING", payload: false });
    }
  };

  const verifyCode = async (values) => {
    try {
      const res = await axiosAPI.post("/verify-code", values);
      if (res.data.success) {
        dispatch({ type: "SET_EMAIL_VERIFIED", payload: true });
        dispatch({ type: "RESET_RESEND" });
        dispatch({ type: "HIDE_CODE" });
      }
      alert(res.data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#9CD5FF] flex items-center justify-center">
      <Formik
        initialValues={{
          fullName: "",
          dob: "",
          email: "",
          code: "",
          password: "",
          confirmPassword: "",
        }}
        validate={zodValidate(validationSchema)}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={sendDetails}
      >
        {({ values, errors, touched, isSubmitting }) => (
          <Form className=" h-auto bg-white py-10 w-90 px-4 sm:px-2 sm:w-120 shadow-2xl rounded-lg flex flex-col gap-6 items-center justify-center">
            <h1 className="text-xl font-bold">SignUp</h1>
            <Field
              as="input"
              name="fullName"
              className={fieldStyles}
              placeholder="Full Name"
            ></Field>
            {errors.fullName && touched.fullName && (
              <div className="text-red-500 text-sm w-80">{errors.fullName}</div>
            )}
            <Field
              type="date"
              name="dob"
              className={fieldStyles}
              placeholder="Date of Birth"
            ></Field>
            {errors.dob && touched.dob && (
              <div className="text-red-500 text-sm w-80">{errors.dob}</div>
            )}
            <Field
              type="email"
              name="email"
              ref={currentEmail}
              className={fieldStyles}
              placeholder="Email Address"
            ></Field>
            {uiState.resendAvail && (
              <p>
                Request another code in: 00:
                {uiState.resendTimer < 10
                  ? `0${uiState.resendTimer}`
                  : uiState.resendTimer}
                s
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                sendCode({ email: values.email, type: "VERIFY_EMAIL" })
              }
              className={buttonStyles}
              disabled={
                !values.email ||
                errors.email ||
                uiState.emailVerified ||
                uiState.sending ||
                uiState.resendAvail
              }
            >
              {uiState.sending ? "Sending..." : "Get Code"}
            </button>
            {errors.email && touched.email && (
              <div className="text-red-500 text-sm w-80">{errors.email}</div>
            )}
            {uiState.showCode && (
              <div className="flex flex-col gap-2 items-center justify-center">
                <Field
                  type="text"
                  name="code"
                  className={fieldStyles}
                  placeholder="Verification Code"
                ></Field>
                <button
                  type="button"
                  onClick={() =>
                    verifyCode({
                      email: values.email,
                      code: values.code,
                      type: "VERIFY_EMAIL",
                    })
                  }
                  className={buttonStyles}
                  disabled={!values.code || uiState.emailVerified}
                >
                  Verify
                </button>
              </div>
            )}

            <div className="relative max-w-70 sm:max-w-80 w-full ">
              <Field
                type={uiState.showOrgPass ? "text" : "password"}
                name="password"
                className={fieldStyles}
                placeholder="Password"
              ></Field>
              <span
                className="material-icons absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-800"
                onClick={() => dispatch({ type: "TOGGLE_ORG_PASS" })}
              >
                {uiState.showOrgPass ? "visibility_off" : "visibility"}
              </span>
            </div>
            {errors.password && touched.password && (
              <div className="text-red-500 text-sm w-80">{errors.password}</div>
            )}
            <div className="relative max-w-70 sm:max-w-80 w-full ">
              <Field
                type={uiState.showConPass ? "text" : "password"}
                name="confirmPassword"
                className={fieldStyles}
                placeholder="Confirm Password"
              ></Field>
              <span
                className="material-icons absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-800"
                onClick={() => dispatch({ type: "TOGGLE_CON_PASS" })}
              >
                {uiState.showConPass ? "visibility_off" : "visibility"}
              </span>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <div className="text-red-500 text-sm w-80">
                {errors.confirmPassword}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !uiState.emailVerified}
              className={buttonStyles}
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
            <Link to="/login" className="text-blue-400">
              Already have an account?
            </Link>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Signup;
