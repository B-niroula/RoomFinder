import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

type LogoutProps = {
  authService: AuthService;
  setUserNameCb: (userName: string | undefined) => void;
  setUserIdCb?: (userId: string | undefined) => void;
};

export default function Logout({ authService, setUserNameCb, setUserIdCb }: LogoutProps) {
  useEffect(() => {
    authService.logout();
    setUserNameCb(undefined);
    if (setUserIdCb) {
      setUserIdCb(undefined);
    }
  }, []);

  return <Navigate to="/" replace />;
}
