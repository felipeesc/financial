# Controle de Gastos

Sistema pessoal de controle financeiro com backend em Spring Boot e frontend em React + Vite. Funciona como PWA instalável no iPhone e Android.

## Funcionalidades

- **Dashboard** — KPIs mensais (gastos, custos fixos, total comprometido) e gráfico de pizza por categoria
- **Gastos** — CRUD de despesas mensais com categoria, forma de pagamento e filtro por mês
- **Custos Fixos** — despesas recorrentes com controle de ativo/inativo e edição
- **Categorias** — gerenciamento com paleta de cores personalizada e 15 categorias padrão pré-criadas
- **Empréstimos** — controle de empréstimos com split de juros (sua parte + indicação), registro mensal de pagamentos e histórico

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Spring Boot 3.3.5, Java 21 |
| Segurança | Spring Security 6, JWT (jjwt 0.12.3) |
| Banco | PostgreSQL 16, Flyway (9 migrations) |
| Frontend | React 18, Vite 5, Recharts |
| Mobile | PWA (vite-plugin-pwa) — instalável via Safari/Chrome |
| Deploy | Railway (backend + DB), Vercel (frontend) |

## Estrutura

```
financial/
├── src/main/java/com/financ/financial/
│   ├── auth/          # JWT, SecurityConfig, login/register
│   ├── category/      # CRUD de categorias
│   ├── expense/       # CRUD de gastos + resumo mensal
│   ├── fixedcost/     # Custos fixos recorrentes
│   ├── loan/          # Empréstimos e pagamentos de juros
│   ├── paymentmethod/ # Formas de pagamento
│   ├── user/          # Entidade usuário
│   └── exception/     # GlobalExceptionHandler
├── src/main/resources/
│   ├── application.properties
│   └── db/migration/  # V1 a V9
├── frontend/
│   ├── src/
│   │   ├── api/       # axios + chamadas por domínio
│   │   ├── components/# Navbar
│   │   ├── context/   # AuthContext (JWT no localStorage)
│   │   ├── hooks/     # useIsMobile
│   │   └── pages/     # Dashboard, Expenses, FixedCosts, Categories, Loans, LoanDetail
│   └── vite.config.js # proxy /api → localhost:8080 + PWA
└── Dockerfile         # multi-stage build (Maven + JRE 21)
```

## Rodar localmente

### Pré-requisitos

- Java 21
- Docker (para o PostgreSQL)
- Node.js 18+

### Banco de dados

```bash
docker run -d \
  --name financial-db \
  -e POSTGRES_DB=financial \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

### Backend

```bash
JWT_SECRET=sua-chave-secreta-com-32-caracteres-minimo \
DATABASE_URL=jdbc:postgresql://localhost:5432/financial \
DATABASE_USERNAME=postgres \
DATABASE_PASSWORD=postgres \
./mvnw spring-boot:run
```

As migrations do Flyway rodam automaticamente na inicialização.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse em `http://localhost:5173`. O Vite faz proxy de `/api` para `localhost:8080`.

### Criar usuário

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"seu_usuario","password":"sua_senha"}'
```

O registro cria automaticamente 15 categorias padrão (Alimentação, Transporte, Saúde, etc.).

## Variáveis de ambiente

### Backend

| Variável | Obrigatório | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Mínimo 32 caracteres |
| `DATABASE_URL` | Sim | JDBC URL do PostgreSQL |
| `DATABASE_USERNAME` | Sim | Usuário do banco |
| `DATABASE_PASSWORD` | Sim | Senha do banco |
| `CORS_ALLOWED_ORIGINS` | Não | Default: `http://localhost:5173,http://localhost:3000` |
| `PORT` | Não | Default: `8080` |

### Frontend

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API. Vazio em dev (usa proxy Vite). Em produção: URL do Railway |

## Deploy

### Railway (backend)

1. Conectar repositório no [railway.app](https://railway.app)
2. Railway detecta o `Dockerfile` automaticamente
3. Adicionar serviço PostgreSQL e linkar as variáveis
4. Configurar as variáveis de ambiente listadas acima

### Vercel (frontend)

1. Importar repositório no [vercel.com](https://vercel.com)
2. Definir **Root Directory** como `frontend`
3. Adicionar variável `VITE_API_URL` com a URL do Railway
4. Após deploy, atualizar `CORS_ALLOWED_ORIGINS` no Railway com a URL do Vercel

## Instalar como app no iPhone

1. Abrir a URL do Vercel no **Safari**
2. Tocar em **Compartilhar** → **Adicionar à Tela de Início**
3. O app abre em tela cheia sem barra do browser (modo standalone)

## API — principais endpoints

```
POST /api/auth/register       Criar usuário
POST /api/auth/login          Login → retorna JWT

GET  /api/expenses?month=     Gastos do mês (YYYY-MM)
POST /api/expenses            Criar gasto
PUT  /api/expenses/:id        Editar gasto
DEL  /api/expenses/:id        Excluir gasto
GET  /api/expenses/summary    Resumo por categoria

GET  /api/fixed-costs         Listar custos fixos
POST /api/fixed-costs         Criar custo fixo
PUT  /api/fixed-costs/:id     Editar / ativar / desativar
DEL  /api/fixed-costs/:id     Excluir

GET  /api/categories          Listar categorias
POST /api/categories          Criar categoria
PUT  /api/categories/:id      Editar categoria
DEL  /api/categories/:id      Excluir categoria

GET  /api/loans               Listar empréstimos com totais
POST /api/loans               Criar empréstimo
PATCH /api/loans/:id/pay      Marcar como quitado
DEL  /api/loans/:id           Excluir empréstimo
POST /api/loans/:id/payments  Registrar pagamento de juros
DEL  /api/loans/:id/payments/:pid  Remover pagamento
```

Todos os endpoints (exceto `/api/auth/*`) exigem header `Authorization: Bearer <token>`. Cada usuário acessa apenas seus próprios dados.

## Regras de negócio — Empréstimos

- O devedor paga **somente os juros** mensalmente até devolver o principal
- A taxa é dividida entre **sua parte** e a **parte do indicador** (ex: 15% total = 10% seu + 5% indicação)
- Ao registrar um pagamento, o sistema calcula automaticamente o split proporcional
- `userRate + referrerRate` deve ser igual a `interestRate`
- Ao quitar, marcar como **Pago** — o histórico de pagamentos é preservado
