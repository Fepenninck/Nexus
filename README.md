# Nexus

> Sistema de autenticação segura com MFA, conformidade com a LGPD e logs de auditoria.

![Banner](https://raw.githubusercontent.com/Fepenninck/Nexus/066d0c8af321819d708528c55fabcc2cf53c8b3c/assets/1.png)

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/licença-MIT-blue)
![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)
![Docker](https://img.shields.io/badge/Docker-containerizado-2496ed?logo=docker)

---

## Sobre o projeto

O **Nexus** é um sistema de autenticação segura desenvolvido em React + Supabase como projeto integrador da disciplina de Políticas de Segurança da Informação. O sistema implementa autenticação multifatorial (MFA), proteção de credenciais com hashing seguro, conformidade com a LGPD e logs de auditoria imutáveis.

---

## Funcionalidades

- Login e cadastro de usuários
- Autenticação em dois fatores **(2FA/TOTP)**
- QR Code para Google Authenticator
- Recuperação segura de senha com token de uso único
- Proteção contra força bruta (bloqueio após 5 tentativas)
- Sessões com tempo de expiração e invalidação no logout
- Proteção com **JWT**
- Criptografia e segurança de dados
- Controle de acesso com **RLS** (Row Level Security)
- Rotas protegidas no frontend (PrivateRoute)
- Conformidade com a **LGPD**: consulta, exportação e exclusão de dados pessoais
- Logs de auditoria imutáveis

---

## Arquitetura

![Arquitetura](https://raw.githubusercontent.com/Fepenninck/Nexus/066d0c8af321819d708528c55fabcc2cf53c8b3c/assets/2.png)

O sistema é dividido em duas camadas principais:

```
Frontend (React + Vite)
        ↓ HTTP
Backend (FastAPI + Python)
        ↓ HTTP
Supabase (PostgreSQL)
```

O backend segue a arquitetura em camadas:

```
app/
├── routes/         # Recebe requisições HTTP
├── services/       # Lógica de negócio
├── repositories/   # Comunicação com o banco
└── models/         # Estrutura dos dados (Pydantic)
```

---

## Autenticação Multifatorial (2FA)

![2FA](https://raw.githubusercontent.com/Fepenninck/Nexus/066d0c8af321819d708528c55fabcc2cf53c8b3c/assets/3.png)

O sistema implementa autenticação em dois fatores via protocolo **TOTP (Time-based One-Time Password)**:

1. Usuário faz login com e-mail e senha
2. Sistema valida as credenciais com hash **Argon2**
3. Usuário insere o código de 6 dígitos do app autenticador
4. Sistema valida o código e libera o acesso com token **JWT**

---

## Conformidade com a LGPD

![LGPD](https://raw.githubusercontent.com/Fepenninck/Nexus/066d0c8af321819d708528c55fabcc2cf53c8b3c/assets/4.png)

O sistema foi desenvolvido em conformidade com a Lei Geral de Proteção de Dados:

- Consentimento explícito no cadastro
- Painel de consulta aos dados pessoais
- Exportação dos dados em formato JSON
- Exclusão completa da conta e dados associados
- Minimização de dados coletados

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite + Framer Motion |
| Backend | Python 3.13 + FastAPI |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth + TOTP (2FA) |
| Containerização | Docker + Docker Compose |
| Roteamento | React Router DOM |
| QR Code | qrcode.react |

---

## Como rodar o projeto

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 20+](https://nodejs.org)
- [Python 3.13](https://www.python.org)
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/Fepenninck/Nexus.git
cd Nexus
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_KEY=sua_chave_service_aqui
```

### 3. Instale as dependências e rode

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```

---

## Estrutura de branches

| Branch | Responsável | Descrição |
|--------|-------------|-----------|
| `main` | — | Versão estável aprovada |
| `Thiago` | Thiago | Frontend, rotas e UX |
| `João` | João Vinicius | Backend e autenticação |
| `Kaua` | Kauã Richard | Recuperação de senha e LGPD |
| `Caio` | Caio Miranda | Criptografia e infraestrutura |
| `Luis` | Luís Felipe | Documentação e testes |

---

## Requisitos de segurança implementados

| # | Requisito | Status |
|---|-----------|--------|
| 1 | Autenticação e Gestão de Credenciais | 🔄 Em andamento |
| 2 | Recuperação de Senha | 🔄 Em andamento |
| 3 | Criptografia e Comunicação Segura | 🔄 Em andamento |
| 4 | Conformidade com a LGPD | 🔄 Em andamento |
| 5 | Auditoria e Logs | 🔄 Em andamento |
| 6 | Documentação Técnico-Científica | 🔄 Em andamento |
| 7 | Resumo Científico | 🔄 Em andamento |
| 8 | Pôster Científico e Apresentação | 🔄 Em andamento |

---

## Equipe

| Nome | Responsabilidade |
|------|-----------------|
| Luís Felipe | Autenticação, login/cadastro, 2FA, Google Authenticator, QR Code, controle de tentativas |
| Thiago | Frontend, rotas, interface e UX |
| Kauã Richard | Recuperação de senha e LGPD |
| Caio Miranda | Criptografia e infraestrutura |
| João Vinicius | Backend e integração |

---

## Instituição

Projeto Integrador — Políticas de Segurança da Informação · 2025
