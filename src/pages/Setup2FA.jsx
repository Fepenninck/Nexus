import { useState } from 'react'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'
import { supabase } from '../supabaseClient'

export default function Setup2FA() {
  const [qrUrl, setQrUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  async function generateQR() {
    const newSecret = OTPAuth.Secret.fromRandom().base32
    setSecret(newSecret)

    const { data: { user } } = await supabase.auth.getUser()

    const totp = new OTPAuth.TOTP({
      issuer: 'NexusBank',
      label: user.email,
      secret: OTPAuth.Secret.fromBase32(newSecret)
    })

    const otpUrl = totp.toString()
    const qr = await QRCode.toDataURL(otpUrl)
    setQrUrl(qr)
  }

  async function confirmSetup() {
    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret)
    })

    const valid = totp.validate({ token: code, window: 1 }) !== null

    if (!valid) {
      setMsg('Código inválido. Tente novamente.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('profiles').upsert({
      id: user.id,
      totp_secret: secret,
      totp_enabled: true,
    })

    setMsg('2FA ativado com sucesso!')
  }

  return (
    <div>
      <h2>Configurar Autenticação de 2 Fatores</h2>

      <button onClick={generateQR}>Gerar QR Code</button>

      <br /><br />

      {qrUrl && (
        <img src={qrUrl} alt="QR Code 2FA" width="200" />
      )}

      {qrUrl && (
        <>
          <p>Escaneie o QR Code no Google Authenticator</p>
          <input
            placeholder="Digite o código de 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <br /><br />
          <button onClick={confirmSetup}>Confirmar</button>
        </>
      )}

      <p>{msg}</p>
    </div>
  )
}