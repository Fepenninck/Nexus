import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [msg, setMsg] = useState('')

  const navigate = useNavigate()

  async function handleLogin() {
    // Verifica se a conta está bloqueada
    if (locked) {
      setMsg('Conta bloqueada. Aguarde 5 minutos.')
      return
    }

    // Tenta fazer login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      // Bloqueia após 5 tentativas erradas
      if (newAttempts >= 5) {
        setLocked(true)

        setTimeout(() => {
          setLocked(false)
        }, 5 * 60 * 1000)

        setMsg('Muitas tentativas. Conta bloqueada por 5 minutos.')
      } else {
        setMsg(`Senha errada. Tentativa ${newAttempts} de 5.`)
      }
    } else {
      // Resetar tentativas
      setAttempts(0)

      // Redireciona para o 2FA
      navigate('/verify-2fa')
    }
  }

  return (
    <div>
      <h2>Login</h2>

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

      <button onClick={handleLogin} disabled={locked}>
        Entrar
      </button>

      <p>{msg}</p>
    </div>
  )
}