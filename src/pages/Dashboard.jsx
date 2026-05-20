import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Bem-vindo, {profile?.full_name || user?.email}!</h1>

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #2563eb",
            borderRadius: "8px",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <h2>Status de Segurança</h2>
          <p>
            2FA: {profile?.totp_enabled ? "✅ Ativado" : "⚠️ Não ativado — "}
            {!profile?.totp_enabled && (
              <Link to="/setup-2fa">Ativar agora</Link>
            )}
          </p>
          <p>
            Conta criada em:{" "}
            {new Date(user?.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
          <Link to="/setup-2fa">
            <button>Configurar 2FA</button>
          </Link>
          <Link to="/my-data">
            <button>Meus Dados (LGPD)</button>
          </Link>
        </div>
      </div>
    </>
  );
}
