import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const navigate = useNavigate()

  async function handleUpdate() {
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMsg('Erro: ' + error.message)
    } else {
      setMsg('Senha atualizada com sucesso!')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div>
      <h2>Redefinir Senha</h2>

      <input
        type="password"
        placeholder="Nova senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleUpdate}>
        Salvar nova senha
      </button>

      <p>{msg}</p>
    </div>
  )
}
