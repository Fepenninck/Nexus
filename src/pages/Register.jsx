import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Register() {
  // Estados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleRegister() {
    // Verifica consentimento LGPD
    if (!consent) {
      setMsg('Você precisa aceitar a Política de Privacidade!')
      return
    }

    // Cadastro no Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMsg('Erro: ' + error.message)
    } else {
      setMsg('Cadastro feito! Verifique seu email.')
    }
  }

  return (
    <div>
      <h2>Cadastro</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <label>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        {' '}Aceito a Política de Privacidade (LGPD)
      </label>

      <br />
      <br />

      <button onClick={handleRegister}>
        Cadastrar
      </button>

      <p>{msg}</p>
    </div>
  )
}