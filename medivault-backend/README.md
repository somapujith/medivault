# MediVault Backend — Spring Boot REST API

A full Spring Boot 3 backend for the MediVault Healthcare Platform.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.2 |
| Security | Spring Security + JWT (jjwt) |
| ORM | Spring Data JPA + Hibernate |
| Database | H2 In-Memory (dev) |
| Validation | Jakarta Bean Validation |
| Build | Maven |
| Java | 17+ |

## Project Structure

```
medivault-backend/
├── src/main/java/com/medivault/
│   ├── MediVaultApplication.java        ← Entry point
│   ├── config/
│   │   ├── SecurityConfig.java          ← Spring Security + CORS + JWT filter chain
│   │   └── DataSeeder.java              ← Seeds H2 with demo data on startup
│   ├── controller/
│   │   ├── AuthController.java          ← POST /api/auth/login, /register
│   │   ├── PatientController.java       ← GET /api/patient/**
│   │   ├── PrescriptionController.java  ← CRUD /api/prescriptions/**
│   │   ├── DocumentController.java      ← /api/documents/**
│   │   └── AdminController.java         ← /api/admin/** (ADMIN only)
│   ├── dto/
│   │   ├── AuthDto.java                 ← Login/Register/Response DTOs
│   │   └── PrescriptionDto.java         ← Prescription request/response DTOs
│   ├── entity/
│   │   ├── User.java                    ← Users table (PATIENT/DOCTOR/ADMIN)
│   │   ├── Patient.java                 ← Patients table
│   │   ├── Prescription.java            ← Prescriptions table
│   │   ├── Medication.java              ← Medications table
│   │   └── Document.java                ← Documents table
│   ├── exception/
│   │   └── GlobalExceptionHandler.java  ← Unified error responses
│   ├── repository/                      ← Spring Data JPA repositories
│   ├── security/
│   │   ├── JwtUtils.java                ← JWT generate/validate
│   │   ├── JwtAuthFilter.java           ← Bearer token filter
│   │   └── UserDetailsServiceImpl.java  ← Loads user by email
│   └── service/
│       ├── AuthService.java             ← Login + Register logic
│       ├── PatientService.java          ← Patient CRUD
│       └── PrescriptionService.java     ← Prescription CRUD
└── src/main/resources/
    └── application.properties           ← DB, JWT, CORS config
```

## Running the Backend

### Prerequisites
- Java 17 or higher
- Maven 3.8+

### Steps

```bash
# 1. Navigate to backend folder
cd medivault-backend

# 2. Build and run
mvn spring-boot:run

# OR build JAR first
mvn clean package -DskipTests
java -jar target/medivault-backend-1.0.0.jar
```

The server starts on **http://localhost:8080**

### H2 Console
Access the in-memory database at: **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:medivaultdb`
- Username: `sa`
- Password: *(empty)*

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/register` | Register new user |

### Patients
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/patient/all` | DOCTOR, ADMIN |
| GET | `/api/patient/{id}` | All authenticated |
| GET | `/api/patient/qr/{id}` | DOCTOR, ADMIN |

### Prescriptions
| Method | Endpoint | Role |
|---|---|---|
| POST | `/api/prescriptions` | DOCTOR, ADMIN |
| GET | `/api/prescriptions/patient/{id}` | All authenticated |
| GET | `/api/prescriptions/doctor/{id}` | DOCTOR, ADMIN |
| GET | `/api/prescriptions/{id}` | All authenticated |
| PATCH | `/api/prescriptions/{id}/status` | DOCTOR, ADMIN |

### Documents
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/documents/patient/{id}` | All authenticated |
| POST | `/api/documents` | DOCTOR, ADMIN |
| DELETE | `/api/documents/{id}` | ADMIN |

### Admin
| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/admin/users` | ADMIN |
| DELETE | `/api/admin/users/{id}` | ADMIN |
| GET | `/api/admin/stats` | ADMIN |

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Patient | patient@medivault.com | patient123 |
| Doctor | doctor@medivault.com | doctor123 |
| Admin | admin@medivault.com | admin123 |

## Authentication

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

The JWT token is returned from `/api/auth/login` and stored in the React frontend's localStorage.

## Running Both (Full Stack)

```bash
# Terminal 1 — Spring Boot backend
cd medivault-backend
mvn spring-boot:run

# Terminal 2 — React frontend
cd medi-vault
npm run dev
```

Then open **http://localhost:5173** — Vite proxies `/api/*` to Spring Boot automatically.
