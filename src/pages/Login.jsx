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
    if (locked) {
      setMsg('Conta bloqueada. Aguarde 5 minutos.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

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
      setAttempts(0)

      const { data: { user } } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('totp_enabled')
        .eq('id', user.id)
        .single()

      if (profile?.totp_enabled) {
        navigate('/verify-2fa')
      } else {
        navigate('/setup-2fa')
      }
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