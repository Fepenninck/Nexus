import { useState } from 'react'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { supabase } from '../supabaseClient'

export default function Setup2FA() {
  const [qrUrl, setQrUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')

  async function generateQR() {
    // Gera segredo aleatório
    const newSecret = authenticator.generateSecret()
    setSecret(newSecret)

    // Obtém usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Cria URL do Google Authenticator
    const otpUrl = authenticator.keyuri(
      user.email,
      'NexusAuth',
      newSecret
    )

    // Gera QR Code
    const qr = await QRCode.toDataURL(otpUrl)

    setQrUrl(qr)
  }

  async function confirmSetup() {
    // Verifica código digitado
    const valid = authenticator.verify({
      token: code,
      secret,
    })

    if (!valid) {
      setMsg('Código inválido. Tente novamente.')
      return
    }

    // Obtém usuário
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Salva no banco
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

      <button onClick={generateQR}>
        Gerar QR Code
      </button>

      <br />
      <br />

      {qrUrl && (
        <img
          src={qrUrl}
          alt="QR Code 2FA"
          width="200"
        />
      )}

      {qrUrl && (
        <>
          <p>
            Escaneie o QR Code no Google Authenticator
          </p>

          <input
            placeholder="Digite o código de 6 dígitos"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <br />
          <br />

          <button onClick={confirmSetup}>
            Confirmar
          </button>
        </>
      )}

      <p>{msg}</p>
    </div>
  )
}