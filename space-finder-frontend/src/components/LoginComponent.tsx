import { SyntheticEvent, useState } from "react";
import { AuthService } from "../services/AuthService";
import { Navigate } from "react-router-dom";

type LoginProps = {
  authService: AuthService;
  setUserNameCb: (userName: string) => void;
};

export default function LoginComponent({ authService, setUserNameCb }: LoginProps) {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmCode, setConfirmCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const [mode, setMode] = useState<"signin" | "signup" | "confirm">("signin");
  const [infoMessage, setInfoMessage] = useState<string>("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+[1-9]\d{7,14}$/;

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (mode === "signin") {
      if (userName && password) {
        const loginResponse = await authService.login(userName, password);
        const userName2 = authService.getUserName();
        if (userName2) {
          setUserNameCb(userName2);
        }
        if (loginResponse) {
          setLoginSuccess(true);
        } else {
          setErrorMessage("Invalid credentials");
        }
      } else {
        setErrorMessage("UserName and password required!");
      }
    } else if (mode === "signup") {
      if (!email && !phone) {
        setErrorMessage("Provide at least an email or a phone.");
        return;
      }
      if (email && !emailRegex.test(email)) {
        setErrorMessage("Valid email required to sign up.");
        return;
      }
      if (phone && !phoneRegex.test(phone)) {
        setErrorMessage("Valid phone in E.164 format (e.g., +15551234567).");
        return;
      }
      if (userName && password) {
        const signedUp = await authService.signUp(userName, password, email || undefined, phone || undefined);
        if (signedUp) {
          setInfoMessage("Account created. Check your email/phone for the confirmation code, then confirm below.");
          setMode("confirm");
        } else {
          setErrorMessage("Could not sign up. Please try again.");
        }
      } else {
        setErrorMessage("UserName and password required to sign up.");
      }
    } else if (mode === "confirm") {
      if (userName && confirmCode) {
        const confirmed = await authService.confirmSignUp(userName, confirmCode);
        if (confirmed) {
          setInfoMessage("Account confirmed. You can sign in now.");
          setMode("signin");
        } else {
          setErrorMessage("Invalid confirmation code. Please try again.");
        }
      } else {
        setErrorMessage("Provide username and confirmation code.");
      }
    }
  };

  function renderLoginResult() {
    return (
      <>
        {errorMessage && <div className="status-banner error">{errorMessage}</div>}
        {infoMessage && <div className="status-banner info">{infoMessage}</div>}
      </>
    );
  }

  return (
    <div role="main" className="page-container narrow">
      {loginSuccess && <Navigate to="/profile" replace={true} />}
      <div className="page-hero">
        <p className="eyebrow">{mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Confirm account"}</p>
        <h1>{mode === "signin" ? "Access your RoomFinder account" : mode === "signup" ? "Create your RoomFinder account" : "Enter your confirmation code"}</h1>
        <p className="muted">
          {mode === "signin" && "Sign in to list rooms, upload photos, and contact owners."}
          {mode === "signup" && "Create an account to publish listings and manage them."}
          {mode === "confirm" && "We sent a confirmation code to your email. Enter it to activate your account."}
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button type="button" className={`btn-ghost ${mode === "signin" ? 'active-tab' : ''}`} onClick={() => { setMode("signin"); setErrorMessage(""); setInfoMessage(""); }}>
            Sign in
          </button>
          <button type="button" className={`btn-ghost ${mode === "signup" ? 'active-tab' : ''}`} onClick={() => { setMode("signup"); setErrorMessage(""); setInfoMessage(""); }}>
            Sign up
          </button>
          <button type="button" className={`btn-ghost ${mode === "confirm" ? 'active-tab' : ''}`} onClick={() => { setMode("confirm"); setErrorMessage(""); setInfoMessage(""); }}>
            Confirm
          </button>
        </div>
      </div>
      <form onSubmit={(e) => handleSubmit(e)} className="card form-card">
        <label className="input-control">
          <span>User name</span>
          <input
            className="input"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoComplete="username"
          />
        </label>
        {(mode === "signin" || mode === "signup") && (
          <label className="input-control">
            <span>Password</span>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </label>
        )}
        {mode === "signup" && (
          <>
            <label className="input-control">
              <span>Email (optional)</span>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </label>
            <label className="input-control">
              <span>Phone (optional, E.164, e.g., +15551234567)</span>
              <input
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                autoComplete="tel"
              />
            </label>
          </>
        )}
        {mode === "confirm" && (
          <label className="input-control">
            <span>Confirmation code</span>
            <input
              className="input"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              autoComplete="one-time-code"
            />
          </label>
        )}
        <button className="btn-primary full-width" type="submit">
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Confirm account"}
        </button>
      </form>
      {renderLoginResult()}
    </div>
  );
}
