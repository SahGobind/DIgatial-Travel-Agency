# Digital World Tour & Travels — Backend REST API

Clean, scalable REST API architecture built with **Python**, **Django**, and **Django REST Framework (DRF)** for Digital World Tour & Travels (Janakpur Dham, Nepal).

---

## 1. Prerequisites

- **Python**: 3.10+ (Current environment: Python 3.14.2)
- **pip** package manager

---

## 2. Project Architecture

```
backend/
├── manage.py                          # Django CLI utility
├── requirements.txt                   # Python dependencies (Django, DRF, CORS, drf-spectacular, dotenv)
├── .env.example                       # Sample environment variables
├── .env                               # Local development variables (git ignored)
├── README.md                          # Documentation
├── config/                            # Core project configuration
│   ├── __init__.py
│   ├── settings.py                    # Settings (CORS, DRF, Timezone, Apps, Spectacular)
│   ├── urls.py                        # Root URL router & API documentation routes
│   ├── wsgi.py                        # WSGI application entrypoint
│   └── asgi.py                        # ASGI application entrypoint
├── common/                            # Shared utilities & architecture modules
│   ├── __init__.py
│   ├── pagination.py                  # StandardResultsSetPagination (page_size, count, next, prev)
│   ├── permissions.py                 # IsAdminOrReadOnly, IsOwnerOrAdmin, PublicReadOnly
│   ├── exceptions.py                  # Custom standardized DRF exception handler
│   ├── responses.py                   # Standard success_response & error_response helpers
│   └── tests.py                       # Automated API architecture & endpoint tests
└── apps/                              # Modular domain apps
    ├── __init__.py
    ├── users/                         # Authentication & user profile management
    │   ├── serializers.py, services.py, views.py, urls.py
    ├── customers/                     # Customer profile records
    │   ├── serializers.py, services.py, views.py, urls.py
    ├── tickets/                       # Air ticketing requests & fare calculation
    │   ├── serializers.py, services.py, views.py, urls.py
    ├── visas/                         # Visa application processing & requirements checklist
    │   ├── serializers.py, services.py, views.py, urls.py
    ├── hotels/                        # Hotel reservations & availability
    │   ├── serializers.py, services.py, views.py, urls.py
    ├── employment/                    # Overseas vacancies & job applications
    │   ├── serializers.py, services.py, views.py, urls.py
    ├── payments/                      # Multi-channel payment processing & audit
    │   ├── serializers.py, services.py, views.py, urls.py
    ├── invoices/                      # Invoicing, tax/VAT calculation & billing
    │   ├── serializers.py, services.py, views.py, urls.py
    └── notifications/                 # In-app alerts, SMS & email notifications
        ├── serializers.py, services.py, views.py, urls.py
```

---

## 3. Installation & Setup

### A. Create and Activate Virtual Environment (Optional)

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### B. Install Dependencies

```powershell
pip install -r requirements.txt
```

---

## 4. Environment Variables

Copy `.env.example` to `.env` in the `backend/` root directory:

```env
SECRET_KEY=your-secure-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,testserver

# Database Configuration (PostgreSQL placeholder)
DATABASE_URL=sqlite:///db.sqlite3

# Frontend CORS Origin
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 5. Running the Backend & Tests

### Verify Configuration
```powershell
python manage.py check
```

### Run Automated Tests
```powershell
python manage.py test
```

### Start Development Server
```powershell
python manage.py runserver 8000
```

The API will be accessible at `http://127.0.0.1:8000/`.

---

## 6. Interactive API Documentation

Interactive Swagger UI and OpenAPI 3.0 schema are enabled out-of-the-box:

- **Swagger UI Interactive Playground**: `http://127.0.0.1:8000/api/docs/`
- **Redoc Visual Documentation**: `http://127.0.0.1:8000/api/redoc/`
- **Raw OpenAPI Schema (YAML/JSON)**: `http://127.0.0.1:8000/api/schema/`

---

## 7. API Endpoints

### Base URL: `/api/v1/`

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/v1/health/` | `GET` | API Health & status check |
| `/api/v1/auth/register/` | `POST` | User registration |
| `/api/v1/auth/login/` | `POST` | User login |
| `/api/v1/auth/profile/` | `GET` | User profile |
| `/api/v1/customers/` | `GET`, `POST` | Customers listing & creation |
| `/api/v1/tickets/` | `GET`, `POST` | Ticket requests listing & submission |
| `/api/v1/tickets/estimate/` | `POST` | Flight fare calculator (NPR) |
| `/api/v1/visas/` | `GET`, `POST` | Visa applications listing & submission |
| `/api/v1/visas/requirements/` | `GET` | Country visa checklist & fees (NPR) |
| `/api/v1/hotels/` | `GET` | Hotels search & directory |
| `/api/v1/hotels/book/` | `POST` | Hotel reservation creation |
| `/api/v1/employment/` | `GET` | Overseas jobs directory |
| `/api/v1/employment/apply/` | `POST` | Overseas job application submission |
| `/api/v1/payments/` | `GET` | Payment transaction audit log |
| `/api/v1/payments/initiate/` | `POST` | Initiate payment session (eSewa, Khalti, Card, Wire) |
| `/api/v1/payments/verify/` | `POST` | Verify payment clearance |
| `/api/v1/invoices/` | `GET` | Invoices listing (filter by status) |
| `/api/v1/invoices/<id>/` | `GET` | Invoice breakdown & itemized ledger |
| `/api/v1/notifications/` | `GET` | User notifications list |
| `/api/v1/notifications/<id>/read/` | `POST` | Mark notification as read |

### Standard Response Envelopes

**Success (`200 OK`, `201 Created`):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Error (`400 Bad Request`, `404 Not Found`, etc.):**
```json
{
  "success": false,
  "message": "Validation failed. Please check the input data.",
  "errors": {}
}
```
