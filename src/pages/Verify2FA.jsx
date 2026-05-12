import { useState } from 'react'
import { authenticator } from 'otplib'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Verify2FA() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  const navigate = useNavigate()

  async function verifyCode() {
    // Obtém usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Busca segredo salvo no banco
    const { data: profile } = await supabase
      .from('profiles')
      .select('totp_secret')
      .eq('id', user.id)
      .single()

    // Verifica código
    const valid = authenticator.verify({
      token: code,
      secret: profile.totp_secret,
    })

    if (valid) {
      // Login completo
      navigate('/dashboard')
    } else {
      setMsg('Código inválido ou expirado. Tente novamente.')
    }
  }

  return (
    <div>
      <h2>Verificação em 2 Etapas</h2>

      <p>
        Abra o Google Authenticator e digite o código:
      </p>

      <input
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br />
      <br />

      <button onClick={verifyCode}>
        Verificar
      </button>

      <p>{msg}</p>
    </div>
  )
}