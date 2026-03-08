# Mariposa

**Visual pipeline builder for [Chainlink CRE](https://github.com/smartcontractkit/cre-cli) (Chainlink Runtime Environment) workflows.**

Design workflows on a drag-and-drop canvas, configure nodes with guided forms, generate CRE SDK TypeScript code, simulate execution via the CRE CLI, and compile/deploy Solidity smart contracts — all from a single web interface.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Pipeline Node Types](#pipeline-node-types)
- [API Reference](#api-reference)
- [CRE Integration](#cre-integration)
- [Real-Time Communication](#real-time-communication)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Visual Pipeline Builder
- ReactFlow-powered drag-and-drop canvas with 22+ node types across 5 categories
- Guided configuration forms with 13+ field types (text, code, JSON, chain-select, Monaco editor, etc.)
- Edge conditions: immediate, delayed, event-based, and approval-based execution
- Input/Output data mapping between nodes with wildcard and field-level bindings

### AI Copilot
- Natural language workflow creation — describe what you want, get a full pipeline
- Generates nodes, edges, configurations, and input data mappings automatically
- Apply AI-generated actions to the canvas with one click

### CRE Code Generation
- Converts visual pipelines to production-ready CRE SDK TypeScript
- Topological sort for correct dependency ordering
- Auto-generates imports, config schemas, and workflow logic per node type

### Simulation
- Run CRE CLI simulations directly from the browser
- Real-time log streaming via Socket.io
- Per-project isolated workspace with auto-scaffolding

### Smart Contract Management
- Write Solidity in a Monaco editor with syntax highlighting
- Compile with solc (200-run optimization)
- Deploy to EVM testnets via viem — all from the UI

### Pipeline Execution
- BullMQ job queue with cron scheduling and delayed execution
- Multi-sig approval nodes with configurable wait periods
- Full execution history with per-node status tracking and audit logs

### Authentication
- Passwordless email login via OTP (6-digit codes, 10-minute TTL)
- JWT-based session management (7-day expiry)
- CRE CLI OAuth integration (standard flow + headless browser automation)

---

## Architecture

```
                    +-------------------+
                    |   Next.js 14      |
                    |   (Frontend)      |
                    |   Port 3000       |
                    +--------+----------+
                             |
                       Axios / Socket.io
                             |
                    +--------v----------+
                    |   Express.js      |
                    |   (Backend API)   |
                    |   Port 5000       |
                    +---+----------+----+
                        |          |
              +---------+          +---------+
              |                              |
     +--------v--------+          +----------v---------+
     |   MongoDB        |          |   Redis + BullMQ   |
     |   (Mongoose ODM) |          |   (Job Queue)      |
     +------------------+          +--------------------+
                                             |
                                   +---------v---------+
                                   |   CRE CLI / Bun   |
                                   |   (Simulation &   |
                                   |    Compilation)   |
                                   +-------------------+
```

For a detailed architecture guide, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, ReactFlow, Zustand, Socket.io-client, Monaco Editor |
| **Backend** | Express.js, TypeScript, Mongoose, Socket.io, BullMQ, Nodemailer, Puppeteer |
| **Database** | MongoDB (Mongoose ODM) |
| **Queue / Cache** | Redis (ioredis + BullMQ) |
| **Blockchain** | viem (EVM), solc (Solidity compiler), CRE CLI, Bun runtime |
| **Process Management** | PM2 |
| **Reverse Proxy** | Nginx |

---

## Prerequisites

- **Node.js** 20 LTS
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Redis** (for BullMQ job queue)
- **Bun** (for CRE workflow compilation) — [install](https://bun.sh)
- **CRE CLI** (`cre` binary) — [Chainlink CRE CLI](https://github.com/smartcontractkit/cre-cli)

Optional:
- PM2 (production process management)
- Nginx (reverse proxy / SSL termination)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/mariposa.git
cd mariposa
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables)).

Start the development server:

```bash
npm run dev
```

The backend runs at [http://localhost:5000](http://localhost:5000). Verify with:

```bash
curl http://localhost:5000/api/health
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create the environment file:

```bash
cp .env.local.example .env.local
```

Start the development server:

```bash
npm run dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000).

### 4. Verify the setup

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Register with your email (an OTP code is sent via SMTP or logged to console in dev)
3. Create a new pipeline from the dashboard
4. Drag nodes from the palette onto the canvas and connect them

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRE` | Token expiry duration | `7d` |
| `FRONTEND_URL` | Frontend URL (for CORS) | `http://localhost:3000` |
| `REDIS_HOST` | Redis host | `127.0.0.1` |
| `REDIS_PORT` | Redis port | `6379` |
| `EMAIL_HOST` | SMTP host | — |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | — |
| `EMAIL_PASS` | SMTP password | — |
| `EMAIL_SECURE` | Use TLS | `false` |
| `EMAIL_FROM` | Sender address | — |
| `CRE_PROJECTS_DIR` | CRE workspace root directory | `./cre-projects` |
| `BUN_PATH` | Path to Bun binary | `bun` |
| `CRE_CLI_PATH` | Path to CRE CLI binary | `cre` |
| `SOLC_VERSION` | Solidity compiler version | — |
| `DEFAULT_TESTNET_RPC` | Default RPC URL for deployments | — |

### Frontend (`.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `http://localhost:5000` |

---

## Project Structure

```
mariposa/
├── README.md
├── ARCHITECTURE.md              # Detailed architecture documentation
├── DEPLOYMENT.md                # Production deployment guide
├── ecosystem.config.js          # PM2 process configuration
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── cre-projects/            # Generated CRE workspaces (per-user, per-project)
│   └── src/
│       ├── server.ts            # Express entry point
│       ├── config/
│       │   └── database.ts      # MongoDB connection
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── creController.ts             # CRE project/workflow/contract management
│       │   ├── executionController.ts
│       │   ├── pipelineController.ts
│       │   ├── pipelineLifecycleController.ts
│       │   └── testExecutionController.ts
│       ├── handlers/            # Node execution handlers (per category)
│       │   ├── creCapability.handler.ts     # http-fetch, evm-read, evm-write, etc.
│       │   ├── creConfig.handler.ts         # chain-selector, rpc-endpoint, etc.
│       │   ├── creContract.handler.ts       # Solidity contract nodes
│       │   └── creLogic.handler.ts          # data-transform, condition, abi-*, consensus
│       ├── middleware/
│       │   ├── auth.ts          # JWT verification
│       │   ├── admin.ts         # Role-based access
│       │   └── errorHandler.ts
│       ├── models/              # Mongoose schemas (11 collections)
│       ├── queues/              # BullMQ queue configuration
│       ├── routes/              # Express route definitions
│       ├── services/
│       │   ├── copilot.prompt.ts            # AI Copilot system prompt & action schema
│       │   ├── creAuth.service.ts           # CRE CLI OAuth management
│       │   ├── creCodeGenerator.service.ts  # Pipeline → CRE SDK TypeScript
│       │   ├── creHeadlessBrowser.service.ts # Puppeteer OAuth automation
│       │   ├── creProjectManager.service.ts # Project filesystem lifecycle
│       │   ├── creSimulator.service.ts      # CRE CLI simulation runner
│       │   ├── creWorkflow.service.ts       # Code gen orchestration
│       │   ├── pipelineExecutor.ts          # Runtime pipeline execution
│       │   ├── scheduler.service.ts         # Cron trigger evaluation
│       │   ├── solidityCompiler.service.ts  # solc + viem deployment
│       │   └── websocket.service.ts         # Socket.io server
│       └── workers/
│           ├── executionWorker.ts
│           └── delayWorker.ts
│
└── frontend/
    ├── package.json
    ├── next.config.js
    └── src/
        ├── app/
        │   ├── page.tsx                     # Landing page
        │   ├── globals.css
        │   ├── login/page.tsx
        │   ├── dashboard/page.tsx
        │   └── pipelines/
        │       ├── page.tsx                 # Pipeline list
        │       └── [id]/page.tsx            # Visual pipeline builder
        ├── components/
        │   ├── PipelineBuilder/
        │   │   └── NodePaletteV2.tsx        # Draggable node palette
        │   ├── edges/
        │   │   └── ConditionalEdge.tsx
        │   ├── modals/
        │   │   ├── UniversalConfigModal.tsx  # Input / Config / Output tabs
        │   │   ├── EdgeConditionModal.tsx
        │   │   ├── DeploymentModal.tsx
        │   │   └── config-forms/
        │   │       ├── GenericConfigForm.tsx
        │   │       └── ConfigFieldRenderer.tsx
        │   ├── nodes/
        │   │   └── GenericNode.tsx           # Universal node renderer
        │   └── panels/
        │       ├── CopilotPanel.tsx          # AI Copilot chat interface
        │       ├── SimulationPanel.tsx       # Real-time simulation logs
        │       └── WorkflowCodePanel.tsx     # Generated code viewer (Monaco)
        ├── registry/                        # Component schema registry
        │   └── components/
        │       ├── cre-triggers.ts
        │       ├── cre-capabilities.ts
        │       ├── cre-logic.ts
        │       ├── solidity-contracts.ts
        │       └── chain-config.ts
        ├── store/                           # Zustand state management
        │   ├── authStore.ts
        │   ├── pipelineStore.ts
        │   └── creStore.ts
        ├── hooks/
        │   ├── usePipelineLifecycle.ts
        │   ├── useSimulationLogs.ts
        │   └── useTestExecution.ts
        └── types/
            └── index.ts
```

---

## Pipeline Node Types

### CRE Triggers

Start workflow execution based on schedules, webhooks, or on-chain events.

| Node | Description | Key Config |
|------|-------------|-----------|
| `cron-trigger` | Schedule-based execution | `cronExpression`, `timezone` |
| `http-trigger` | HTTP webhook endpoint | `path`, `method`, `authentication` |
| `evm-log-trigger` | EVM blockchain event listener | `contractAddress`, `eventSignature`, `chainSelector` |

### CRE Capabilities

SDK operations that interact with external systems.

| Node | Description | Key Config |
|------|-------------|-----------|
| `http-fetch` | HTTP/REST API requests | `url`, `method`, `headers`, `body` |
| `evm-read` | Read from smart contracts | `contractAddress`, `method`, `abi`, `chainSelector` |
| `evm-write` | Write to smart contracts | `contractAddress`, `method`, `abi`, `value` |
| `node-mode` | Custom Node.js compute | `code`, `dependencies` |
| `secrets-access` | Access encrypted secrets | `secretName`, `secretKey` |

### CRE Logic

Data processing and workflow control flow.

| Node | Description | Key Config |
|------|-------------|-----------|
| `consensus-aggregation` | Aggregate values (median/mean/mode) | `method`, `minResponses` |
| `data-transform` | Custom JavaScript expression (sandboxed VM) | `expression`, `outputSchema` |
| `condition` | Boolean branching (if/else) | `expression`, `trueLabel`, `falseLabel` |
| `abi-encode` | Encode values to ABI format | `types`, `values` |
| `abi-decode` | Decode ABI data | `types`, `data` |

### Solidity Contracts

On-chain consumer contracts for receiving CRE workflow output.

| Node | Description | Key Config |
|------|-------------|-----------|
| `ireceiver-contract` | IReceiver interface implementation | `soliditySource`, `contractName` |
| `price-feed-consumer` | Chainlink price feed consumer | `soliditySource`, `contractName` |
| `custom-data-consumer` | Custom data consumer contract | `soliditySource`, `contractName` |
| `proof-of-reserve` | Proof of Reserve consumer | `soliditySource`, `contractName` |
| `event-emitter` | Event emitting contract | `soliditySource`, `contractName` |

### Chain Config

Network and deployment configuration.

| Node | Description | Key Config |
|------|-------------|-----------|
| `chain-selector` | Select target blockchain | `chain` (Ethereum, Arbitrum, Base, Avalanche, Polygon, Optimism + testnets) |
| `contract-address` | Reference deployed contract | `address`, `abi` |
| `wallet-signer` | Wallet/key configuration | `privateKeyEnvVar` |
| `rpc-endpoint` | Custom RPC URL | `url`, `chainId` |

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Send OTP to email |
| `POST` | `/auth/verify` | Verify OTP, receive JWT |
| `GET` | `/auth/me` | Get current user (protected) |
| `POST` | `/auth/logout` | Logout (protected) |

### Pipelines (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/pipelines` | List user pipelines |
| `POST` | `/pipelines` | Create pipeline (auto-creates CRE project) |
| `GET` | `/pipelines/:id` | Get pipeline with nodes and edges |
| `PUT` | `/pipelines/:id` | Update pipeline |
| `DELETE` | `/pipelines/:id` | Delete pipeline (cascades to CRE project) |
| `POST` | `/pipelines/:id/duplicate` | Duplicate pipeline |
| `POST` | `/pipelines/:pipelineId/activate` | Activate trigger monitoring |
| `POST` | `/pipelines/:pipelineId/deactivate` | Deactivate triggers |
| `GET` | `/pipelines/:pipelineId/status` | Get activation status |

### Executions (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/executions/start` | Queue new pipeline execution |
| `GET` | `/executions/pipeline/:pipelineId` | List executions (paginated) |
| `GET` | `/executions/:executionId` | Get execution details |
| `DELETE` | `/executions/:executionId` | Cancel execution |
| `POST` | `/executions/:executionId/approve/:nodeId` | Approve pending node |
| `POST` | `/executions/:executionId/reject/:nodeId` | Reject pending node |
| `GET` | `/executions/stats/:pipelineId` | Execution statistics |

### Test Executions (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/executions/test` | Start test (validation/dry-run/test/live) |
| `GET` | `/executions/test/:executionId` | Get test status |
| `GET` | `/pipelines/:pipelineId/tests` | Test history with success rate |

### CRE (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cre/auth/login` | Start CRE CLI authentication |
| `POST` | `/cre/auth/login-headless` | Headless browser CRE login |
| `GET` | `/cre/auth/status` | Check CRE auth status |
| `POST` | `/cre/projects` | Create CRE project |
| `GET` | `/cre/projects` | List CRE projects |
| `POST` | `/cre/projects/:id/init` | Install dependencies (`bun install`) |
| `POST` | `/cre/projects/:id/simulate` | Run CRE simulation |
| `POST` | `/cre/workflows/generate` | Generate workflow from pipeline |
| `GET` | `/cre/workflows/:id/code` | Get generated TypeScript code |
| `POST` | `/cre/contracts` | Save Solidity contract |
| `POST` | `/cre/contracts/:id/compile` | Compile Solidity contract |
| `POST` | `/cre/contracts/:id/deploy` | Deploy contract to testnet |

### Copilot (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/copilot/chat` | Send message with canvas state, receive actions |

---

## CRE Integration

### Code Generation Pipeline

```
Visual Pipeline (nodes + edges)
  --> Topological sort (dependency order)
  --> Import generation (per node type)
  --> Config schema extraction
  --> Per-node code generation
  --> Full CRE SDK TypeScript workflow file
```

### Project Filesystem

Each pipeline gets an isolated CRE project directory:

```
cre-projects/{userId}/{projectId}/
├── project.yaml           # CRE CLI project config
├── .env                   # Private keys, target address
├── secrets.yaml
├── contracts/
│   └── abi/
└── {workflow-name}/       # Kebab-case from pipeline name
    ├── main.ts            # Generated TypeScript
    ├── package.json
    ├── tsconfig.json
    ├── workflow.yaml
    ├── config.staging.json
    └── config.production.json
```

### Simulation Flow

1. Backend verifies CRE authentication
2. Ensures project files exist (auto-heals missing scaffolding)
3. Spawns `cre workflow simulate` as a child process
4. Streams stdout/stderr line-by-line to Socket.io room `sim:{projectId}`
5. Updates project status on completion
6. Stores last 500 log lines in the database

### Contract Lifecycle

1. **Write** -- Edit Solidity in the Monaco editor (per contract node)
2. **Compile** -- `solc` compiler with 200-run optimization produces ABI + bytecode
3. **Deploy** -- `viem` wallet client sends the deploy transaction and waits for the receipt
4. **Reference** -- Deployed address is stored and available to `evm-write` / `contract-address` nodes

---

## Real-Time Communication

Mariposa uses Socket.io for real-time events between the backend and frontend.

### Room Structure

| Room | Purpose |
|------|---------|
| `sim:{projectId}` | CRE simulation log streaming |
| `compile:{contractId}` | Contract compilation progress |
| `pipeline:{pipelineId}` | Workflow generation events |

### Key Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `simulation:log` | Server -> Client | Individual simulation log line |
| `simulation:complete` | Server -> Client | Simulation finished (success/failure) |
| `compilation:progress` | Server -> Client | Compilation status update |
| `workflow:generated` | Server -> Client | Code generation complete |
| `cre:auth:complete` | Server -> Client | CRE OAuth flow finished |
| `cre:code:needed` | Server -> Client | Verification code required |

---

## Deployment

### Quick Start (PM2)

```bash
# Build both projects
cd backend && npm run build
cd ../frontend && npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

### Service Ports

| Service | Port |
|---------|------|
| Frontend (Next.js) | 3000 |
| Backend (Express) | 5000 |
| MongoDB | 27017 (or Atlas) |
| Redis | 6379 |

For the full deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is proprietary. All rights reserved.
