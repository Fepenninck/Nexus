import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  async function handleReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setMsg('Erro: ' + error.message)
    } else {
      setMsg('Email de recuperação enviado! Verifique sua caixa de entrada.')
    }
  }

  return (
    <div>
      <h2>Recuperar Senha</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleReset}>
        Enviar email de recuperação
      </button>

      <p>{msg}</p>

      <Link to="/login">Voltar ao Login</Link>
    </div>
  )
}
