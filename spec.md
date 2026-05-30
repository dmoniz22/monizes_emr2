# Oscar EMR: AI-Native Modernization — Product Specification

## 0. Project Constraints

**Team:** 1-2 developers (full-stack).

**Priority:** Modernize the Oscar foundation first, then layer AI features on top. This is not an "AI-first" rush — it's a deliberate, incremental build that ensures the platform can sustainably support AI capabilities.

**Key principle:** Every phase must produce a deployable, testable increment. No big-bang releases. No "we'll finish the foundation in 6 months and then show value." Each phase delivers value clinics can use.

**No hard deadlines** — quality and correctness over speed. Clinical software has zero tolerance for errors.

---

## 1. Product Vision

Oscar McMaster is Canada's most widely deployed open-source EMR, running in thousands of clinics. Its clinical functionality is mature, but its user experience is frozen in 2006 — JSP pages, manual workflows, no intelligence.

**The product:** An AI layer that sits on top of Oscar, transforming it from a passive data-entry system into an active clinical assistant. No fork of Oscar required — this is an add-on that clinics install alongside their existing Oscar deployment.

**Value proposition for clinics:**
- Reduce documentation time by 60-80% (AI scribe)
- Eliminate billing leakage (AI code suggestion catches missed codes)
- Never lose track of a referral again (automated tracking)
- Fewer clicks, fewer errors, less burnout
- No migration — works with their existing Oscar install

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Clinic Network                                │
│                                                                  │
│  ┌─────────────────┐         ┌──────────────────────────────┐   │
│  │  Oscar EMR        │         │  Oscar AI Engine             │   │
│  │  (Existing WAR)   │◄──────►│  (Python FastAPI)            │   │
│  │                   │  REST  │                              │   │
│  │  - MySQL          │         │  - REST API layer            │   │
│  │  - Hibernate DAOs │         │  - LLM orchestration         │   │
│  │  - Struts/JSF     │         │  - Workflow engine           │   │
│  │  - Existing UI    │         │  - Referral tracking         │   │
│  └─────────────────┘         │  - Billing code mapper        │   │
│                               │  - FHIR bridge                │   │
│                               └──────────┬───────────────────┘   │
│                                          │                        │
│                               ┌──────────▼───────────────────┐   │
│                               │  AI Provider Abstraction      │   │
│                               │  (Config toggle: cloud/local)  │   │
│                               │                                │   │
│                               │  ┌─────────┐  ┌──────────┐   │   │
│                               │  │ Cloud   │  │ Local    │   │   │
│                               │  │ (Ollama │  │ (Ollama  │   │   │
│                               │  │ Cloud,  │  │ on-prem) │   │   │
│                               │  │ OpenAI) │  │          │   │   │
│                               │  └─────────┘  └──────────┘   │   │
│                               └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 AI Provider Abstraction (Day 1 Feature)

The AI layer is **provider-agnostic** from day one. A single config file determines where the AI runs:

```yaml
# oscar-ai-config.yaml
ai_provider:
  mode: "cloud"  # or "local"
  
  # Cloud settings (Ollama Cloud, OpenAI-compatible)
  cloud:
    base_url: "https://api.ollama.com/v1"
    api_key: "${OSCAR_AI_API_KEY}"
    models:
      clinical: "gemma4:31b"
      extraction: "qwen3.5:397b" 
      embeddings: "nomic-embed-text"
  
  # Local settings (clinic's own server)
  local:
    base_url: "http://localhost:11434/v1"
    api_key: ""  # Not needed for local
    models:
      clinical: "gemma4:31b"
      extraction: "qwen3.5:397b"
      embeddings: "nomic-embed-text"
```

**Design:** Every AI call goes through a `LLMProvider` interface:

```python
class LLMProvider(ABC):
    @abstractmethod
    def chat(self, model: str, messages: list, **kwargs) -> dict: ...
    @abstractmethod
    def embed(self, text: str) -> list[float]: ...

class OllamaCloudProvider(LLMProvider): ...
class OllamaLocalProvider(LLMProvider): ...
```

**Why this matters for selling:** Some clinics will accept cloud AI with a DPA. Others (hospitals, health authorities) will legally require on-prem. With this abstraction, both customers get the exact same product — just a different config file.

### 2.3 Oscar Integration Pattern

The AI layer does **not** modify Oscar's source code. Instead:

1. The AI service communicates with Oscar via its **existing REST API** + direct database reads
2. New Oscar REST endpoints are added (minimal Java changes, packaged as a plugin/module)
3. The AI writes back to Oscar's MySQL database directly (for performance-sensitive writes)
4. The Oscar UI gets new AI panels via **embedded React micro-frontends** injected into JSP pages

This means:
- No fork. No merge conflicts with upstream Oscar releases.
- Clinics can upgrade Oscar independently of the AI layer
- The AI layer can support older Oscar versions

---

## 3. Module Specifications

### 3.1 AI Smart Intake

**Problem:** Adding a patient requires 40+ fields across multiple tabs. Takes 3-5 minutes per patient.

**Solution:** A single text box. Staff paste or type the patient's details. AI extracts and fills the form.

**User flow:**
```
1. Staff clicks "Quick Add" tab on registration page
2. Types/pastes: "Sarah Jones, DOB June 3 1990, 
   604-555-1234, 456 Oak St Vancouver V6B1A1, 
   PHN: 9876-543-21-BC. Allergies: sulfa. 
   Reason: annual physical"
3. Clicks "Parse" → AI extracts all fields
4. Review screen shows parsed data with confidence indicators
5. Staff confirms → patient created in 15 seconds
```

**Technical:**
- AI: Structured extraction via LLM (qwen3.5:397b)
- Validation: OHIP/PHN check-digit + fuzzy duplicate detection
- Duplicate matching: name + DOB similarity against existing demographic table
- Fallback: if confidence < 85%, show partial results + manual fill

**Estimated impact:** 2-5 min → 15-30 seconds per patient registration

---

### 3.2 AI Scribe (Ambient Clinical Documentation)

**Problem:** Clinicians spend 4-6 hours/day on documentation. This is the #1 cause of physician burnout in Canada.

**Solution:** Real-time AI scribe that listens to the encounter and generates structured clinical notes, billing codes, and action items.

**User flow:**
```
1. Clinician opens encounter page, clicks "Start AI Scribe"
2. (Get patient consent — configurable)
3. Records audio during the patient interaction
4. Clinician says "End encounter" → AI processes
5. Within seconds: SOAP note, ICD-10 codes, billing codes,
   suggested prescriptions, lab orders, referrals
6. Clinician reviews, edits as needed, clicks "Finalize"
7. Note saved to Oscar. Codes attached to billing.
```

**Key design decisions:**
- **Real-time transcription:** Uses Deepgram Nova-2 or Whisper for live captioning during encounter. Clinician can see what's being transcribed.
- **Note generation:** Full transcript + patient context sent to clinical LLM (gemma4:31b) for SOAP note generation.
- **Human-in-the-loop always.** AI writes the draft. Clinician owns the final note.
- **Works for virtual visits too** (just route audio from video platform).
- **Patient handout:** AI generates an after-visit summary in plain language.

**Prompt architecture:**
```
System: You are a clinical scribe for Canadian family medicine.
Context: Patient {name}, age {age}, known conditions: {problem_list}
         Current meds: {medications}, Allergies: {allergies}
         Recent labs: {recent_labs}

Transcript: {transcript}

Generate structured JSON:
- subjective (patient's own words)
- objective (vitals, exam findings from transcript)
- assessment (diagnoses with ICD-10 codes)
- plan (treatments, referrals, follow-up)
- billing_suggestions (MSP fee codes with rationale)
- prescription_suggestions (drug, dose, route, frequency)
- lab_suggestions (test names, urgency)
- referral_needed (yes/no, specialty, urgency)
```

**Privacy notice for clinics:** Audio is processed in real-time and not stored after note generation. Configurable retention policy.

---

### 3.3 AI Workflow Prediction

**Problem:** A single diagnosis triggers 5-10 follow-up actions (prescriptions, lab orders, referrals, patient education, follow-up scheduling). Each requires separate navigation and input. This is where clinics lose time.

**Solution:** From the encounter assessment, the AI predicts what the clinician needs to do and presents it as an approval queue.

**Example:**
```
Encounter assessment: "Type 2 diabetes, A1C 8.2"

AI predicts:
┌──────────────────────────────────────────────────────┐
│  ✅ Recommended Actions                              │
│                                                      │
│  ☐ Prescribe: Metformin 500mg BID × 90 days   92%   │
│  ☐ Order: HbA1c, creatinine, ALT (3 months)   88%   │
│  ☐ Refer: Endocrinology                       45%   │
│  ☐ Follow-up: 3 months                         95%   │
│  ☐ Patient ed: Diabetes management package     80%   │
│                                                      │
│  [ Accept All ]  [ Review Individually ]             │
└──────────────────────────────────────────────────────┘
```

**Learning loop:** The AI records which predictions the clinician accepts vs rejects. Over time, it learns patterns: "Dr. Smith prefers metformin XR over immediate release" or "Dr. Jones handles diabetes in-house, only refers if A1C > 9."

**Integration with Oscar:** Predicted actions map directly to existing Oscar modules:
- Prescription → `oscarRx` workflow
- Lab order → `FormLabReq07` requisition
- Referral → `ConsultationRequest` flow
- Follow-up → Tickler system
- Patient education → Document attachment

---

### 3.4 AI Prescription & Lab Automation

**Problem:** Prescribing involves 8-15 clicks: search drug, select strength, enter sig, check interactions, print/fax. Lab orders are equally manual.

**Solution:** AI pre-fills the entire prescription and lab order from the encounter context. Clinician approves in 2 clicks.

**Prescription flow:**
```
AI suggestion → drug + dose + route + frequency + duration
→ Auto-check: drug interactions (existing DrugReasonDao)
→ Auto-check: allergy cross-reference (existing AllergyDao)
→ Auto-check: renal function dosing (if recent creatinine available)
→ Display: "Metformin 500mg, 1 tab PO BID with meals × 90 days"
→ Clinician: Accept → enters Rx workflow, ready to print/send
→ Clinician: Modify → inline edit then approve
```

**Lab order flow:**
```
AI suggestion from clinical context
→ Maps to existing FrmLabReqPreSet (pre-set lab panels)
→ Pre-fills: patient info, billing, clinical indication
→ Clinician: Accept → ready for print/electronic send
```

**e-Prescribing path:** Integrate with PrescribeIT (Canada's national e-prescribing network) via HL7 or FHIR. This requires pharmacy registration but eliminates printed/faxed prescriptions entirely.

---

### 3.5 AI Referral Management

**Problem:** Referrals are typed manually, sent by fax, and followed up by phone calls. Clinics lose track of referrals constantly.

**Solution:** End-to-end automated referral lifecycle.

```
Clinical trigger → AI drafts referral
                → AI suggests specialist (from referral patterns + directories)
                → Sends via: fax API / HL7 / secure message
                → Creates tracking record
                → Follow-up at N days (configurable per specialty)
                → Escalation if no response
                → Outcome logged → closed-loop
```

**Features:**
- **AI draft generation:** Fills referral template from encounter data + patient history
- **Specialist matching:** Learns referral patterns per clinic, suggests best specialist based on diagnosis + location + wait times
- **Multi-channel delivery:** Fax (eFax), HL7 messaging, secure email, OSCAR-to-OSCAR
- **Status dashboard:** Sent → Received → Appointment booked → Consult complete → Outcome received
- **Auto-follow-up:** Default 30 days. Configurable per specialty. Escalates to admin if no response.
- **Closed-loop:** Referring clinician notified when consult result is received
- **Analytics:** Referral volumes, wait times, no-show rates, most-referred specialists

---

### 3.6 AI Billing Code Suggestion

**Problem:** BC MSP billing codes change annually. Clinicians must remember codes for every visit type. Missed codes = $10,000-30,000/year in lost revenue per physician.

**Solution:** AI suggests the correct billing code(s) from the encounter note + diagnosis.

**Integration:** Maps encounter content → MSP fee schedule → suggested codes. Clinician sees them alongside the encounter note and accepts with one click. The codes automatically flow into the billing form.

**BC-specific:** Uses existing `org.oscarehr.billing.CA.BC.*` module. The AI simply selects from what's already there.

---

### 3.7 Population Health & Panel Management

**Problem:** Clinics have hundreds of patients with chronic conditions but no systematic way to track who's due for what.

**Solution:** AI-powered registry that identifies care gaps and generates recall lists.

**Features:**
- Chronic disease registries: Diabetes, Hypertension, COPD, CKD, Depression
- Preventive care gaps: Mammogram due, colonoscopy overdue, immunization needed
- AI-prioritized recall: "These 20 diabetic patients are overdue for A1C — sorted by time overdue"
- Automated recall letters/emails (clinic approves batch → AI sends)
- Integration with BC screening programs (BC Cancer screening, etc.)

---

### 3.8 Clinical Decision Support (CDS)

**Problem:** Best-practice guidelines change constantly. Clinicians can't stay current.

**Solution:** AI provides evidence-based recommendations at the point of care, inline with the encounter.

**Examples:**
- "Patient is 50 and never had a colonoscopy → suggest FIT/FOBT screening"
- "This patient has diabetes and hypertension → suggest ACE inhibitor (First-line per CHEP guidelines)"
- "Drug interaction detected: warfarin + NSAID → warn about bleeding risk"

**Sources:** Choosing Wisely Canada, Canadian Medical Association guidelines, RxFiles drug comparison, BC Guidelines.

---

## 4. Privacy & Compliance (Selling to Canadian Clinics)

### 4.1 Data Residency

| AI Mode | Patient Data Location | Suitable For |
|---------|----------------------|--------------|
| Local | Clinic's own server | Hospitals, health authorities, privacy-sensitive clinics |
| Cloud (Canada) | Canadian data center | Clinics accepting cloud with DPA |
| Cloud (US) | US data center | Not recommended for Canadian healthcare |

### 4.2 Required Legal Documents for Cloud Mode
- Data Processing Agreement (DPA) compliant with PIPEDA/PHIPA
- Cloud provider must store data in Canada
- Sub-processor list disclosed to clinics
- Right to audit clause

### 4.3 Product-Level Privacy Controls
- Configurable: which modules use AI (clinician opts in per module)
- Audio recording requires patient consent (configurable default)
- Audit log: every AI prediction logged with timestamp, clinician, action taken
- Data retention: transcripts/configurable auto-delete after note finalization
- No PHI in LLM training data: all prompts are zero-shot, no fine-tuning on patient data

---

## 5. Business Model

### 5.1 Pricing (Recommendation)

| Tier | Price | Features | AI Mode |
|------|-------|----------|---------|
| **Starter** | $299/mo/clinic | AI scribe + billing codes + smart intake | Cloud |
| **Professional** | $599/mo/clinic | Everything + workflow prediction + prescriptions + labs | Cloud or local |
| **Enterprise** | Custom | Everything + referral tracking + population health + CDS + FHIR | Local preferred |

### 5.2 Installation & Support
- One-time setup: Docker Compose stack alongside existing Oscar
- No migration required: AI reads from existing Oscar database
- Remote setup support included
- Monthly updates: model improvements, new clinical guidelines

### 5.3 Competitive Advantage
- **Not a new EMR:** Clinics keep Oscar. No migration cost, no retraining.
- **Lowest-risk AI entry:** No fork. Plug-in architecture.
- **Canadian-specific:** BC billing codes, Ontario lab formats, Canadian guidelines.

---

## 6. Development Roadmap

> **Team constraint:** This roadmap is sized for 1-2 developers. Timelines assume the modernization foundation is in place before AI features are layered on top. All estimates are calendar months, not person-months — a 2-person team can parallelize within phases but not across them.

| Phase | Features | Duration | Depends On |
|-------|----------|----------|------------|
| **Phase 0** | Environment setup, Oscar build, codebase documentation, AI service skeleton | 1 month | Nothing |
| **Phase 1** | Java 8→17 migration, build modernization, database migration hygiene | 2-3 months | Phase 0 |
| **Phase 2** | Frontend foundation: design system, React build pipeline, first embedded component | 2-3 months | Phase 0 (can parallel with Phase 1) |
| **Phase 3** | AI service core: multi-provider abstraction, prompt templates, Oscar DB read models | 3 months | Phase 0 (can parallel with Phase 1-2) |
| **Phase 4** | AI Smart Intake (first integrated feature) | 2 months | Phase 1 + 2 + 3 |
| **Phase 5** | AI Billing Code Suggestion | 1-2 months | Phase 4 |
| **Phase 6** | AI Scribe (audio → SOAP note) | 4-6 months | Phase 4 |
| **Phase 7** | AI Workflow Prediction + Prescription/Lab automation | 3-4 months | Phase 6 |
| **Phase 8** | AI Referral Management + Population Health + CDS | 3-4 months | Phase 7 |
| **Phase 9** | FHIR interoperability layer + compliance readiness | 6-8 months | Phase 8 |

**Total calendar estimate: 24-30 months for 1-2 developers.** Each phase produces a deployable increment — clinics can receive value at every stage, not just at the end.

---

## 7. Existing Oscar Infrastructure (Reuse, Not Rebuild)

| Oscar Component | Used For |
|----------------|----------|
| `DemographicDao` | Patient lookup, duplicate detection |
| `DrugDao`, `DrugReasonDao` | Prescription interaction checking |
| `ConsultationRequestDao` | Referral tracking storage |
| `CaseManagementNoteDAO` | Encounter note storage |
| `AllergyDao` | Allergy cross-reference |
| `FormLabReq07Dao` | Lab order templates |
| `oscarBilling.CA.BC.*` | BC billing code database |
| `tickler.*` | Task/notification creation |
| `oscarWorkflow.*` | Rules engine (Drools) |
| `org.oscarehr.ws.rest.*` | REST API patterns |
| HL7 integration classes | Lab/prescription outbound |

---

## 8. Market Validation — CMAJ 2026 Environmental Scan

A study published in the *Canadian Medical Association Journal* in May 2026 provides timely validation of exactly the problems this product solves. Key findings:

### 8.1 The Interoperability Crisis (Your Opportunity)

**"Near-universal EHR adoption (95% of physicians) and yet interoperability remains limited."**

Canada has the adoption. What's missing is the *intelligence layer* on top. Clinics have Oscar running — they just need it to work smarter.

### 8.2 Key Barriers That Map Directly to Oscar AI Modules

| CMAJ Barrier | Oscar AI Solution | Module |
|-------------|-------------------|--------|
| **"Data exchange between primary care and specialists heavily dependent on fax or mailed letters"** | Automated referral generation + electronic sending + tracking + follow-up | **Referral Management** |
| **"Limited system analytics using EHR data — overwhelmingly basic"** | Population health dashboards with AI-prioritized recall lists, care gap identification | **Population Health** |
| **"Low physician digital literacy and resistance to change"** | AI reduces clicks, not adds them. Scribe saves hours/day. Clinicians adopt tools that save time Day 1. | **AI Scribe, Workflow Prediction** |
| **"No obligation for vendors to share data or conform to common standards"** | FHIR API layer makes Oscar's data accessible to provincial systems, hospitals, pharmacies | **FHIR Interoperability** |
| **"Inconsistent data and workflow standards across jurisdictions"** | AI adapts to provincial billing codes (BC, ON, etc.), lab formats (LifeLabs, BC Bio), referral patterns | **All modules (Canada-specific)** |
| **"Privacy and cybersecurity concerns cause organizations to default to restricting data access"** | Provider-agnostic AI (cloud or local). Clinics choose. Local mode keeps all PHI on-prem. | **AI Provider Abstraction** |

### 8.3 The Legislative Tailwind

**Bill S-5** (Connected Care for Canadians Act) was reintroduced February 2026. It will:
- **Prohibit vendor data blocking** — Oscar can't lock clinics into proprietary interfaces
- **Mandate interoperability standards** — FHIR will become a requirement, not an option
- **Create demand for exactly what this product offers** — clinics will need to comply, and an AI layer with FHIR support positions them ahead of the regulation

The product's FHIR API strategy (Phase 9 of the implementation plan) directly prepares clinics for this. Earlier phases build the REST API foundation that FHIR resources will layer on top of.

### 8.4 Market Size Signal

- **40+ distinct community EHR systems in BC alone** — Oscar is one of them, and it's the only open-source one
- **95% of Canadian physicians use an EHR** — massive addressable market
- **47% of Canadians have accessed their health information electronically** — the other 53% is growth potential through patient portal enhancements

### 8.5 Strategic Implication

The CMAJ study's conclusion: **"Canada has invested heavily in EHR adoption but neglected the interoperability and intelligence layer."** That's the product. Not another EMR. The intelligence layer that makes Canada's decade of EHR investment actually pay off for clinicians.

---

## 9. Codebase Modernization (Not Just AI)

The AI layer is the product. But to sell it effectively, the underlying app also needs modernization — clinics won't pay for AI that sits on top of a slow, ugly, 2006-era interface. The modernization is **foundational** for the AI features to feel like an upgrade, not a patch.

### 9.1 Is Java the Right Language?

**Yes, for the core EMR.** Java + Spring + Hibernate is the industry standard for enterprise healthcare systems (Epic, Cerner, PointClickCare). It has:
- The best HL7/FHIR library ecosystem (HAPI FHIR is already a dependency)
- Proven reliability under high concurrent load (100+ clinic staff)
- Strong typing for data models that map to clinical concepts
- Mature ORM for the complex relational schema (200+ tables)
- Existing Oscar codebase = 4,600 Java files, 200+ DAOs, full billing logic

**No, for the AI layer.** Python is right for AI (FastAPI microservices). The AI talks to Oscar via REST API + direct DB reads — it's a separate process, not a language debate.

**No, for the frontend.** TypeScript/React or Vue for the modern UI layer. The old JSPs stay until replaced module-by-module.

**No language rewrite of Oscar.** That would be a 2-3 year redo with zero customer value until complete. Instead: keep the battle-tested Java core, modernize it incrementally, and build everything new (AI + frontend) in the right languages from the start.

### 9.2 Backend Modernization

**Current problems (confirmed by codebase audit):**
- Struts 1.2.7 (dead framework, no updates since 2008) with 3,093-line struts-config.xml
- Spring 3.1.0 + Hibernate 3.4.0 (both EOL) with 16 XML application context files
- Java 8 (EOL since 2019) — codebase uses `javax.*` namespace, no `jakarta.*` support
- Monolithic WAR — all 4,600 Java files in one deployment unit with circular package dependencies
- Logic spread across `org.oscarehr.*`, `oscar.*`, `org.caisi.*`, `com.quatro.*` — 4 root packages from merged projects
- Local Maven repository (`local_repo/`) for proprietary jars no longer in Maven Central
- 777 database migration scripts spanning 2006-2025 — no tooling for automated migrations (no Flyway/Liquibase)

**Realistic strategy for 1-2 developers:** A full Spring Boot 3 migration is not feasible in the near term. Instead, the modernization follows a **strangler fig pattern** — modern code is added around the legacy core, which continues to function unchanged.

**Phase 1 — Stabilize and upgrade in-place (Months 1-4):**
- Java 8 → Java 17 (pom.xml changes, fix compilation, handle `javax.*` → `jakarta.*` for Tomcat 10)
- Replace local Maven repo jars with Maven Central equivalents where possible
- Add Flyway for database migration management alongside existing SQL scripts
- Introduce a modern REST endpoint pattern (Spring MVC `@RestController`) alongside existing CXF endpoints
- Establish CI/CD pipeline with automated build and test

**Phase 2 — Incremental framework migration (Months 5-12+):**
- New features use Spring MVC controllers, not Struts actions
- Struts 1 continues to run for legacy pages (parallel coexistence)
- Add an `oscar-ai-client` Java module for AI service communication
- Gradually extract shared DAOs into a common package (no module boundary yet)

**Phase 3 — Modular monolith (Year 2+):**
- Extract `oscar-core` (entities + DAOs) as a Maven module when dependency graph is clean enough
- Extract `oscar-rest-api` as a separate module
- Full Spring Boot 3 migration only after Struts 1 is fully sunset

**Why not Spring Boot 3 immediately:** The codebase has 16 Spring XML context files interwoven with Struts 1, a custom Hibernate 3.4 persistence layer, OAuth 1.0a interceptors, and dependency cycles between legacy packages. A "mechanical" migration would break production functionality. The strangler fig approach means the clinic never experiences downtime and every modernization step is independently deployable.

**Estimated backend modernization: 12-18 months total** for a 1-2 person team, done incrementally alongside AI feature development.

### 9.3 Frontend Modernization

**Current problems (confirmed by codebase audit):**
- 1,750 JSP files with inline Java scriptlets, inline CSS, and scattered JavaScript
- Dojo Toolkit (abandoned by IBM) + jQuery snippets — no coherent JS framework
- No responsive design — separate mobile app exists as a workaround
- Form-based interaction: submit → full page reload → repeat
- 920 JavaScript files with no module system, bundler, or dependency management
- No component library — every page invents its own UI patterns

**Strategy — React Micro-Frontend Injection:**

The React code compiles to standalone JS bundles that Oscar's JSP pages load via `<script>` tags. Each bundle renders into a specific `<div>` element within the JSP. This means no Oscar build changes are needed to ship new React components.

```
Phase 1: Embed React components in existing JSPs via <div id="ai-root">
         Single JS bundle loaded per page. React handles only the AI panel.
         Used for: AI Scribe panel, billing suggester, smart intake widget.

Phase 2: Ship entire page sections as React components.
         The JSP provides layout chrome (header, nav, footer).
         React handles the interactive content area.
         Used for: encounter notes workspace, referral dashboard.

Phase 3: (Year 2+) Optionally rebuild as full SPA with legacy JSP fallback.
```

**Build pipeline (simple, no Oscar build integration needed):**
```
oscar-ui/
├── package.json
├── tsconfig.json
├── vite.config.ts          # Vite builds each entry point as a separate bundle
├── src/
│   ├── entries/            # One entry per JSP page that gets a React component
│   │   ├── ai-intake.tsx
│   │   ├── ai-scribe.tsx
│   │   └── billing-suggester.tsx
│   ├── components/         # Shared React components
│   ├── hooks/              # Shared hooks (API calls, auth)
│   └── design-system/      # Consistent UI primitives
└── dist/                   # Output: ai-intake.bundle.js, etc.
```

**Design system (Month 1-2, before any React feature work):**
```
design-system/
├── Button, Input, Select, Modal, Table, Card, Badge, Tabs
├── Clinical: VitalsPanel, MedicationList, AllergyBadge, ProblemList, PatientHeader
├── Layout: Sidebar, Workspace, CommandPalette
└── Theme: CSS custom properties, dark mode, clinic branding tokens
```

**Key UX improvements (beyond AI):**
- **Keyboard-first:** Power users navigate via keyboard shortcuts — no mouse required for common tasks
- **Command palette:** Cmd+K search to navigate to any patient, module, or action
- **Context-preserving navigation:** Patient context persists across module switches — patient header bar at top of every screen
- **Responsive:** Works on tablets (bedside) and desktops
- **Dark mode:** Reduces eye strain in dim clinic environments
- **Reduced cognitive load:** Surface 3 most-likely actions; hide advanced options behind "Show more"

### 9.4 Architectural Modernization Summary

| Layer | Now | Target | Timeline (1-2 devs) |
|-------|-----|--------|----------|
| **Backend language** | Java 8 + javax.* | Java 17 + jakarta.* | Months 1-4 |
| **Web framework** | Struts 1.2.7 + CXF JAX-RS | Struts + Spring MVC (parallel) | Months 4-12+ |
| **Package structure** | 4 root packages | Incremental consolidation — 1 package at a time | Months 6-18 |
| **Frontend** | JSP + Dojo + jQuery | React components embedded in JSPs | Months 3-8+ (per module) |
| **AI** | None | Python FastAPI (separate process) | Months 3+ (standalone) |
| **Deployment** | Monolithic WAR (Tomcat 8) | WAR + Docker AI sidecar | Month 1 |
| **API** | CXF REST + SOAP | CXF + new Spring MVC endpoints + FHIR R4 | Months 1-6 + Year 2 |
| **DB migrations** | 777 raw SQL scripts | Flyway-managed migrations + raw SQL for legacy | Months 1-3 |
| **Build** | Maven + local_repo jars | Maven + Maven Central + CI/CD pipeline | Months 1-3 |

### 9.5 The "Don't Scare the Clinics" Rule

Every modernization step must pass this test: **can the clinic upgrade without retraining staff?**

- New UI components go next to old ones (parallel run)
- Keyboard shortcuts work on existing forms too
- The AI features are opt-in per module
- Oscar's existing workflows never break — new features are additive
- If a clinic hates the new UI, they flip back to the old JSP with a config toggle

This is how enterprise healthcare upgrades succeed: **retain the muscle memory while offering the future.**

---

## 10. Technology Stack Summary

| Component | Technology | Why |
|-----------|-----------|-----|
| EMR backend | Java 17 + Spring Boot 3 | Battle-tested, HL7/FHIR libraries, existing Oscar codebase |
| REST API | Spring MVC + JAX-RS | Standard Java REST, existing patterns in Oscar |
| Database | MySQL 8 (same) | Oscar's existing schema, no migration needed |
| AI service | Python 3.12 + FastAPI | Best ecosystem for LLMs, STT, ML |
| Speech-to-text | Deepgram Nova-2 or Whisper | Real-time medical transcription |
| Clinical LLM | Gemma 4 31B (or equivalent) | Strong clinical reasoning, can run on-prem |
| Frontend | TypeScript + React | Component ecosystem, strong typing |
| Design system | React component library | Consistency across modules |
| Deployment | Docker Compose | Simple enough for any clinic IT |
| FHIR | HAPI FHIR (already in pom.xml) | Interoperability standard |

| Risk | Mitigation |
|------|------------|
| LLM hallucination causing clinical errors | All AI output clinician-reviewed. Confidence thresholds. Audit trail. |
| Clinicians reject AI tools | Save time Day 1. Zero friction. Opt-in per module. |
| Oscar upstream changes break integration | Read-only DB access + REST API. No source code dependency. |
| Privacy/legal challenges selling to clinics | Provider-agnostic AI (local option). DPA template. Canada-only cloud. |
| Competition from US EMR AI products | Canadian-specific (MSP codes, provincial labs, Canadian guidelines). Lower pricing. Existing Oscar install base. |
