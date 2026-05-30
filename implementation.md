# Oscar AI — Comprehensive Implementation Plan

## Overview

This document describes how 1-2 developers build the Oscar AI product over approximately 24-30 months. The strategy is **modernize the foundation first, then layer AI features on top.** Every phase produces a deployable, testable increment.

### Guiding Principles

1. **Strangler fig pattern.** Modern code wraps around legacy code. The legacy code continues to function unchanged until its replacement is proven.
2. **No big-bang releases.** Every phase ends with a deployable artifact. Clinics can receive value at each stage boundary, not just at the end.
3. **The AI service is a separate process.** It never forks Oscar's source code. It communicates via REST API and direct database reads.
4. **Multi-provider from day one.** The AI abstraction supports cloud (Ollama Cloud, OpenAI-compatible) and local (on-prem Ollama) with a config toggle.
5. **Human-in-the-loop always.** AI output is a draft. Clinicians review and approve. Audit trails log every AI action.
6. **Test what matters.** Unit tests for deterministic logic. Integration tests for AI pipelines. Manual QA for clinical correctness. No AI output goes to production without human review.

### Phase Dependency Map

```
Phase 0 (Env + Oscar build)
  ├── Phase 1 (Backend modernization) ──┐
  ├── Phase 2 (Frontend foundation) ────┤
  └── Phase 3 (AI service core) ────────┤
                                          ├── Phase 4 (Smart Intake)
                                          │     └── Phase 5 (Billing codes)
                                          │           └── Phase 6 (AI Scribe)
                                          │                 └── Phase 7 (Workflow + Rx + Labs)
                                          │                       └── Phase 8 (Referrals + Pop Health + CDS)
                                          └── Phase 9 (FHIR + Compliance)
```

Phases 1, 2, and 3 can run in parallel (different work streams). Phase 4 requires all three to be complete. From Phase 4 onward, phases are sequential (each builds on the previous).

---

## Phase 0: Environment Setup & Oscar Bootstrap

**Timeline:** Month 1
**Team:** 1 developer (full-time)
**Goal:** Oscar builds and runs locally. Development tooling is in place. The project is documented.

### Prerequisites

- Linux development machine (Ubuntu 22.04+ recommended)
- Docker installed
- Java 8 JDK (Temurin or Oracle) for building Oscar as-is
- MySQL 8.0 running locally or in Docker
- Git access to the Oscar repository

### Tasks

#### 0.1 — Database Setup
```bash
# Start MySQL in Docker (if not already running)
docker run --name oscar-mysql -e MYSQL_ROOT_PASSWORD=oscar \
  -e MYSQL_DATABASE=oscar -p 3306:3306 -d mysql:8.0

# Apply base schema and data
mysql -h 127.0.0.1 -u root -poscar oscar < database/mysql/oscarinit.sql
mysql -h 127.0.0.1 -u root -poscar oscar < database/mysql/oscarinit_bc.sql
mysql -h 127.0.0.1 -u root -poscar oscar < database/mysql/oscardata.sql
mysql -h 127.0.0.1 -u root -poscar oscar < database/mysql/oscardata_bc.sql

# Apply incremental updates (ordered by date)
for f in database/mysql/updates/*.sql; do
  mysql -h 127.0.0.1 -u root -poscar oscar < "$f"
done
```

**Acceptance criteria:** All 777 SQL files apply without error. Database contains expected tables (demographic, casemgmt_note, drugs, etc.).

#### 0.2 — Oscar Build
```bash
# Set JAVA_HOME to Java 8
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64

# Install local Maven repo dependencies
cd local_repo
# For each jar, install into local Maven repo:
# mvn install:install-file -Dfile=<jar> -DgroupId=<g> -DartifactId=<a> -Dversion=<v> -Dpackaging=jar

# Build Oscar (skip tests initially to verify compilation)
mvn -Dmaven.test.skip=true -Dcheckstyle.skip=true -Dpmd.skip=true clean package

# Verify WAR was produced
ls -la target/oscar.war
```

**Acceptance criteria:** `oscar.war` builds successfully. Size approximately 150-200MB.

#### 0.3 — Tomcat Deployment
```bash
# Use the bundled Tomcat in catalina_base/ or install Tomcat 8.5
cp target/oscar.war catalina_base/webapps/

# Configure database connection in catalina_base/conf/Catalina/localhost/oscar.xml
# (or via context.xml / server.xml)

# Start Tomcat
catalina_base/bin/startup.sh

# Wait for deployment, then verify:
curl -s http://localhost:8080/oscar/ | head -20
```

**Acceptance criteria:** Oscar login page loads at `http://localhost:8080/oscar/`. Can log in with default credentials. Can navigate to patient search, schedule, and encounter pages.

#### 0.4 — Development Tooling
- Configure IDE (IntelliJ or Eclipse) with project import from `pom.xml`
- Set up code style to match `.checkstyle` rules
- Configure Git hooks for pre-commit checks
- Document the build process in `docs/development_setup.md`

#### 0.5 — Codebase Documentation (Living Document)
Create `docs/architecture_notes.md` documenting:
- Package dependency graph (which packages depend on which)
- Database schema map (key tables and their relationships)
- Struts action-to-JSP mapping (which actions render which pages)
- REST API endpoint inventory (all 30+ existing endpoints)
- Configuration file inventory (which XML files control what)
- Key business logic flows (patient registration, encounter note creation, billing submission, referral workflow)

**Acceptance criteria:** A new developer can understand the codebase structure from these docs within 2 days.

### Deliverables
- Running Oscar instance with seeded database
- Automated build script (`build.sh`)
- `docs/development_setup.md` — reproducible setup guide
- `docs/architecture_notes.md` — codebase map

---

## Phase 1: Backend Modernization Foundation

**Timeline:** Months 1-4
**Team:** 1 developer
**Goal:** Oscar builds and runs on Java 17. The build system is modernized. A CI/CD pipeline exists. The database migration tooling is in place.

### Prerequisites
- Phase 0 complete (Oscar builds and runs on Java 8)

### Tasks

#### 1.1 — Java 8 → Java 17 Migration (Weeks 1-4)

**Step 1: pom.xml changes**
- Change `<maven.compiler.source>` and `<maven.compiler.target>` to `17`
- Update all dependency versions to Jakarta EE 9+ compatible versions where possible
- Add `--add-opens` JVM flags for modules that use reflection (Hibernate 3, CXF)

**Step 2: javax.* → jakarta.* migration**
- The codebase uses `javax.servlet`, `javax.persistence`, `javax.ws.rs`, etc.
- For Tomcat 10, these must become `jakarta.servlet`, `jakarta.persistence`, `jakarta.ws.rs`
- Automated approach: Use the Eclipse Transformer tool or a scripted search-and-replace across all 4,600 Java files
- **Warning:** Some dependencies (e.g., Hibernate 3.4.0.GA) use `javax.persistence` internally. These will break with Tomcat 10.
- **Mitigation:** Stay on Tomcat 9 (which still supports `javax.*`) for the initial Java 17 upgrade. The Tomcat 10 + Jakarta migration is deferred to Phase 1.3.

**Step 3: Fix deprecated API usage**
- `finalize()` methods → remove or annotate with `@SuppressWarnings`
- `SecurityManager` usage → audit and replace
- `Class.newInstance()` → `Class.getDeclaredConstructor().newInstance()`
- Legacy date/time APIs → Java Time API where safe to change

**Step 4: Verify**
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
mvn -Dmaven.test.skip=true clean package
# Deploy WAR to Tomcat 9
# Manual smoke test: login, search patient, create encounter note, submit billing
```

**Acceptance criteria:**
- Oscar compiles on Java 17
- All existing functionality works on Tomcat 9
- Build time is comparable to or better than Java 8
- No `UnsupportedClassVersionError` or `NoClassDefFoundError`

#### 1.2 — Build System Modernization (Weeks 3-6)

**Task 1.2a: Local repo cleanup**
- Inventory all jars in `local_repo/` (approximately 50-80 jars)
- For each jar, search Maven Central for an equivalent or newer version
- Replace with Maven Central coordinates where possible
- For jars with no Maven Central equivalent, document why they're needed and what they do

**Task 1.2b: Dependency version audit**
- Run `mvn versions:display-dependency-updates`
- Document critical version gaps (Spring 3.1.0 vs 6.x, Hibernate 3.4 vs 6.x)
- Upgrade non-breaking dependencies (Guava, Jackson, Apache POI, SLF4J)
- Pin versions explicitly in `<dependencyManagement>` section

**Task 1.2c: CI/CD Pipeline**
Create `bitbucket-pipelines.yml` (or GitHub Actions workflow):
```yaml
pipelines:
  default:
    - step:
        name: Build and Test
        image: maven:3.9-eclipse-temurin-17
        script:
          - mvn clean compile
          - mvn -Dcheckstyle.skip=true -Dpmd.skip=true test
        artifacts:
          - target/oscar.war
```

**Acceptance criteria:**
- `mvn clean package` succeeds in CI
- All non-breaking dependency updates applied
- Local repo dependency count reduced

#### 1.3 — Database Migration Tooling (Weeks 4-6)

Oscar has 777 raw SQL files with no migration framework. Introduce Flyway for new migrations while preserving the existing baseline.

```bash
# Add Flyway dependency to pom.xml
# <dependency>
#   <groupId>org.flywaydb</groupId>
#   <artifactId>flyway-core</artifactId>
#   <version>9.22.3</version>
# </dependency>
# <dependency>
#   <groupId>org.flywaydb</groupId>
#   <artifactId>flyway-mysql</artifactId>
#   <version>9.22.3</version>
# </dependency>
```

**Strategy:**
1. Take a baseline of the current database state (all 777 scripts applied)
2. Call `Flyway.baseline()` to mark the current state as the baseline
3. All new schema changes go in `src/main/resources/db/migration/V{version}__{description}.sql`
4. AI-specific tables (e.g., `ai_scribe_session`, `referral_tracking`, `ai_workflow_log`) are created as Flyway migrations

**Acceptance criteria:**
- Flyway initializes against an existing Oscar database without errors
- New migration scripts are versioned and applied on startup
- Rollback strategy documented (manual SQL for simplicity)

#### 1.4 — Modern REST Endpoint Pattern (Weeks 6-8)

Oscar already has 30+ REST endpoints via Apache CXF JAX-RS under `org.oscarehr.ws.rest`. For new AI-related endpoints, introduce a parallel Spring MVC REST pattern that can coexist.

**New file:** `src/main/java/org/oscarehr/ws/spring/AiBridgeController.java`

```java
package org.oscarehr.ws.spring;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.oscarehr.common.dao.DemographicDao;
import org.oscarehr.casemgmt.dao.CaseManagementNoteDAO;

@RestController
@RequestMapping("/api/v1/ai")
public class AiBridgeController {

    @Autowired
    private DemographicDao demographicDao;

    @Autowired
    private CaseManagementNoteDAO caseManagementNoteDAO;

    @GetMapping("/patient/{demographicNo}/context")
    public ResponseEntity<PatientContext> getPatientContext(
            @PathVariable int demographicNo) {
        // Returns: demographics, problem list, meds, allergies, recent labs
        // Used by AI service to build context for scribe/prediction
        PatientContext ctx = new PatientContext();
        ctx.setDemographic(demographicDao.find(demographicNo));
        // ... fill remaining fields
        return ResponseEntity.ok(ctx);
    }

    @PostMapping("/encounter/note")
    public ResponseEntity<Void> saveAiEncounterNote(
            @RequestBody AiEncounterNoteRequest request) {
        // AI-generated note → Oscar's caseManagementNote table
        // Validation: verify provider auth, patient exists
        // Audit: log which AI model generated this note
        return ResponseEntity.ok().build();
    }

    // Future endpoints:
    // POST /api/v1/ai/patient          — AI intake creates patient
    // POST /api/v1/ai/billing/codes    — AI suggests billing codes
    // POST /api/v1/ai/prescription     — AI creates prescription draft
    // POST /api/v1/ai/lab-order        — AI creates lab order draft
    // POST /api/v1/ai/referral         — AI creates referral draft
}
```

**Spring context configuration** (add to existing `applicationContextREST.xml` or a new `applicationContextAI.xml`):

```xml
<mvc:annotation-driven />
<context:component-scan base-package="org.oscarehr.ws.spring" />
```

**Note:** This Spring MVC dispatcher runs alongside the CXF servlet. CXF handles `/ws/*`. Spring MVC handles `/api/*`. No conflict — different URL namespaces.

**Acceptance criteria:**
- `GET /api/v1/ai/patient/1/context` returns patient data in JSON
- New endpoints follow the Spring MVC pattern (not Struts)
- Existing CXF endpoints continue to work unchanged

### Deliverables
- Oscar compiles and runs on Java 17 (Tomcat 9)
- CI/CD pipeline with automated build
- Flyway-managed database migrations for new schema changes
- First Spring MVC REST endpoint for AI bridge
- Updated `docs/architecture_notes.md` with modernization state

---

## Phase 2: Frontend Foundation & Design System

**Timeline:** Months 2-4
**Team:** 1 developer (can be the same developer working on Phase 1, or a second developer)
**Goal:** A React design system exists. React components can be embedded into Oscar's JSP pages. The build pipeline is automated.

### Prerequisites
- Phase 0 complete (Oscar running locally for testing)

### Tasks

#### 2.1 — Create the oscar-ui project (Week 1)

```bash
mkdir -p ~/projects/oscar-ui && cd ~/projects/oscar-ui
npm init -y
npm install react react-dom typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react storybook
```

**Directory structure:**
```
oscar-ui/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html                  # Dev sandbox (not used in production)
├── src/
│   ├── entries/                # One entry per JSP page that gets a React component
│   │   ├── ai-intake.tsx       # Builds → dist/ai-intake.bundle.js
│   │   ├── ai-scribe.tsx       # Builds → dist/ai-scribe.bundle.js
│   │   └── billing-suggester.tsx
│   ├── design-system/          # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toast.tsx
│   │   └── Spinner.tsx
│   ├── clinical/               # Domain-specific components
│   │   ├── PatientHeader.tsx   # Sticky patient context bar
│   │   ├── VitalsPanel.tsx     # BP, HR, temp, O2
│   │   ├── MedicationList.tsx  # Current meds with interaction warnings
│   │   ├── AllergyBadge.tsx    # Colored severity badges
│   │   └── ProblemList.tsx     # Active diagnoses with ICD codes
│   ├── hooks/
│   │   ├── useApi.ts           # Fetch wrapper with Oscar auth
│   │   ├── usePatient.ts       # Patient context hook
│   │   └── useAuth.ts          # Auth state hook
│   └── theme/
│       ├── variables.css       # CSS custom properties
│       ├── reset.css           # Normalize + base styles
│       └── dark-mode.css       # Dark theme overrides
└── dist/                       # Built JS bundles (committed to Oscar's webapp/js/)
```

#### 2.2 — Vite Build Configuration (Week 1)

`vite.config.ts` must produce standalone, self-contained bundles that don't conflict with each other:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        'ai-intake': path.resolve(__dirname, 'src/entries/ai-intake.tsx'),
        'ai-scribe': path.resolve(__dirname, 'src/entries/ai-scribe.tsx'),
        'billing-suggester': path.resolve(__dirname, 'src/entries/billing-suggester.tsx'),
      },
      output: {
        entryFileNames: '[name].bundle.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
    outDir: 'dist',
  },
});
```

**Key constraint:** Each bundle must be self-contained. If two JSP pages load different bundles, they must not conflict (no shared global state, no duplicate React instances).

#### 2.3 — Design System Implementation (Weeks 1-4)

Build the component library with Storybook for visual testing:

```bash
npx storybook init
```

Each component must:
- Accept `className` prop for consumer overrides (never use `style` prop)
- Support keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Work in both light and dark mode via CSS custom properties
- Not depend on any Oscar-specific context (the design system is standalone)

**Component checklist (build in priority order):**
1. `Button` — primary, secondary, danger, ghost variants; loading state
2. `Input` — text, number, date, textarea; error state; label
3. `Select` — single, multi; searchable; async option loading
4. `Modal` — title, body, footer; Escape to close; focus trap
5. `Table` — sortable columns; pagination; row selection
6. `Card` — title, subtitle, body, footer; clickable variant
7. `Badge` — success, warning, error, info variants
8. `Tabs` — horizontal; keyboard navigable
9. `Toast` — auto-dismiss; success/error/warning/info
10. `Spinner` — inline and overlay variants

#### 2.4 — Clinical Components (Weeks 3-5)

These components render Oscar data but are built as pure presentational components (data passed via props, not fetched internally):

- `PatientHeader` — shows name, DOB, PHN, age, allergies (sticky bar)
- `VitalsPanel` — shows latest vitals with trend indicators
- `MedicationList` — shows current medications with start/end dates
- `AllergyBadge` — colored badge per allergy severity
- `ProblemList` — active problems with onset dates

#### 2.5 — First JSP Integration (Week 5)

Create a test JSP page that loads a React component:

`src/main/webapp/ai/test.jsp`:
```jsp
<%@ page contentType="text/html;charset=UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <title>AI Component Test</title>
    <link rel="stylesheet" href="<%=request.getContextPath()%>/js/oscar-ui/theme/variables.css">
    <link rel="stylesheet" href="<%=request.getContextPath()%>/js/oscar-ui/theme/reset.css">
</head>
<body>
    <div id="ai-test-root"></div>
    <script src="<%=request.getContextPath()%>/js/oscar-ui/test-component.bundle.js"></script>
</body>
</html>
```

**Build step integration:** After `npm run build`, copy `dist/` contents to `src/main/webapp/js/oscar-ui/`. This can be automated with a shell script or npm postbuild hook.

**Acceptance criteria:**
- A React component renders inside an Oscar JSP page
- The component makes API calls to Oscar's REST endpoints
- No JavaScript conflicts with existing jQuery/Dojo code on the page
- Dark mode toggle works within the React component

### Deliverables
- `oscar-ui` project on GitHub with Storybook
- 10+ design system components with Storybook stories
- 5 clinical components
- Build pipeline that outputs bundled JS to Oscar's webapp directory
- Integration test JSP page proving React-in-JSP works

---

## Phase 3: AI Service Core

**Timeline:** Months 3-5
**Team:** 1 developer (can parallel with Phase 1 or 2)
**Goal:** The Python FastAPI service is built, tested, and deployable. The multi-provider abstraction works. Oscar database read models exist. Prompt templates are versioned.

### Prerequisites
- Phase 0 complete (Oscar running for database access testing)
- Python 3.12+ installed

### Tasks

#### 3.1 — Project Scaffold (Week 1)

```bash
mkdir -p ~/projects/oscar-ai && cd ~/projects/oscar-ai
python3.12 -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn[standard] httpx openai pydantic pydantic-settings \
            sqlalchemy pymysql pyyaml python-dotenv alembic
pip install -D pytest pytest-asyncio httpx black ruff mypy
```

**Directory structure:**
```
oscar-ai/
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
├── config.yaml                 # AI provider config (committed with placeholder values)
├── .env.example                # Secrets template (never commit .env)
├── alembic.ini
├── alembic/                    # AI service's own DB migrations
│   ├── env.py
│   └── versions/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, lifespan events, CORS, middleware
│   ├── config.py               # Load config.yaml + env vars
│   ├── providers/              # AI provider abstraction
│   │   ├── __init__.py
│   │   ├── base.py             # LLMProvider abstract base class
│   │   ├── ollama_cloud.py     # Ollama Cloud (OpenAI-compatible API)
│   │   ├── ollama_local.py     # Local Ollama instance
│   │   ├── openai_compat.py    # Any OpenAI-compatible endpoint
│   │   └── factory.py          # Provider factory (config → provider instance)
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py          # SQLAlchemy async session management
│   │   └── oscar_models/       # Read-only models of Oscar's schema
│   │       ├── __init__.py
│   │       ├── demographic.py
│   │       ├── encounter.py
│   │       ├── drug.py
│   │       ├── allergy.py
│   │       ├── lab.py
│   │       ├── billing.py
│   │       └── referral.py
│   ├── routes/                 # REST API endpoints
│   │   ├── __init__.py
│   │   ├── intake.py
│   │   ├── scribe.py
│   │   ├── workflow.py
│   │   ├── prescription.py
│   │   ├── lab_order.py
│   │   ├── referral.py
│   │   ├── billing.py
│   │   └── health.py           # Health check endpoint
│   ├── services/               # Business logic (one per module)
│   │   ├── __init__.py
│   │   ├── patient_intake.py
│   │   ├── scribe.py
│   │   ├── transcription.py
│   │   ├── workflow_engine.py
│   │   ├── prescription.py
│   │   ├── lab_order.py
│   │   ├── referral.py
│   │   └── billing.py
│   ├── prompts/                 # LLM prompt templates (versioned)
│   │   ├── __init__.py
│   │   ├── intake_system.txt
│   │   ├── intake_user.txt
│   │   ├── scribe_system.txt
│   │   ├── scribe_user.txt
│   │   ├── workflow_system.txt
│   │   ├── prescription_system.txt
│   │   ├── lab_order_system.txt
│   │   ├── referral_system.txt
│   │   └── billing_system.txt
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validation.py       # HCN validation, PHN check-digit, etc.
│   │   ├── templates.py        # Prompt loader with variable substitution
│   │   └── audit.py            # Audit logging
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py              # API key validation
│       └── audit_logging.py     # Request/response logging middleware
└── tests/
    ├── conftest.py              # Shared fixtures
    ├── test_providers.py
    ├── test_services/
    │   ├── test_patient_intake.py
    │   ├── test_scribe.py
    │   └── test_billing.py
    └── test_routes/
```

#### 3.2 — Multi-Provider Abstraction (Week 1-2)

`app/providers/base.py`:
```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

@dataclass
class ChatMessage:
    role: str       # "system", "user", "assistant"
    content: str

@dataclass
class ChatResponse:
    content: str
    model: str
    usage: dict     # token counts

class LLMProvider(ABC):
    """All AI calls go through this interface."""

    @abstractmethod
    async def chat(
        self,
        model: str,
        messages: list[ChatMessage],
        temperature: float = 0.3,
        max_tokens: int = 4096,
        response_format: str | None = None,  # "json_object" for structured output
    ) -> ChatResponse:
        """Send a chat completion request. Returns structured response."""
        ...

    @abstractmethod
    async def embed(self, model: str, text: str) -> list[float]:
        """Get text embedding vector."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Verify the provider is reachable and models are available."""
        ...
```

`app/providers/factory.py`:
```python
from .base import LLMProvider
from .ollama_cloud import OllamaCloudProvider
from .ollama_local import OllamaLocalProvider
from .openai_compat import OpenAICompatProvider

def create_provider(config: dict) -> LLMProvider:
    mode = config["ai_provider"]["mode"]
    provider_config = config["ai_provider"][mode]

    provider_map = {
        "cloud": OllamaCloudProvider,
        "local": OllamaLocalProvider,
        "openai": OpenAICompatProvider,
    }

    if mode not in provider_map:
        raise ValueError(f"Unknown provider mode: {mode}")

    return provider_map[mode](provider_config, config["ai_provider"]["models"])
```

Each provider implementation:
- `OllamaCloudProvider` — targets `https://api.ollama.com/v1` (OpenAI-compatible endpoint)
- `OllamaLocalProvider` — targets `http://localhost:11434/v1` (no auth required)
- `OpenAICompatProvider` — arbitrary base URL, API key auth (covers Azure, Groq, etc.)

**Acceptance criteria:**
- Unit test: each provider responds to `chat()` with a valid `ChatResponse`
- Unit test: `embed()` returns a float list
- Integration test: switching `config.yaml` mode restarts the service with the correct provider
- Error handling: provider timeout, auth failure, model not found all return structured errors

#### 3.3 — Oscar Database Read Models (Week 2-3)

These are **read-only** SQLAlchemy models that map to Oscar's existing MySQL tables. They never write to Oscar's database directly (writes go through Oscar's REST API).

```python
# app/db/oscar_models/demographic.py
from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Demographic(Base):
    __tablename__ = "demographic"
    __table_args__ = {"schema": "oscar"}  # or whichever schema Oscar uses

    demographic_no = Column(Integer, primary_key=True)
    first_name = Column(String(30))
    last_name = Column(String(30))
    hin = Column(String(12))         # Health Insurance Number (PHN)
    hc_type = Column(String(4))      # "BC", "ON", etc.
    dob = Column(Date)
    sex = Column(String(1))
    address = Column(String(60))
    city = Column(String(25))
    province = Column(String(2))
    postal = Column(String(6))
    phone = Column(String(15))
    phone2 = Column(String(15))
    email = Column(String(100))
    chart_no = Column(String(30))
    provider_no = Column(String(6))   # Family doctor
    roster_status = Column(String(10))
    date_joined = Column(Date)
```

Similar read models for: `casemgmt_note` (encounter notes), `drugs` (prescriptions), `allergies`, `patientLabRouting` (lab results), `billing_on_cheader1` (billing), `consultationRequests` (referrals), `casemgmt_issue` (problem list), `measurements` (vitals).

**Acceptance criteria:**
- `SELECT` queries work against a running Oscar database
- No write operations (enforced by read-only DB user or application-level guard)
- Models cover all fields needed by AI prompts

#### 3.4 — Prompt Template System (Week 2-3)

```python
# app/utils/templates.py
from string import Template
from pathlib import Path

class PromptLoader:
    """Loads and renders prompt templates with variable substitution."""

    def __init__(self, prompts_dir: str = "app/prompts"):
        self.prompts_dir = Path(prompts_dir)
        self._cache: dict[str, str] = {}

    def load(self, name: str) -> str:
        if name not in self._cache:
            path = self.prompts_dir / name
            if not path.exists():
                raise FileNotFoundError(f"Prompt template not found: {name}")
            self._cache[name] = path.read_text()
        return self._cache[name]

    def render(self, name: str, **variables) -> str:
        template = Template(self.load(name))
        return template.safe_substitute(**variables)
```

Prompts are plain text files (`.txt`) with `${variable}` placeholders. Version controlled in git. No prompts are hardcoded in Python.

Example `app/prompts/intake_system.txt`:
```
You are a clinical data extraction assistant for a Canadian medical clinic.
Extract structured patient registration data from unstructured text.

Rules:
- OHIP/PHN numbers: validate format (province-specific)
- Dates: always YYYY-MM-DD
- Unknown fields: leave as empty string, do not guess
- Addresses: separate into street, city, province, postal_code
- Postal codes: Canadian format A1A1A1
- Phone numbers: strip formatting, store as digits only

Return ONLY valid JSON. No explanations, no markdown.
```

#### 3.5 — FastAPI Application (Week 3-4)

`app/main.py`:
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import load_config
from .providers.factory import create_provider
from .middleware.audit_logging import AuditLoggingMiddleware
from .routes import intake, scribe, billing, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load config, create provider, verify connections
    config = load_config()
    app.state.config = config
    app.state.provider = create_provider(config)
    yield
    # Shutdown: close connections
    await app.state.provider.close()

app = FastAPI(
    title="Oscar AI Engine",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Clinics' Oscar domains — restrict in production
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(AuditLoggingMiddleware)

app.include_router(health.router, tags=["health"])
app.include_router(intake.router, prefix="/api/v1/intake", tags=["intake"])
app.include_router(scribe.router, prefix="/api/v1/scribe", tags=["scribe"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["billing"])
# Additional routers added as modules are built
```

**Docker setup:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  oscar-ai:
    build: .
    ports:
      - "8081:8000"
    env_file: .env
    volumes:
      - ./config.yaml:/app/config.yaml
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Acceptance criteria:**
- `GET /health` returns `{"status": "healthy", "provider": "ollama_cloud"}`
- `POST /api/v1/intake/parse` with sample text returns structured JSON (even if it's a mock response initially)
- Docker container starts and serves the API
- Audit middleware logs every request/response with timestamps

#### 3.6 — Prompt Testing Harness (Week 4-5)

Build a test utility that evaluates prompt effectiveness:

```python
# tests/test_prompt_eval.py
import pytest
from app.utils.templates import PromptLoader

# Test cases: (input_text, expected_json_keys)
INTAKE_TEST_CASES = [
    (
        "John Smith, born Jan 15 1975, 416-555-1234, 123 Main St Toronto ON M5V2L7, OHIP 1234567890",
        ["first_name", "last_name", "dob", "phone", "address", "city", "province", "postal_code", "health_card_number"]
    ),
    (
        "Mary O'Brien, DOB: 2005-03-22, no phone listed, allergy to penicillin",
        ["first_name", "last_name", "dob", "allergies"]
    ),
]

def test_intake_prompt_extracts_expected_fields():
    """Each test case should produce JSON with the expected keys."""
    loader = PromptLoader()
    for text, expected_keys in INTAKE_TEST_CASES:
        rendered = loader.render("intake_user.txt", user_input=text)
        # This tests the template renders correctly
        # Actual LLM testing is done in integration tests against a running provider
        for key in expected_keys:
            assert f"${key}" not in rendered  # No unresolved variables
```

**Acceptance criteria:**
- Prompt templates load without errors
- Template variable substitution works (no `${unresolved_var}` in output)
- Integration tests against a running LLM provider validate end-to-end extraction

### Deliverables
- Python FastAPI service running in Docker
- Multi-provider abstraction with cloud, local, and OpenAI-compatible implementations
- Read-only SQLAlchemy models for Oscar's database
- Versioned prompt templates
- Health check, audit logging, and error handling infrastructure
- Test suite with unit tests and prompt evaluation harness

---

## Phase 4: AI Smart Intake — First Integrated Feature

**Timeline:** Months 5-7
**Team:** 1-2 developers
**Goal:** The AI Smart Intake feature is working end-to-end: staff pastes text → AI extracts fields → review screen → patient created in Oscar. This is the first feature that proves the AI + Oscar integration works.

### Prerequisites
- Phase 1 complete (Java 17, Spring MVC REST endpoint available)
- Phase 2 complete (React build pipeline, design system)
- Phase 3 complete (AI service running, intake prompt working)

### Tasks

#### 4.1 — AI Service: Intake Endpoint (Week 1-2)

`app/routes/intake.py`:
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

class IntakeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)

class IntakeResponse(BaseModel):
    first_name: str = ""
    last_name: str = ""
    dob: str | None = None
    phone: str = ""
    address: str = ""
    city: str = ""
    province: str = ""
    postal_code: str = ""
    health_card_number: str = ""
    hcn_valid: bool | None = None
    allergies: list[str] = Field(default_factory=list)
    reason_for_visit: str = ""
    confidence: float = 0.0  # 0-1 overall confidence
    field_confidence: dict[str, float] = Field(default_factory=dict)

@router.post("/parse", response_model=IntakeResponse)
async def parse_intake(request: IntakeRequest):
    """Extract structured patient data from unstructured text."""
    try:
        result = await intake_service.parse(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

`app/services/patient_intake.py`:
```python
from app.providers.factory import get_provider
from app.utils.templates import PromptLoader
from app.utils.validation import validate_hcn
import json

async def parse(text: str) -> dict:
    provider = get_provider()
    loader = PromptLoader()

    system_prompt = loader.load("intake_system.txt")
    user_prompt = loader.render("intake_user.txt", user_input=text)

    response = await provider.chat(
        model=provider.models["extraction"],
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,           # Low temperature for structured extraction
        response_format="json_object",
    )

    data = json.loads(response.content)

    # Validate health card number if present
    if data.get("health_card_number"):
        data["hcn_valid"] = validate_hcn(data["health_card_number"])

    return data
```

#### 4.2 — Oscar: Intake REST Endpoint (Week 1-2)

Add to `AiBridgeController.java`:

```java
@PostMapping("/patient")
public ResponseEntity<Map<String, Object>> createPatientFromAi(
        @RequestBody AiIntakeRequest request) {

    // Validate the clinician is authenticated
    LoggedInInfo loggedInInfo = LoggedInInfo.get();

    // Create demographic record
    Demographic demographic = new Demographic();
    demographic.setFirstName(request.getFirstName());
    demographic.setLastName(request.getLastName());
    demographic.setHin(request.getHealthCardNumber());
    demographic.setDob(parseDate(request.getDob()));
    demographic.setPhone(request.getPhone());
    demographic.setAddress(request.getAddress());
    demographic.setCity(request.getCity());
    demographic.setProvince(request.getProvince());
    demographic.setPostal(request.getPostalCode());
    demographic.setProviderNo(loggedInInfo.getLoggedInProviderNo());

    demographicDao.save(demographic);

    // Create allergy records if any
    if (request.getAllergies() != null) {
        for (String allergy : request.getAllergies()) {
            Allergy a = new Allergy();
            a.setDemographicNo(demographic.getDemographicNo());
            a.setDescription(allergy);
            a.setEntryDate(new Date());
            allergyDao.save(a);
        }
    }

    // Audit: track that this patient was created via AI intake
    auditLog("AI_INTAKE", demographic.getDemographicNo(),
             "Patient created via AI Smart Intake. Confidence: " + request.getConfidence());

    Map<String, Object> result = new HashMap<>();
    result.put("demographic_no", demographic.getDemographicNo());
    result.put("status", "created");
    return ResponseEntity.ok(result);
}
```

#### 4.3 — React: Smart Intake Component (Weeks 2-4)

`oscar-ui/src/entries/ai-intake.tsx`:

The component has three states:
1. **Input** — textarea + "Parse with AI" button
2. **Review** — parsed fields displayed in a form with confidence indicators
3. **Confirmed** — success message with patient ID

```typescript
interface IntakeState {
  step: 'input' | 'review' | 'confirmed';
  rawText: string;
  parsed: IntakeResponse | null;
  editedFields: Partial<IntakeResponse>;
  submitting: boolean;
  error: string | null;
}

function SmartIntake() {
  const [state, setState] = useState<IntakeState>({
    step: 'input',
    rawText: '',
    parsed: null,
    editedFields: {},
    submitting: false,
    error: null,
  });

  const handleParse = async () => {
    setState(s => ({ ...s, error: null }));
    try {
      const res = await fetch('/api/v1/ai/intake/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: state.rawText }),
      });
      const data = await res.json();
      setState(s => ({ ...s, step: 'review', parsed: data }));
    } catch {
      setState(s => ({ ...s, error: 'Failed to parse. Check AI service is running.' }));
    }
  };

  const handleConfirm = async () => {
    setState(s => ({ ...s, submitting: true }));
    const payload = { ...state.parsed, ...state.editedFields };
    await fetch('/api/v1/ai/patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setState(s => ({ ...s, step: 'confirmed', submitting: false }));
  };

  // Render logic for each step...
}
```

**Key UX details:**
- Each field shows a confidence badge (green = high, yellow = medium, red = low)
- Low-confidence fields are highlighted and the user must confirm them
- Duplicate detection: before confirming, query existing patients by name+DOB and show a warning if a potential duplicate exists
- Health card validation: show checkmark or X next to PHN field
- Undo: user can go back to the input step and edit the raw text

#### 4.4 — Oscar JSP Integration (Week 4)

Modify `src/main/webapp/demographic/demographicadd.jsp`:
- Add a new tab "Quick Add (AI)" next to the existing registration form
- When selected, load the AI intake React bundle
- The bundle renders into `<div id="ai-intake-root"></div>`

**Minimal JSP change (non-breaking):**
```jsp
<%-- Add inside the existing tab structure --%>
<li class="tab">
    <a href="#ai-intake">Quick Add (AI)</a>
</li>

<%-- New tab content --%>
<div id="ai-intake" class="tab-content">
    <div id="ai-intake-root"></div>
    <script src="<%=request.getContextPath()%>/js/oscar-ui/ai-intake.bundle.js"></script>
</div>
```

#### 4.5 — End-to-End Testing (Weeks 5-6)

**Test scenarios:**
1. Parse complete patient details → all fields extracted → patient created
2. Parse partial details → some fields empty → user fills manually → patient created
3. Parse with invalid PHN → validation warning shown → user corrects → patient created
4. Parse duplicate patient → warning shown → user confirms or cancels
5. AI service unavailable → error message shown → user falls back to manual form
6. Parse non-English text → graceful handling

### Deliverables
- Working AI Smart Intake — from text to patient record in Oscar
- React component embedded in Oscar's patient registration JSP
- Duplicate detection with warning
- Health card validation
- End-to-end test results for 6 scenarios

---

## Phase 5: AI Billing Code Suggestion

**Timeline:** Months 7-8
**Team:** 1 developer
**Goal:** After an encounter note is finalized, the AI suggests billing codes. The clinician accepts (or rejects) with one click. Codes flow into the billing form.

### Prerequisites
- Phase 4 complete (proven AI + Oscar integration)
- Phase 3 complete (billing prompt templates exist)

### Tasks

#### 5.1 — AI Service: Billing Suggestion Endpoint

`app/routes/billing.py`:
```python
class BillingSuggestRequest(BaseModel):
    encounter_text: str           # Full SOAP note text
    diagnosis_codes: list[str]    # ICD-10 codes from encounter
    provider_no: str              # For learning preferences
    demographic_no: int           # Patient context

class BillingSuggestion(BaseModel):
    code: str                     # e.g., "00100" (BC MSP fee code)
    description: str
    fee: float
    confidence: float
    rationale: str                # Why this code applies

class BillingSuggestResponse(BaseModel):
    suggestions: list[BillingSuggestion]
    generated_by: str             # Model name

@router.post("/suggest", response_model=BillingSuggestResponse)
async def suggest_billing_codes(request: BillingSuggestRequest):
    # 1. Deterministic lookup: search billing DB by diagnosis codes
    db_matches = await search_billing_db(request.diagnosis_codes)

    # 2. LLM analysis for edge cases and complex encounters
    llm_suggestions = await llm_billing_analysis(
        request.encounter_text,
        request.diagnosis_codes,
        db_matches,
        request.provider_no,
    )

    # 3. Merge: DB matches get higher confidence, LLM fills gaps
    return merge_billing_suggestions(db_matches, llm_suggestions)
```

**Integration with Oscar's billing data:**
- Read BC MSP fee codes from `billing_on_cheader1` and `billingservice` tables
- Cross-reference diagnosis codes with allowed billing codes
- Learn from provider's historical billing patterns

#### 5.2 — React: Billing Suggester Component

A compact component rendered inside the encounter JSP page, displayed after the encounter note is finalized. Shows 2-4 suggested billing codes with confidence scores, accept/reject buttons, and total estimated fee.

#### 5.3 — Billing Form Integration

The Oscar billing form (`billing/CA/BC/billingentry.jsp`) already exists. The AI component calls an Oscar REST endpoint that pre-fills the billing form fields. The clinician reviews and submits as normal.

### Deliverables
- AI billing code suggestion from encounter notes
- Integration with existing BC MSP billing module
- React component in encounter page

---

## Phase 6: AI Scribe

**Timeline:** Months 8-14
**Team:** 1-2 developers
**Goal:** The flagship feature. Audio captured during patient encounters → transcribed in real-time → SOAP note generated → billing codes suggested → clinician reviews and finalizes. One-click finalize writes everything to Oscar.

### Prerequisites
- Phase 4 complete (AI integration patterns proven)
- Phase 5 complete (billing code suggestion)
- Phase 2 complete (React components can live in JSP pages)

### Tasks

#### 6.1 — Audio Capture (Weeks 1-3)

Browser-based recording using the MediaRecorder API:

```typescript
// oscar-ui/src/hooks/useAudioRecorder.ts
export function useAudioRecorder() {
  const [state, setState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [transcript, setTranscript] = useState('');
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 16000, channelCount: 1 }
    });
    mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    // Connect WebSocket for real-time transcription
    socketRef.current = new WebSocket('ws://localhost:8081/api/v1/scribe/transcribe');
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTranscript(prev => prev + ' ' + data.text);
    };

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(event.data);
      }
    };

    mediaRecorder.current.start(500); // 500ms chunks for low-latency streaming
    setState('recording');
  };

  return { state, transcript, start, stop, pause, resume };
}
```

#### 6.2 — Real-Time Transcription Service (Weeks 1-4)

Support two transcription backends (configurable):

1. **Deepgram Nova-2** (cloud) — Medical model, speaker diarization, real-time WebSocket streaming
2. **Whisper** (local) — Self-hosted, no external service dependency

The transcription service streams partial results back to the browser via WebSocket so the clinician sees what's being transcribed in real-time.

#### 6.3 — SOAP Note Generation (Weeks 2-6)

After recording ends, the full transcript + patient context → clinical LLM → structured SOAP note:

```python
# app/services/scribe.py
async def generate_clinical_note(
    transcript: str,
    patient_context: PatientContext,
    provider_preferences: dict | None = None,
) -> SOAPNote:

    system_prompt = loader.render("scribe_system.txt", **patient_context.to_dict())
    user_prompt = loader.render("scribe_user.txt", transcript=transcript)

    response = await provider.chat(
        model=provider.models["clinical"],
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        response_format="json_object",
    )

    soap = SOAPNote.from_json(response.content)
    return soap
```

The `patient_context` includes:
- Demographics (name, age, sex)
- Active problem list
- Current medications
- Allergies
- Recent lab results (last 6 months)
- Last 3 encounter notes (for continuity)

#### 6.4 — Clinician Review Interface (Weeks 6-10)

A React panel in the encounter page with four sections:

1. **Transcript** — raw transcript, editable, with speaker labels
2. **SOAP Note** — Subjective, Objective, Assessment, Plan fields, each editable
3. **Billing Codes** — suggested codes from Phase 5 (accept/reject)
4. **Action Items** — prescriptions, labs, referrals (Phase 7 preview)

One-click **"Finalize"** calls Oscar's REST API to:
- Save the SOAP note to `casemgmt_note` table
- Attach billing codes to the encounter's billing form
- Create follow-up tasks (ticklers)
- Log to audit trail

**Patient consent workflow:**
- Config setting: `require_patient_consent_for_scribe` (default: true)
- Before recording starts, a consent prompt appears (configurable text)
- Consent recorded in audit log

#### 6.5 — Integration Testing (Weeks 10-16)

Rigorous testing of the end-to-end flow:
1. Mock patient encounters with known transcripts → verify SOAP note accuracy
2. Test with different clinical scenarios (routine checkup, complex chronic disease, mental health)
3. Test edge cases: poor audio quality, multiple speakers, long silences, medical terminology
4. Test with different LLM providers (cloud vs local)
5. Validate PHI handling: no patient data logged to external services (audit check)

### Deliverables
- Browser-based audio capture with real-time transcription display
- SOAP note generation from encounter transcripts
- Clinician review interface with editable fields
- One-click finalize to Oscar
- Patient consent workflow
- Integration test suite with clinical scenarios

---

## Phase 7: AI Workflow Prediction + Prescription & Lab Automation

**Timeline:** Months 14-18
**Team:** 1 developer
**Goal:** From the encounter assessment, AI predicts what the clinician needs to do next and presents it as an approval queue. Prescription and lab order suggestions are validated against drug interactions, allergies, and renal function.

### Prerequisites
- Phase 6 complete (AI scribe working, note generation proven)

### Tasks

#### 7.1 — Workflow Prediction Engine

From the encounter diagnosis + assessment, the AI predicts:
- Prescriptions needed (drug, dose, route, frequency, duration)
- Lab tests needed (which tests, why, urgency)
- Referral needed (specialty, urgency)
- Follow-up timing
- Patient education materials

Each prediction includes:
- Confidence score
- Rationale
- Safety checks applied (drug interactions, allergies, renal dosing)

#### 7.2 — Prescription Suggestion Service

```python
async def suggest_prescription(diagnosis: str, patient: PatientContext) -> list[PrescriptionSuggestion]:
    # 1. Evidence-based lookup: which drugs are indicated for this diagnosis?
    candidates = await drug_lookup(diagnosis)

    # 2. LLM for contextual recommendation
    suggestions = await llm_prescription(diagnosis, patient, candidates)

    # 3. Safety checks (deterministic, not LLM)
    for s in suggestions:
        s.interactions = check_drug_interactions(s.drug, patient.medications)
        s.allergy_check = check_allergies(s.drug, patient.allergies)
        s.renal_check = check_renal_dosing(s.drug, s.dose, patient.egfr)
        s.pregnancy_check = check_pregnancy_category(s.drug, patient.pregnant)

    return suggestions
```

#### 7.3 — Provider Preference Learning

Record every override (clinician chose something different from AI suggestion):

```sql
CREATE TABLE ai_workflow_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_no VARCHAR(6) NOT NULL,
    demographic_no INT NOT NULL,
    encounter_id INT,
    predicted_action JSON,       -- What the AI suggested
    actual_action JSON,           -- What the clinician did
    accepted BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_provider_time (provider_no, timestamp)
);
```

Over time, the AI learns: "Dr. Smith prefers Metformin XR over immediate release" or "Dr. Jones only refers to endocrinology if A1C > 9."

### Deliverables
- Workflow prediction panel in the encounter page
- Prescription suggestion with drug interaction, allergy, and renal checks
- Lab order suggestion from encounter context
- Provider preference learning (logged, not yet used for personalization until sufficient data exists)
- Integration with Oscar's existing prescription (`oscarRx`) and lab requisition (`FormLabReq07`) workflows

---

## Phase 8: AI Referral Management + Population Health + CDS

**Timeline:** Months 18-22
**Team:** 1 developer
**Goal:** Automated referral lifecycle from draft to closed-loop. Population health dashboards. Clinical decision support at the point of care.

### Prerequisites
- Phase 7 complete (workflow prediction works)
- Phase 1 complete (Flyway migration tooling for new tables)

### Tasks

#### 8.1 — Referral Tracking Database

```sql
-- Flyway migration: V002__referral_tracking.sql
CREATE TABLE referral_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consultation_request_id INT,        -- Links to existing consultationRequests table
    demographic_no INT NOT NULL,
    referring_provider_no VARCHAR(6) NOT NULL,
    referred_to_name VARCHAR(255),
    referred_to_fax VARCHAR(20),
    referred_to_address TEXT,
    specialty VARCHAR(100),
    status ENUM('draft','sent','received','appointment_booked','completed','cancelled') DEFAULT 'draft',
    sent_date DATETIME,
    follow_up_date DATETIME,
    completed_date DATETIME,
    outcome_notes TEXT,
    urgency ENUM('routine','urgent','emergency') DEFAULT 'routine',
    channel VARCHAR(50) DEFAULT 'fax',   -- 'fax', 'hl7', 'secure_email', 'oscar_to_oscar'
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_demographic (demographic_no),
    INDEX idx_provider (referring_provider_no),
    INDEX idx_status (status),
    INDEX idx_followup (follow_up_date),
    INDEX idx_overdue (status, follow_up_date)
);
```

#### 8.2 — AI Referral Generation

- Drafts referral letter from encounter data + patient history
- Specialist matching: suggests best specialist based on diagnosis, location, and past referral patterns
- Multi-channel delivery: fax (eFax API), HL7 messaging, secure email
- Dashboard shows all referrals with status, overdue flags, and batch actions

#### 8.3 — Population Health & CDS

- Chronic disease registries powered by Oscar's existing disease registry tables
- Care gap identification: overdue screenings, missed follow-ups
- AI-prioritized recall lists
- Clinical decision support: inline suggestions during encounters, leveraging the existing Drools CDS engine (`org.oscarehr.decisionSupport`)

### Deliverables
- Referral tracking table and AI draft generation
- Referral dashboard (React standalone page)
- Population health dashboards
- CDS suggestions integrated with existing Oscar CDS infrastructure

---

## Phase 9: FHIR Interoperability + Compliance Readiness

**Timeline:** Year 2+ (Months 22-30)
**Team:** 1 developer
**Goal:** Oscar data is available as FHIR R4 resources. The AI service has a FHIR API. The system is ready for Bill S-5 compliance and provincial health information exchange requirements.

### Prerequisites
- Phase 8 complete (core AI features built)
- Phase 1 complete (modern REST patterns established)

### Tasks

#### 9.1 — FHIR R4 Resources

Oscar already has HAPI FHIR 5.7.9 as a dependency and existing FHIR code under `org.oscarehr.integration.fhir`. This phase extends that to expose key resources:

- `Patient` — from `demographic` table
- `Observation` — vitals, lab results from `measurements`, `patientLabRouting`
- `Condition` — active problems from `casemgmt_issue`
- `MedicationRequest` — prescriptions from `drugs`
- `Procedure` — from encounter data
- `ServiceRequest` — lab orders, referrals
- `DocumentReference` — encounter notes, uploaded documents

#### 9.2 — FHIR API for the AI Service

The AI service exposes its outputs as FHIR resources for integration with provincial systems:
- AI-generated encounter notes → `DocumentReference`
- Referral letters → `ServiceRequest` + `DocumentReference`
- Billing suggestions → `Claim` (when FHIR financial module support matures)

#### 9.3 — Compliance Documentation

- Data Processing Agreement (DPA) template for cloud mode
- PIPEDA/PHIPA compliance checklist
- Audit log export for clinic compliance officers
- Data retention policy documentation
- Sub-processor disclosure template

### Deliverables
- FHIR R4 API for patient, observation, condition, medication, and document resources
- FHIR bridge between AI service and provincial health information exchanges
- Compliance documentation package for clinics

---

## Appendix A: Consolidated Directory Structure

After all phases, the project will have three repositories:

### 1. Oscar (Java WAR — modified in-place)
```
oscar/
├── pom.xml                          # Java 17, updated dependencies
├── src/main/java/
│   └── org/oscarehr/
│       ├── ws/
│       │   ├── rest/                # Existing CXF REST (unchanged)
│       │   └── spring/              # New Spring MVC REST controllers
│       │       ├── AiBridgeController.java
│       │       ├── AiIntakeController.java
│       │       └── ...
│       └── aiclient/                # Java client for AI service
│           └── AiClient.java
├── src/main/webapp/
│   ├── js/oscar-ui/                 # Built React bundles
│   │   ├── ai-intake.bundle.js
│   │   ├── ai-scribe.bundle.js
│   │   └── billing-suggester.bundle.js
│   └── WEB-INF/
│       ├── struts-config.xml        # Extended with AI action mappings
│       └── applicationContextAI.xml # Spring MVC context for AI endpoints
├── src/main/resources/
│   └── db/migration/                # Flyway migrations (new tables only)
│       ├── V001__ai_scribe_session.sql
│       ├── V002__referral_tracking.sql
│       └── V003__ai_workflow_log.sql
└── docs/
    ├── development_setup.md
    └── architecture_notes.md
```

### 2. oscar-ai (Python FastAPI — new repository)
```
oscar-ai/
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
├── config.yaml
├── .env.example
├── alembic.ini
├── alembic/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── providers/
│   ├── db/
│   ├── routes/
│   ├── services/
│   ├── prompts/
│   ├── utils/
│   └── middleware/
└── tests/
```

### 3. oscar-ui (React + TypeScript — new repository)
```
oscar-ui/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── entries/
│   ├── design-system/
│   ├── clinical/
│   ├── hooks/
│   └── theme/
├── dist/                            # Built bundles
└── .storybook/
```

---

## Appendix B: Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Oscar won't build on Java 17 | Medium | High | Stay on Java 11 if 17 fails. Defer jakarta migration. |
| Local Maven repo jars have no replacement | High | Medium | Accept local_repo for now. Isolate behind a facade so they can be replaced later. |
| Struts 1 and Spring MVC conflict | Low | Medium | Different URL namespaces (`*.do` vs `/api/*`). No overlap. |
| LLM hallucination produces clinical errors | Medium | Critical | Human-in-the-loop always. Confidence thresholds. Audit trail. |
| Clinics reject cloud AI (privacy) | Medium | High | Multi-provider from day 1. Local mode available. DPA template. |
| Oscar upstream changes break AI integration | Low | Medium | AI reads Oscar's DB directly (schema is stable). REST API endpoints are additive. |
| Transcription quality insufficient for clinical use | Medium | High | Test with real clinical audio early (Phase 6). Have Whisper fallback. |
| Team burnout due to scope | Medium | High | No hard deadlines. Phases are independent — can pause between them. |
| Bill S-5 mandates FHIR before Oscar is ready | Low | High | FHIR is Phase 9 (Year 2+). If timeline compresses, move FHIR earlier (after Phase 4). |

---

## Appendix C: Testing Strategy

### Unit Tests (Automated, CI)
- **Java:** JUnit tests for all new REST controllers and service classes
- **Python:** pytest for all AI service routes, services, and utilities
- **React:** Vitest + React Testing Library for components
- Run on every commit via CI

### Integration Tests (Automated, CI)
- **AI provider:** Test each provider with known inputs, verify outputs
- **Oscar REST API:** Test new endpoints against a running Oscar instance
- **AI → Oscar:** End-to-end test from AI service to Oscar database (read)
- Run on PR against staging environment

### Clinical Accuracy Tests (Manual, per-phase)
- **Prompt evaluation:** Run known clinical scenarios through AI, have a clinician review outputs
- **Edge cases:** Non-English speakers, complex multi-condition patients, pediatric/geriatric
- **Regression:** When prompts change, re-run the test suite to verify no degradation
- Run at the end of each AI phase, before declaring the feature complete

### Security Tests (Automated + Manual)
- PHI not logged to external services (audit middleware test)
- API key validation rejects unauthorized requests
- Database user has read-only access to Oscar tables
- Audit trail records all AI actions with timestamps

### Performance Tests (Manual, Phase 6+)
- Transcription: latency < 2 seconds for partial results
- SOAP note generation: < 10 seconds for a 15-minute encounter
- Concurrent users: AI service handles 5 simultaneous scribe sessions

---

## Appendix D: CI/CD Architecture

```
GitHub (or Bitbucket)
├── oscar (Java) repo
│   ├── PR → Build + Unit Tests (Java 17, Maven)
│   └── Merge to main → Build WAR → Deploy to staging
├── oscar-ai (Python) repo
│   ├── PR → Lint (ruff) + Type Check (mypy) + Unit Tests (pytest)
│   └── Merge to main → Build Docker image → Deploy to staging
└── oscar-ui (React) repo
    ├── PR → Lint (ESLint) + Type Check (tsc) + Unit Tests (Vitest) + Storybook build
    └── Merge to main → Build bundles → Commit to oscar repo's webapp/js/
```

**Staging environment:** A single VM running Oscar (Tomcat) + Oscar AI (Docker) + MySQL. Used for integration testing and demo.

**Production deployment:** For clinics, this is a Docker Compose stack installed on their server. Updates are pulled via `docker compose pull && docker compose up -d`.

---

## Appendix E: Prompt Template Versioning

All LLM prompts live in `oscar-ai/app/prompts/` as `.txt` files, versioned in git.

**Change process:**
1. Edit the `.txt` file
2. Run `python -m pytest tests/test_prompt_eval.py` to verify prompt still produces expected output structure
3. If a new prompt version significantly changes behavior, create `prompt_v2.txt` and keep the old one for A/B testing
4. Each prompt file header includes version, date, author, and test coverage notes

**Prompt template format:**
```
# Prompt: Intake Extraction (System)
# Version: 1.0
# Last updated: 2026-06-01
# Test coverage: tests/test_prompt_eval.py::test_intake_extraction
# Notes: Temperature should be 0.1 for structured extraction

You are a clinical data extraction assistant...
```

---

## Appendix F: Key Codebase Artifacts (Existing Oscar)

These are the existing Oscar components that the AI layer integrates with. They are referenced throughout this plan and should not be modified unless necessary.

| Artifact | Path | Integration |
|----------|------|-------------|
| **Struts config** | `src/main/webapp/WEB-INF/struts-config.xml` | Add AI action mappings for new JSP pages |
| **CXF REST** | `org.oscarehr.ws.rest.*` | Existing API patterns — new endpoints follow these conventions |
| **DemographicDao** | `org.oscarehr.common.dao.DemographicDao` | Patient lookup, duplicate detection |
| **CaseManagementNoteDAO** | `org.oscarehr.casemgmt.dao.CaseManagementNoteDAO` | Encounter note storage (AI writes here) |
| **DrugDao / DrugReasonDao** | `oscar.oscarRx.data.*` | Prescription interaction checking |
| **AllergyDao** | `org.oscarehr.common.dao.AllergyDao` | Allergy cross-reference for drug safety |
| **ConsultationRequestDao** | `org.oscarehr.consultations.*` | Referral tracking (extended, not replaced) |
| **Billing DAOs** | `org.oscarehr.billing.CA.BC.*` | BC MSP billing code lookup |
| **Tickler DAOs** | `org.oscarehr.ticklers.*` | Follow-up task creation |
| **Drools CDS Engine** | `org.oscarehr.decisionSupport.*` | Clinical decision support rules (extended for AI suggestions) |
| **FHIR Integration** | `org.oscarehr.integration.fhir.*` | Existing FHIR resources (DSTU2/STU3/R4) |
| **HL7 Integration** | Various under `org.oscarehr.integration.*` | Lab/prescription/referral outbound messaging |

---

## Appendix G: Effort Summary by Phase (1-2 Developers)

| Phase | Calendar Months | Key Deliverable | Value to Clinics |
|-------|----------------|-----------------|------------------|
| 0 | 1 | Running Oscar + docs | Foundation |
| 1 | 3 | Java 17, CI/CD, Flyway | Faster builds, fewer bugs |
| 2 | 3 | Design system, React in JSPs | Modern UI foundation |
| 3 | 3 | AI service, multi-provider | AI infrastructure |
| 4 | 2 | Smart Intake | 3-5 min → 15 sec per registration |
| 5 | 2 | Billing Code Suggestion | $10K-30K/yr per physician |
| 6 | 6 | AI Scribe | 4-6 hrs/day saved per clinician |
| 7 | 4 | Workflow + Rx + Labs | 8-15 clicks → 2 clicks per prescription |
| 8 | 4 | Referrals + Pop Health + CDS | Zero lost referrals, proactive care |
| 9 | 8 | FHIR + Compliance | Bill S-5 ready, provincial exchange |
| **Total** | **~30 months** | | |

**Note:** Phases 1-3 run in parallel (overlapping timelines). The total calendar estimate of 24-30 months accounts for this overlap. Phases 4-9 are sequential (each builds on the previous).

---

## Appendix H: Prerequisites Check

| Prerequisite | Status | Action |
|-------------|--------|--------|
| Java 8 JDK | Required | Install `openjdk-8-jdk` |
| Java 17 JDK | Required for Phase 1 | Install `openjdk-17-jdk` |
| Python 3.12+ | Required for Phase 3 | Install via `deadsnakes` PPA or pyenv |
| Node.js 20+ | Required for Phase 2 | Install via `nvm` or nodesource |
| Docker | Required for Phase 3+ | Install Docker Engine |
| MySQL 8.0 | Required for Phase 0 | Install locally or use Docker |
| Oscar source | Present | `~/projects/oscar` already cloned |
| IDE | Recommended | IntelliJ IDEA or Eclipse for Java, VS Code for Python/React |
