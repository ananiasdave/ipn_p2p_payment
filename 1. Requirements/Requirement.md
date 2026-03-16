**Software Requirements Specification (SRS)**  
**Instant Payments Namibia (IPN) – Person-to-Person (P2P) Payment Application**  
**Version:** 1.4 (Refined for Evaluator Clarity)  
**Date:** 15 March 2026  
**Author:** David  

### 1. Introduction  
This document provides a clear, complete, and evaluator-friendly specification for the IPN Developer Integration Challenge solution.  

The application fully meets every requirement stated in the original challenge document (pages 1–5):  
- User interface to capture P2P payment details  
- Construction and submission of the exact payment request to `/api/p2p-payment`  
- Basic validation (client + server)  
- Handling and display of the API response (status, transactionId, clientReference, message)  

The solution uses the requested technology stack (C# .NET 8 backend, React frontend, SQLite or JSON persistence) and is orchestrated with Docker Compose. An API Gateway serves as the single external entry point.  


### 2. Scope  
**In Scope** (exact match to challenge)  
- Capture of all required payment fields  
- Automatic clientReference generation  
- Exact JSON request/response format defined in the Mock API Specification  
- Server-side validation matching all rules on pages 3–5  
- Display of transaction outcome  
- Docker Compose deployment  

**Out of Scope** (explicitly stated in challenge)  
- Authentication / authorisation  
- Real payment processing or banking integration  
- Database persistence beyond SQLite/JSON for this prototype  
- Encryption or message signing  

### 3. Functional Requirements  

#### 3.1 User Interface (Frontend – React)  
- Built with React 18 + TypeScript + Vite + Tailwind CSS + React Hook Form + Zod  
- Form contains exactly the fields required by the Mock API:  
  - senderAccountNumber (numeric, ≥10 digits)  
  - receiverAccountNumber (numeric, ≥10 digits)  
  - amount (numeric > 0)  
  - currency (locked to “NAD”)  
  - reference (max 50 characters, non-empty)  
- ClientReference is automatically generated (user does not enter it)  
- Real-time validation prevents submission of invalid data  
- Submit button is disabled until all fields are valid  
- After submission, clearly displays:  
  - Transaction status (SUCCESS or FAILED)  
  - Transaction ID (if returned)  
  - Client transaction reference  
  - Response message from the API  

All API calls from the frontend go through the single Gateway entry point.

#### 3.2 Unique Reference Generation Microservice (C#)  
**Service:** `ref-gen-service` (.NET 8 Minimal API)  
**Internal Endpoint:** `POST /api/generate-reference`  
- Returns a unique reference in format `REF-YYYYMMDD-XXXXXX`  
- Guarantees uniqueness using SQLite sequence or JSON file  

#### 3.3 Exchange Rate Calculation Microservice (C#)  
**Service:** `exchange-rate-service` (.NET 8 Minimal API)  
**Internal Endpoint:** `POST /api/convert`  
- Mock service (always returns rate = 1.0 for NAD)  
- Included for future extensibility  

#### 3.4 Payment Processing Microservice (C#)  
**Service:** `payment-service` (.NET 8 Web API)  
**Internal Endpoint:** `POST /api/p2p-payment`  
- Implements the exact Mock API Specification (pages 3–5 of challenge)  
- Accepts the precise JSON payload shown in section 6  
- Performs full server-side validation (all rules in section 5)  
- Calls reference and exchange services internally  
- Returns exact success or error responses (including ERR001–ERR006)  
- Stores the full transaction (request + response) in SQLite or JSON  

#### 3.5 API Gateway (Single Entry Point)  
**Service:** `api-gateway` (Traefik v3)  
- **Only external port exposed:** 8080  
- All requests (frontend and API) must use `http://localhost:8080`  
- Exact routing:  
  - `POST /api/p2p-payment` → payment-service  
  - `POST /api/generate-reference` → ref-gen-service  
  - `POST /api/convert` → exchange-rate-service  
  - `/` → React frontend  

#### 3.6 Data Persistence  
- Primary: SQLite database (`ipn_p2p.db`) via EF Core, mounted as Docker volume  
- Alternative: Plain JSON files (simple prototype mode – switchable via environment variable)  
- Every transaction is saved for audit purposes  

#### 3.7 Validation  
- Frontend: Zod schema + React Hook Form (real-time)  
- Backend: FluentValidation (exact match to challenge rules)  
- Invalid submissions are rejected before reaching the mock API  

### 4. Non-Functional Requirements  
- End-to-end response time < 800 ms  
- Single external URL for evaluators (http://localhost:8080)  
- Clear, structured logging with correlation IDs  
- Health-check endpoints on all services  

### 5. Architecture Overview  

#### 5.1 C# Microservice Project Structure (Strictly Followed in All Three Services)  
Every C# microservice (`ref-gen-service`, `exchange-rate-service`, and `payment-service`) uses the exact same clean, layered folder structure:

```
MicroserviceName/
├── Services/              → All business logic (e.g. PaymentService.cs, ReferenceGeneratorService.cs)
├── Repository/            → All data integrations (SQLite via EF Core, JSON file I/O, external calls)
├── Interfaces/            → All interface definitions (e.g. IPaymentService.cs, ITransactionRepository.cs)
├── Utilities/             → All shared utilities (e.g. ValidationHelpers.cs, LoggingExtensions.cs, CorrelationIdMiddleware.cs)
├── Models/                → DTOs and domain models (placed here for clarity)
├── Program.cs             → Entry point with full Dependency Injection setup
├── appsettings.json
├── Dockerfile
└── ...
```

**Key Rules (applied identically in every service):**  
- **Dependency Injection is used at all times** – every class is registered in `Program.cs` using the built-in .NET DI container (`services.AddScoped<>()`, `services.AddSingleton<>()`, etc.).  
- Controllers / Minimal API endpoints in `Program.cs` depend **only** on interfaces from the `Interfaces/` folder.  
- Business logic lives **exclusively** in the `Services/` folder and receives interfaces via constructor injection.  
- All database/file operations live **exclusively** in the `Repository/` folder (implementing interfaces from `Interfaces/`).  
- `Utilities/` contains only reusable helper classes used across layers.  
- No direct new-ing of classes anywhere – everything is resolved through DI.  

This structure ensures clean separation of concerns, testability, and readability for evaluators.

#### 5.2 Overall System Architecture  
- **Frontend:** React (served via Gateway)  
- **Backend:** Three C# .NET 8 microservices using the structure above  
- **Gateway:** Traefik (single entry point – configured via Docker labels)  
- **Internal communication:** gRPC (recommended) or REST (simple fallback)  
- **Orchestration:** Docker Compose (one command to start everything)  

### 6. Deployment & Setup Instructions (for Evaluators)  
1. Clone the repository  
2. Run: `docker compose up --build`  
3. Open browser to **http://localhost:3080**  
   - This is the only URL needed  
   - Frontend loads automatically  
   - All APIs are available under `/api/...`  
4. (Optional) Stop with `docker compose down`  

Screenshots of the form and result screen will be included in the submission.

### 7. Assumptions (Explicitly Documented)  
- Adopted Microservice architecture, assuming that this would be a large application thus allowing for future scalability.
- Used Docker and Docker Compose. This make it easy to migrate to kubernetes when required.
- SQLite file persists across container restarts (volume mounted)  
- Exchange rate is mocked at 1:1 (as no real conversion is required)  
- ClientReference is always generated by the service  
- Gateway uses Traefik labels for zero-code routing (YARP alternative noted in README if preferred)  
- Every C# service strictly follows the Services / Repository / Interfaces / Utilities structure with full DI  

This refined SRS is deliberately concise, unambiguous, and directly traceable to every point in the original IPN challenge document. All evaluators can verify compliance by:  
- Accessing only http://localhost:3080  
- Submitting a payment and seeing the exact response fields  
- Reviewing the source code folder structure (Services/Repository/Interfaces/Utilities) and DI registration in Program.cs  

The solution demonstrates clean architecture while strictly adhering to the challenge requirements and the specified microservice structure. Ready for review.