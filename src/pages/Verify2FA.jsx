import { useState } from 'react'
import * as OTPAuth from 'otpauth'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Verify2FA() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  const navigate = useNavigate()

  async function verifyCode() {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('totp_secret')
      .eq('id', user.id)
      .single()

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(profile.totp_secret)
    })

    const valid = totp.validate({ token: code, window: 1 }) !== null

    if (valid) {
      navigate('/dashboard')
    } else {
      setMsg('Código inválido ou expirado. Tente novamente.')
    }
  }

  return (
    <div>
      <h2>Verificação em 2 Etapas</h2>

      <p>Abra o Google Authenticator e digite o código:</p>

      <input
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <br /><br />

      <button onClick={verifyCode}>Verificar</button>

      <p>{msg}</p>
    </div>
  )
}