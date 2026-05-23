import { useState } from 'react'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'

export default function Setup2FA() {
  const [qrUrl, setQrUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function generateQR() {
    const newSecret = new OTPAuth.Secret().base32
    setSecret(newSecret)
    setMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    const totp = new OTPAuth.TOTP({
      issuer: 'NexusBank',
      label: user.email,
      secret: OTPAuth.Secret.fromBase32(newSecret),
    })

    const otpUrl = totp.toString()
    const qr = await QRCode.toDataURL(otpUrl)
    setQrUrl(qr)
  }

  async function confirmSetup() {
    if (!secret) {
      setMsg('Gere o QR Code antes de confirmar.')
      return
    }

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
    })

    const valid = totp.validate({ token: code, window: 1 }) !== null

    if (!valid) {
      setMsg('Codigo invalido. Tente novamente.')
      return
    }

    setLoading(true)
    setMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        totp_secret: secret,
        totp_enabled: true,
      },
    })

    if (metadataError) {
      setMsg('Nao foi possivel salvar o 2FA. Tente novamente.')
      setLoading(false)
      return
    }

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      totp_secret: secret,
      totp_enabled: true,
    })

    sessionStorage.setItem('nexus_2fa_verified', 'true')
    setMsg('2FA ativado com sucesso!')
    setLoading(false)
    setTimeout(() => navigate('/bank'), 1200)
  }

  return (
    <div>
      <BackButton fallback="/dashboard" />
      <h2>Configurar Autenticacao de 2 Fatores</h2>

      <button onClick={generateQR}>Gerar QR Code</button>

      <br /><br />

      {qrUrl && (
        <img src={qrUrl} alt="QR Code 2FA" width="200" />
      )}

      {qrUrl && (
        <>
          <p>Escaneie o QR Code no Google Authenticator</p>
          <input
            placeholder="Digite o codigo de 6 digitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <br /><br />
          <button onClick={confirmSetup} disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </>
      )}

      <p>{msg}</p>
    </div>
  )
}
