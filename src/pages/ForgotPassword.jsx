import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  if (sent)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>E-mail enviado!</h2>
        <p>Verifique sua caixa de entrada para redefinir a senha.</p>
        <Link to="/login">Voltar ao login</Link>
      </div>
    );

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 16px" }}>
      <h2>Recuperar senha</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 12 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link"}
        </button>
      </form>
      <p>
        <Link to="/login">← Voltar ao login</Link>
      </p>
    </div>
  );
}
