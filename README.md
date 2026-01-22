# CoFHE Worker Service

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24-brightgreen)](https://nodejs.org/)

Stateless REST API for Fully Homomorphic Encryption using Fhenix CoFHE SDK.

## Features

- Encrypt all FHE types: `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256`, `eaddress`, `ebool`
- Worker Thread Pool for parallel encryption
- Docker-ready deployment
- OpenAPI/Swagger documentation
- Health checks (liveness + readiness)
- RFC 7807 error responses

## Quick Start

### Docker

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### From Source

```bash
npm install
npm run build
npm run start:prod
```

The service will be available at `http://localhost:3000`.

## API Reference

### Generic Endpoint

```http
POST /api/v1/encrypt
Content-Type: application/json

{
  "type": "euint64",
  "value": "1000000"
}
```

Supported types: `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256`, `eaddress`, `ebool`

> **Note:** `contractAddress` and `userAddress` are optional for Fhenix (not required for encryption).

### Typed Shortcuts

```http
POST /api/v1/encrypt/uint8
POST /api/v1/encrypt/uint16
POST /api/v1/encrypt/uint32
POST /api/v1/encrypt/uint64
POST /api/v1/encrypt/uint128
POST /api/v1/encrypt/uint256
POST /api/v1/encrypt/address
POST /api/v1/encrypt/bool
```

### Batch Encryption

Encrypt multiple values in a single request (max 10 items).

```http
POST /api/v1/encrypt/batch
Content-Type: application/json

{
  "items": [
    { "type": "euint64", "value": "1000000" },
    { "type": "ebool", "value": true },
    { "type": "eaddress", "value": "0xabcdef0123456789abcdef0123456789abcdef01" }
  ]
}
```

**Batch Response:**
```json
{
  "results": [
    {
      "type": "euint64",
      "data": "0x...",
      "inputProof": "0x...",
      "encryptionTimeMs": 1200
    }
  ],
  "totalEncryptionTimeMs": 3500
}
```

All-or-nothing: if any item fails, the entire batch returns an error.

### Response Format

```json
{
  "type": "euint64",
  "data": "0x1234...abcd",
  "inputProof": "0xabcd...1234",
  "encryptionTimeMs": 2350
}
```

### Health Checks

```http
GET /health        # Liveness probe
GET /health/ready  # Readiness probe (CoFHE SDK initialized)
```

### API Documentation

Swagger UI available at `/api/docs`.

## Configuration

### Application

| Variable    | Default       | Description                              |
|-------------|---------------|------------------------------------------|
| `PORT`      | `3000`        | HTTP server port                         |
| `NODE_ENV`  | `development` | Environment mode                         |
| `LOG_LEVEL` | `info`        | Logging level (debug, info, warn, error) |

### Worker Pool

| Variable              | Default     | Description            |
|-----------------------|-------------|------------------------|
| `WORKER_MIN_THREADS`  | `2`         | Minimum worker threads |
| `WORKER_MAX_THREADS`  | `CPU cores` | Maximum worker threads |
| `WORKER_IDLE_TIMEOUT` | `60000`     | Idle timeout (ms)      |
| `WORKER_MAX_QUEUE`    | `100`       | Maximum queued tasks   |
| `WORKER_TASK_TIMEOUT` | `45000`     | Task timeout (ms)      |

### CoFHE Network

| Variable            | Default                                  | Description            |
|---------------------|------------------------------------------|------------------------|
| `COFHE_CHAIN_ID`    | `421614`                                 | Blockchain chain ID    |
| `COFHE_NETWORK_NAME`| `Arbitrum Sepolia`                       | Network name           |
| `COFHE_RPC_URL`     | `https://sepolia-rollup.arbitrum.io/rpc` | RPC URL                |
| `COFHE_ENV`         | `testnet`                                | Environment (mock/testnet) |

### Supported Networks

| Network          | Chain ID | RPC URL                                  |
|------------------|----------|------------------------------------------|
| Arbitrum Sepolia | 421614   | https://sepolia-rollup.arbitrum.io/rpc   |
| Ethereum Sepolia | 11155111 | https://eth-sepolia.public.blastapi.io   |

## Architecture

```
src/
├── domain/           # Business logic, value objects, errors
├── application/      # Use cases, DTOs
├── infrastructure/   # Worker pool, CoFHE SDK integration
└── interface/        # Controllers, filters, health checks
```

### Worker Thread Pool

Uses Piscina for CPU parallelism and fault isolation. Each worker maintains its own CoFHE SDK instance for thread-safe encryption.

## Development

### Prerequisites

- Node.js 24+
- npm 10+

### Installation

```bash
npm install
```

### Running

```bash
npm run start:dev   # Development with watch
npm run start:prod  # Production
```

### Testing

```bash
npm test            # Unit tests
npm run test:cov    # With coverage
npm run test:e2e    # E2E tests
```

### Building Docker Image

```bash
docker build -f docker/Dockerfile -t cofhe-worker .
```

## Error Handling

All errors follow RFC 7807 Problem Details format:

```json
{
  "type": "urn:fhe:error:encryption-failed",
  "title": "Encryption Failed",
  "status": 500,
  "detail": "Failed to encrypt uint64",
  "instance": "/api/v1/encrypt/uint64"
}
```

### Error Types

| Error                 | Status | Type URN                              |
|-----------------------|--------|---------------------------------------|
| Validation failed     | 400    | `urn:fhe:error:validation`            |
| Invalid address       | 422    | `urn:fhe:error:invalid-address`       |
| Value out of range    | 422    | `urn:fhe:error:invalid-value`         |
| Unsupported type      | 422    | `urn:fhe:error:unsupported-type`      |
| Encryption failed     | 500    | `urn:fhe:error:encryption-failed`     |
| Internal error        | 500    | `urn:fhe:error:internal`              |
| CoFHE not ready       | 503    | `urn:fhe:error:not-initialized`       |
| Initialization failed | 503    | `urn:fhe:error:initialization-failed` |
| Pool exhausted        | 503    | `urn:fhe:error:pool-exhausted`        |
| Timeout               | 504    | `urn:fhe:error:timeout`               |

## License

MIT
