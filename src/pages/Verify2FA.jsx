import { useState } from 'react'
import * as OTPAuth from 'otpauth'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'

export default function Verify2FA() {
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  const navigate = useNavigate()

  async function verifyCode() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const totpEnabled = profile?.totp_enabled || user.user_metadata?.totp_enabled
    const totpSecret = profile?.totp_secret || user.user_metadata?.totp_secret

    if (!totpEnabled || !totpSecret) {
      setMsg('2FA nao encontrado. Redirecionando para configurar novamente.')
      setTimeout(() => navigate('/setup-2fa'), 1200)
      return
    }

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(totpSecret),
    })

    const valid = totp.validate({ token: code, window: 1 }) !== null

    if (valid) {
      sessionStorage.setItem('nexus_2fa_verified', 'true')
      navigate('/bank')
    } else {
      setMsg('Codigo invalido ou expirado. Tente novamente.')
    }
  }

  return (
    <div>
      <BackButton fallback="/login" />
      <h2>Verificacao em 2 Etapas</h2>

      <p>Abra o Google Authenticator e digite o codigo:</p>

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
