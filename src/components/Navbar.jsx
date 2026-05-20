import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 24px",
        background: "#1a2a4a",
        color: "white",
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>NexusAuth</span>
      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <Link to="/dashboard" style={{ color: "white" }}>
          Dashboard
        </Link>
        <Link to="/setup-2fa" style={{ color: "white" }}>
          Configurar 2FA
        </Link>
        <Link to="/my-data" style={{ color: "white" }}>
          Meus Dados
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "6px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
