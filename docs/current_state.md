# Stato di Fatto (Current State) - AGMS

**Data:** 06 Febbraio 2026
**Autore:** Analisi Automatica (Codebase Investigator)

## 1. High-Level Overview
**AGMS** (Agile Management System) è un'applicazione desktop multipiattaforma (Windows/macOS) progettata per aiutare i Project Manager e gli Scrum Master a monitorare la qualità dei progetti gestiti su Jira.
Il focus principale è su due aree:
1.  **SLA Tracking:** Calcolo avanzato dei tempi di reazione e risoluzione dei ticket, considerando priorità, stati di pausa e orari lavorativi.
2.  **Release Management:** Analisi delle release version (Fix Versions) di Jira per generare statistiche e note di rilascio.

## 2. Architettura Attuale

### Stack Tecnologico
*   **Core:** Electron (v28.x) con architettura multi-processo (Main/Renderer).
*   **Frontend:** React (v18), TypeScript, Vite.
*   **Styling:** Tailwind CSS (v3.4) con supporto Dark/Light mode.
*   **Data Handling:** `date-fns` per la manipolazione date, `recharts` per i grafici.
*   **Build System:** `electron-vite`, `electron-builder`.

### Struttura dei File
*   `src/main`: Logica di backend (Node.js). Gestisce IPC, accesso al file system (Storage), integrazione API Jira.
*   `src/preload`: Bridge sicuro per esporre le API di `electron` al frontend.
*   `src/renderer`: L'interfaccia utente React.
    *   `components`: Componenti UI riutilizzabili (Design System atomico: atoms/molecules/organisms).
    *   `contexts`: State management globale (ProjectContext, ThemeContext).
    *   `hooks`: Logica custom riutilizzabile.
*   `src/shared`: Tipi TypeScript condivisi tra Main e Renderer (DTO).

## 3. Mappa delle Funzionalità (Feature Inventory)

### Onboarding & Configurazione
*   **Wizard Iniziale:** Guida l'utente al primo avvio per configurare credenziali Jira e Storage.
*   **Project Management:** Creazione, modifica e switch tra progetti multipli.
*   **Configurazione SLA:** Definizione personalizzata dei target (minuti per reazione/risoluzione) per gruppi di priorità (Expedite, Critical, etc.).
*   **Personalizzazione:** Caricamento logo progetto, toggle tema scuro/chiaro.

### SLA Dashboard
*   **Importazione Dati:** Fetch dei ticket Jira tramite JQL custom.
*   **SLA Engine:**
    *   Calcolo Reaction Time (creazione -> assegnazione/in progress).
    *   Calcolo Resolution Time (creazione -> risoluzione).
    *   Gestione "Net Time": Sottrae i tempi in stati di "Pausa" e opzionalmente la pausa pranzo.
*   **Visualizzazione:**
    *   KPI Card (Total Issues, Compliance %, Met/Missed).
    *   Tabella dettagliata per singolo ticket con stato SLA.
    *   Grafici (implementazione parziale/in-progress).

### Release Management
*   **Release Fetch:** Importazione ticket basata su "Fix Version" di Jira.
*   **Release Details:** Visualizzazione lista ticket inclusi in una release.
*   **Charts:** Statistiche sulla composizione della release (per tipo, priorità).

## 4. Flussi Utente (User Flows)

### Flow 1: Primo Avvio (Onboarding)
1.  L'utente apre l'app -> Nessun progetto rilevato.
2.  **Step 1:** Inserimento URL Jira, Email, API Token -> Test Connessione.
3.  **Step 2:** Selezione cartella di storage locale (dove salvare i dati JSON).
4.  **Step 3:** Creazione primo progetto (Nome, Key Jira, Preset SLA).
5.  Fine -> Redirect alla Dashboard.

### Flow 2: Analisi SLA
1.  L'utente è sulla Dashboard SLA.
2.  Clicca "Import Issues" -> Inserisce JQL (es. `project = AGM AND created > -30d`).
3.  Il backend scarica i ticket e calcola i tempi.
4.  L'interfaccia mostra le card riassuntive e la tabella.
5.  L'utente può filtrare o analizzare ticket specifici che hanno violato l'SLA.

## 5. Analisi dei Dati

Il modello dati è basato su file JSON locali gestiti da `StorageService`.

*   **ProjectConfig:** Configurazione statica (credenziali, regole SLA).
*   **JiraIssue:** Rappresentazione raw del ticket Jira (campi, changelog per la storia degli stati).
*   **SLAIssue:** Oggetto arricchito/calcolato. Contiene:
    *   `reactionTimeMinutes`, `resolutionNetMinutes`.
    *   `segments`: Array degli intervalli temporali (es. In Progress, Pausa, Done).
    *   Flags booleani: `reactionSLAMet`, `resolutionSLAMet`.

## 6. Debito Tecnico e Incongruenze ("Vibecoding" Analysis)

1.  **Sicurezza Electron:**
    *   `sandbox: false` in `src/main/index.ts` disabilita la sandbox di Chromium. Sebbene semplifichi lo sviluppo, è un rischio di sicurezza se l'app caricasse contenuti remoti non fidati.
2.  **Gestione dello Stato (Backend):**
    *   L'uso di file JSON diretti per lo storage (simulato o tramite `electron-store`) potrebbe diventare lento con dataset grandi (migliaia di ticket). Manca un vero database locale (es. SQLite/PouchDB).
3.  **SLA Parsing Complexity:**
    *   La logica in `sla-parser.ts` e `services/ProjectService.ts` sembra gestire calcoli complessi (date, orari lavorativi) manualmente. Questo è un punto critico per bug (es. fusi orari, festività non gestite).
4.  **IPC Handlers "Fat":**
    *   In `src/main/index.ts`, gli handler fanno troppo lavoro (es. logica di business mischiata al routing). Dovrebbero delegare puramente ai Controller/Service.
5.  **Hardcoded Values:**
    *   I gruppi SLA di default sono definiti nel codice (`DEFAULT_SLA_GROUPS`), rendendo difficile la loro evoluzione senza rilasciare nuove versioni dell'app.
6.  **Error Handling UI:**
    *   Se l'import Jira fallisce o il token scade, non è chiaro come l'UI reagisca (mancano Error Boundary espliciti visibili nel codice analizzato).

---
*Documento generato automaticamente per transizione a Spec-Driven Development.*
