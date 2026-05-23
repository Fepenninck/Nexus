import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Require2FA({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function check2FA() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const totpEnabled = profile?.totp_enabled || user.user_metadata?.totp_enabled;

      if (!totpEnabled) {
        setStatus("setup");
        return;
      }

      if (sessionStorage.getItem("nexus_2fa_verified") !== "true") {
        setStatus("verify");
        return;
      }

      setStatus("ready");
    }

    check2FA();
  }, []);

  if (status === "loading") return <div>Carregando...</div>;
  if (status === "login") return <Navigate to="/login" replace />;
  if (status === "setup") return <Navigate to="/setup-2fa" replace />;
  if (status === "verify") return <Navigate to="/verify-2fa" replace />;

  return children;
}
