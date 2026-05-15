import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Senhas não coincidem");
      return;
    }
    if (form.password.length < 8) {
      setError("Mínimo 8 caracteres");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({
      password: form.password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  if (success)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Senha redefinida!</h2>
        <p>Redirecionando para o login...</p>
      </div>
    );

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 16px" }}>
      <h2>Nova senha</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova senha"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="Confirmar senha"
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Redefinir senha"}
        </button>
      </form>
    </div>
  );
}
