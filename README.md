# FisioGestão SaaS — Sistema Completo de Gestão para Consultório de Fisioterapia

Sistema SaaS profissional desenvolvido com **React 19 / Vite**, **Tailwind CSS**, **PHP 8.2+ REST API** e **Upstash Redis**, inspirado nos layouts comerciais mais modernos de clínicas de fisioterapia e reabilitação.

---

## 🌟 Ambientes Integrados

1. **Landing Page Institucional & Comercial (`/`)**
   - Header profissional com acessos diretos à Área do Paciente e Portal de Gestão.
   - Hero com imagem em alta resolução e CTA para **Agendamento de Avaliação**.
   - Barra de unidades de atendimento (Jardins, Itaim Bibi, Moema).
   - Apresentação completa da clínica e diferenciais (atendimento 100% individual 1:1, avaliação biomecânica 3D).
   - Especialidades clínicas gerenciáveis via CMS.
   - Apresentação do corpo clínico com registro ativo no CREFITO.
   - Seção de depoimentos reais de pacientes.
   - Modal interativo de solicitação de avaliação física que gera leads no sistema em tempo real.

2. **Portal de Gestão da Clínica (`/login/gestao` & `/gestao/dashboard`)**
   - Autenticação com perfis: **Administrador**, **Fisioterapeuta** e **Recepcionista**.
   - **Dashboard SaaS completo** com KPIs dinâmicos, gráficos Recharts (faturamento x despesas, distribuição de tratamentos), agenda do dia com ações de check-in em 1 clique e status do corpo clínico.
   - **Agenda Clínica Interativa**: visualizações por Dia, Semana e Mês, filtro por fisioterapeuta e **prevenção algorítmica de conflitos de horários** (impede sobreposição de atendimentos).
   - **Módulo de Pacientes**: CRUD completo, busca instantânea, filtros e prontuário com abas (Dados pessoais, Prontuário, Evoluções, Tratamentos, Financeiro).
   - **Prontuário Fisioterapêutico Eletrônico**: Anamnese, queixa principal, avaliação postural e funcional, escala EVA (0 a 10), diagnóstico fisioterapêutico, metas e plano de tratamento.
   - **Evoluções Clínicas por Sessão**: Registro imutável de procedimentos, condutas, dor pré e pós-sessão e orientações domiciliares (sem sobrescrita silenciosa).
   - **Tratamentos & Controle Atômico de Sessões**: Contratos de sessões (ex: 10 contratadas, 6 realizadas, 4 restantes), com baixa controlada de sessão e celebração com confetes ao atingir 100%.
   - **Gestão Financeira**: Contas a receber, contas a pagar, controle de pacotes e parcelas, emissão e impressão de recibos com número sequencial e controle de inadimplência.
   - **Solicitações Web da Landing Page**: Painel dedicado para receber os pedidos de avaliação do site e botão em 1 clique para **"Transformar em Agendamento Efetivo"**, criando automaticamente o cadastro do paciente e inserindo-o na agenda oficial.
   - **Relatórios Gerenciais**: Filtros por data e profissional, produtividade, faltas, cancelamentos e **exportação em CSV nativo (UTF-8 com BOM para Excel)**.
   - **Configurações & CMS**: Painel administrativo para alterar textos da Landing Page, telefones, horários e endereço sem mexer no código.

3. **Portal Exclusivo do Paciente (`/login/paciente` & `/paciente/dashboard`)**
   - Autenticação por **CPF** ou **E-mail** + Senha.
   - Visualização da próxima consulta agendada com sala e fisioterapeuta.
   - Acompanhamento do plano de tratamento ativo e metas compartilhadas.
   - **Gráfico de Evolução da Dor**: Demonstra visualmente a queda na escala EVA ao longo das sessões.
   - **Minha Agenda**: Consultas futuras e histórico com solicitação de reagendamento/cancelamento justificado para a recepção.
   - **Histórico Clínico**: Consulta às orientações e condutas liberadas pelo fisioterapeuta (modo leitura seguro).
   - **Extrato Financeiro & Recibos**: Visualização e impressão de recibos dos pacotes e sessões pagas.
   - **Meu Perfil**: Atualização de telefones, contato de emergência e alteração de senha.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- PHP 8.2+ (instalado no XAMPP em `C:\xampp\php\php.exe` ou no PATH)
- Node.js 18+ e npm

### 1. Iniciar o Backend PHP REST API
No terminal do projeto:
```powershell
# Executar servidor embutido do PHP na porta 8000
& "C:\xampp\php\php.exe" -S localhost:8000 -t backend/public
```
*O banco de dados é populado automaticamente com registros de demonstração na primeira requisição.*

### 2. Iniciar o Frontend React (Vite)
Em outro terminal:
```bash
npm run dev
```
Abra no navegador: **http://localhost:5173**

---

## 🔑 Credenciais de Acesso (Demonstração)

### Portal de Gestão (`/login/gestao`)
| Perfil | E-mail | Senha |
|---|---|---|
| **Administrador** | `admin@fisiogestao.com.br` | `admin123` |
| **Fisioterapeuta** | `dra.camila@fisiogestao.com.br` | `fisio123` |
| **Recepção** | `recepcao@fisiogestao.com.br` | `recepcao123` |

### Portal do Paciente (`/login/paciente`)
| Paciente | CPF / Identificador | Senha |
|---|---|---|
| **João Carlos da Silva** | `123.456.789-00` | `paciente123` |
| **Mariana Costa** | `234.567.890-11` | `paciente123` |

*(As telas de login contêm botões de preenchimento rápido em 1 clique para agilizar a navegação)*

---

## 🗄️ Integração com Upstash Redis

O sistema foi concebido para utilizar o **Upstash Redis REST API**.
Para ativar a persistência em nuvem:
1. Crie um banco Redis no [Upstash Console](https://console.upstash.com).
2. Obtenha a `UPSTASH_REDIS_REST_URL` e o `UPSTASH_REDIS_REST_TOKEN`.
3. Adicione ao arquivo `backend/.env`:
```env
UPSTASH_REDIS_REST_URL="https://your-upstash-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-secret-token"
```
*Caso não configure as credenciais, o sistema utiliza automaticamente o mecanismo estruturado com bloqueio atômico em `backend/storage/redis_data.json`, permitindo uso imediato offline.*

---

## 🌐 Deploy em Produção

### Frontend (Vercel)
1. Conecte o repositório na [Vercel](https://vercel.com).
2. Configure a variável de ambiente:
   - `VITE_API_URL`: URL onde a API PHP está hospedada (ex: `https://api.suaclinica.com.br`).
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (PHP 8.2+)
1. Faça o deploy da pasta `backend/` para qualquer servidor compatível com PHP 8.2+ (Apache, Nginx, Docker, Railway, Render ou cPanel).
2. Aponte o DocumentRoot para `backend/public`.
3. Configure as variáveis de ambiente no servidor (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `JWT_SECRET`, `FRONTEND_URL`).

