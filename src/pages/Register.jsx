import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { supabase } from '../supabaseClient'

const LGPD_VERSION = '2026-05-22'

function onlyDigits(value) {
  return value.replace(/\D/g, '')
}

function formatCpf(value) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [showLgpd, setShowLgpd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const passwordRules = useMemo(() => validatePassword(password), [password])
  const passwordIsValid = Object.values(passwordRules).every(Boolean)

  async function handleRegister() {
    const cleanPhone = onlyDigits(phone)
    const cleanCpf = onlyDigits(cpf)

    if (!email || !cleanPhone || !cleanCpf || !password || !confirmPassword) {
      setMsg('Preencha todos os campos para continuar.')
      return
    }

    if (cleanPhone.length < 10) {
      setMsg('Informe um telefone valido com DDD.')
      return
    }

    if (cleanCpf.length !== 11) {
      setMsg('Informe um CPF valido com 11 digitos.')
      return
    }

    if (!passwordIsValid) {
      setMsg('A senha precisa cumprir todos os requisitos de seguranca.')
      return
    }

    if (password !== confirmPassword) {
      setMsg('As senhas nao conferem.')
      return
    }

    if (!consent) {
      setMsg('Voce precisa ler e aceitar a Politica de Privacidade (LGPD).')
      return
    }

    const consentAt = new Date().toISOString()

    setLoading(true)
    setMsg('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: cleanPhone,
          cpf: cleanCpf,
          lgpd_consent: true,
          lgpd_consent_at: consentAt,
          lgpd_terms_version: LGPD_VERSION,
        },
      },
    })

    if (error) {
      setMsg('Erro: ' + error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        phone: cleanPhone,
        cpf: cleanCpf,
        lgpd_consent: true,
        lgpd_consent_at: consentAt,
        lgpd_terms_version: LGPD_VERSION,
      })
    }

    setMsg('Cadastro feito! Redirecionando para o login.')
    setLoading(false)
    setTimeout(() => navigate('/login'), 900)
  }

  function acceptLgpd() {
    setConsent(true)
    setShowLgpd(false)
  }

  function renderRule(valid, text) {
    return (
      <li className={valid ? 'rule-ok' : ''}>
        {valid ? 'OK' : '--'} {text}
      </li>
    )
  }

  return (
    <div className="register-page">
      <BackButton fallback="/login" />
      <h2>Cadastro</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="tel"
        placeholder="Telefone"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
      />

      <input
        inputMode="numeric"
        placeholder="CPF"
        value={cpf}
        onChange={(e) => setCpf(formatCpf(e.target.value))}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <ul className="password-rules" aria-label="Requisitos da senha">
        {renderRule(passwordRules.minLength, 'Minimo de 8 caracteres')}
        {renderRule(passwordRules.uppercase, 'Uma letra maiuscula')}
        {renderRule(passwordRules.number, 'Um numero')}
        {renderRule(passwordRules.special, 'Um caractere especial')}
      </ul>

      <input
        type="password"
        placeholder="Confirmar senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <label className="lgpd-check">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            if (e.target.checked) {
              setShowLgpd(true)
            } else {
              setConsent(false)
            }
          }}
        />
        <span className="lgpd-policy-link">Aceito a Politica de Privacidade (LGPD)</span>
      </label>

      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>

      <p>{msg}</p>

      {showLgpd && (
        <div className="lgpd-modal" role="dialog" aria-modal="true">
          <div className="lgpd-modal-content">
            <h2>Privacidade e LGPD</h2>
            <p>
              Para criar sua conta, coletamos apenas os dados necessarios para
              autenticar, proteger e manter seu acesso ao Nexus.
            </p>

            <div className="lgpd-section">
              <h3>Dados coletados</h3>
              <ul>
                <li>Email: usado para login, recuperacao e avisos de conta.</li>
                <li>Telefone: usado para contato e verificacoes de seguranca.</li>
                <li>CPF: usado para identificacao unica do usuario.</li>
                <li>Senha: armazenada de forma protegida pelo Supabase Auth.</li>
                <li>Consentimento LGPD: data, hora e versao aceita.</li>
              </ul>
            </div>

            <div className="lgpd-section">
              <h3>Conformidade</h3>
              <p>
                O tratamento segue a Lei Geral de Protecao de Dados, Lei
                13.709/2018. Voce pode acessar, corrigir ou solicitar exclusao
                dos seus dados na area Meus Dados.
              </p>
            </div>

            <div className="lgpd-actions">
              <button type="button" onClick={() => setShowLgpd(false)}>
                Voltar
              </button>
              <button type="button" onClick={acceptLgpd}>
                Li e aceito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
