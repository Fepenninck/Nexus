import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";

const transactions = [
  { description: "Deposito recebido", date: "22/05/2026", value: "+ R$ 500,00" },
  { description: "Pagamento boleto", date: "21/05/2026", value: "- R$ 120,00" },
  { description: "Compra debito", date: "20/05/2026", value: "- R$ 49,90" },
];

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

export default function Bank() {
  const navigate = useNavigate();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: "", cpf: "" });
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setUser(user);
      setProfile(data);
      setForm({
        phone: data?.phone || user.user_metadata?.phone || "",
        cpf: data?.cpf || user.user_metadata?.cpf || "",
      });
    }

    loadUserData();
  }, []);

  const collectedData = {
    id: user?.id,
    email: user?.email,
    telefone: profile?.phone || user?.user_metadata?.phone || "",
    cpf: profile?.cpf || user?.user_metadata?.cpf || "",
    consentimento_lgpd: profile?.lgpd_consent ?? user?.user_metadata?.lgpd_consent,
    consentimento_lgpd_em:
      profile?.lgpd_consent_at || user?.user_metadata?.lgpd_consent_at || "",
    versao_termos_lgpd:
      profile?.lgpd_terms_version || user?.user_metadata?.lgpd_terms_version || "",
    conta_criada_em: user?.created_at,
    dois_fatores_ativo: profile?.totp_enabled || false,
  };

  async function handleUpdateData(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const cleanPhone = onlyDigits(form.phone);
    const cleanCpf = onlyDigits(form.cpf);

    if (cleanPhone.length < 10 || cleanCpf.length !== 11) {
      setMsg("Informe telefone com DDD e CPF com 11 digitos.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      phone: cleanPhone,
      cpf: cleanCpf,
    });

    const { error: userError } = await supabase.auth.updateUser({
      data: {
        phone: cleanPhone,
        cpf: cleanCpf,
      },
    });

    if (profileError || userError) {
      setMsg("Nao foi possivel atualizar os dados.");
      setLoading(false);
      return;
    }

    setProfile((current) => ({
      ...current,
      phone: cleanPhone,
      cpf: cleanCpf,
    }));
    setMsg("Dados atualizados com sucesso.");
    setLoading(false);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    if (passwordForm.password.length < 8) {
      setMsg("A nova senha precisa ter no minimo 8 caracteres.");
      setLoading(false);
      return;
    }

    if (passwordForm.password !== passwordForm.confirm) {
      setMsg("As senhas nao conferem.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.password,
    });

    if (error) {
      setMsg("Nao foi possivel trocar a senha.");
      setLoading(false);
      return;
    }

    setPasswordForm({ password: "", confirm: "" });
    setMsg("Senha atualizada com sucesso.");
    setLoading(false);
  }

  function handleExportData() {
    const file = new Blob([JSON.stringify(collectedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "meus-dados-nexus.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteData() {
    if (!confirm("Tem certeza que deseja excluir sua conta e dados coletados?")) {
      return;
    }

    setLoading(true);
    setMsg("");

    const { error } = await supabase.rpc("delete_current_user_data");

    if (error) {
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        setMsg("Nao foi possivel excluir os dados agora.");
        setLoading(false);
        return;
      }
    }

    sessionStorage.removeItem("nexus_2fa_verified");
    await supabase.auth.signOut();
    setLoading(false);
    navigate("/login");
  }

  return (
    <>
      <Navbar />
      <main className="bank-page">
        <BackButton fallback="/dashboard" />

        <section className="bank-summary">
          <div>
            <h1>Nexus Bank</h1>
            <p>Conta digital para demonstracao do sistema autenticado.</p>
          </div>
          <div className="bank-account">
            <span>Agencia 0001</span>
            <span>Conta 12345-6</span>
          </div>
        </section>

        <section className="bank-balance">
          <p>Saldo disponivel</p>
          <strong>{balanceVisible ? "R$ 3.250,80" : "R$ ******"}</strong>
          <button type="button" onClick={() => setBalanceVisible((show) => !show)}>
            {balanceVisible ? "Ocultar saldo" : "Mostrar saldo"}
          </button>
        </section>

        <section className="bank-actions" aria-label="Acoes bancarias">
          <button type="button">Pix</button>
          <button type="button">Transferir</button>
          <button type="button">Pagar boleto</button>
          <button type="button">Extrato</button>
        </section>

        <section className="bank-statement">
          <h2>Ultimas movimentacoes</h2>
          <ul>
            {transactions.map((transaction) => (
              <li key={`${transaction.description}-${transaction.date}`}>
                <div>
                  <strong>{transaction.description}</strong>
                  <span>{transaction.date}</span>
                </div>
                <span>{transaction.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="privacy-panel">
          <h2>Privacidade, LGPD e seguranca</h2>
          <p>
            Aqui voce pode consultar, exportar, corrigir ou excluir os dados
            coletados pela conta.
          </p>

          <div className="privacy-grid">
            <div className="privacy-box">
              <h3>Dados coletados</h3>
              <dl>
                <dt>Email</dt>
                <dd>{collectedData.email || "Carregando..."}</dd>
                <dt>Telefone</dt>
                <dd>{collectedData.telefone || "Nao informado"}</dd>
                <dt>CPF</dt>
                <dd>{collectedData.cpf || "Nao informado"}</dd>
                <dt>Consentimento LGPD</dt>
                <dd>{collectedData.consentimento_lgpd ? "Aceito" : "Nao informado"}</dd>
                <dt>2FA</dt>
                <dd>{collectedData.dois_fatores_ativo ? "Ativo" : "Nao ativo"}</dd>
              </dl>
              <button type="button" onClick={handleExportData} disabled={!user}>
                Exportar meus dados
              </button>
            </div>

            <form className="privacy-box" onSubmit={handleUpdateData}>
              <h3>Atualizar informacoes</h3>
              <input
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm((current) => ({
                  ...current,
                  phone: e.target.value,
                }))}
              />
              <input
                placeholder="CPF"
                value={form.cpf}
                onChange={(e) => setForm((current) => ({
                  ...current,
                  cpf: e.target.value,
                }))}
              />
              <button type="submit" disabled={loading || !user}>
                Salvar dados
              </button>
            </form>

            <form className="privacy-box" onSubmit={handleChangePassword}>
              <h3>Trocar senha</h3>
              <input
                type="password"
                placeholder="Nova senha"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((current) => ({
                  ...current,
                  password: e.target.value,
                }))}
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((current) => ({
                  ...current,
                  confirm: e.target.value,
                }))}
              />
              <button type="submit" disabled={loading || !user}>
                Atualizar senha
              </button>
            </form>

            <div className="privacy-box">
              <h3>Excluir dados</h3>
              <p>
                Remove os dados coletados e encerra a sessao. Em producao, a
                exclusao da conta deve usar a funcao segura do Supabase.
              </p>
              <button type="button" onClick={handleDeleteData} disabled={loading || !user}>
                Excluir meus dados
              </button>
            </div>
          </div>

          {msg && <p className="bank-message">{msg}</p>}
        </section>
      </main>
    </>
  );
}
