# Akasha-Link (Mobile Capture App) Specification

This document details the specification for the Akasha-Link mobile companion app, built on top of the technical ideas in `akasha_mobile_capture_tid.md` and the contract in `mobile-capture-contract.md`. 


## Detailed Specification

### 1. App Architecture & Stack
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand (for global UI state), MMKV or SQLite (for persistent Outbox queue)
- **Camera & Scanning:** `react-native-document-scanner-plugin` (handles edge detection, perspective correction, B&W threshold)
- **Cloud Client:** `aws-sdk-client-s3` (configured for Cloudflare R2)

### 2. Core Workflows

#### A. Onboarding (First Launch)
Since this is a personal app, onboarding is minimal but essential for security and routing:
1. On first launch, the user is directed to the **Settings** screen.
2. The user inputs their Cloudflare R2 credentials (Endpoint, Bucket, Access Key, Secret Key). These are saved securely on the device.
3. The app generates an Expo Push Token and displays it with a "Copy" button. The user copies this token and pastes it into their desktop `.env` file (`EXPO_PUSH_TOKEN`).

#### B. Schema Synchronization (Foreground)
On app launch (after onboarding), the app attempts to fetch `akasha-schema.json` from the R2 bucket using the saved credentials.
- Caches the schema locally.
- Provides autocomplete options for `Domain` and `MOC` when creating a session.

#### C. Document Capture (Session Mode)
1. User taps "New Capture".
2. The Document Scanner launches. The user takes N photos of a math proof.
3. **Manual Adjustment Phase:** For each scanned page, the user is presented with a UI to manually adjust the detected boundaries, apply/tweak B&W filters, and ensure the text is highly readable for the Vision LLM. The user can also reorder or delete pages in this step.
4. User enters the Session Metadata screen:
   - Selects **Domain** (e.g., `math`).
   - Selects **MOC(s)** (e.g., `linear-algebra`).
5. App generates a `session_id` (e.g., `math_20260630T210500Z`).
6. App packages the images and manifest, storing them in the local **Outbox (SQLite/MMKV)**.

#### D. Outbox & Syncing (Upload Architecture)
The app uses an Outbox UI for syncing, allowing the user to manually trigger or monitor syncs, with foreground auto-syncing as a fallback. Syncing mechanics must be carefully designed to prevent race conditions and overlapping uploads.
1. **Sync State & Locking:** The Outbox maintains a global `isSyncing` lock to prevent multiple sync operations from running simultaneously (e.g., if the user taps "Sync Now" while an auto-sync is processing).
2. **Strict Upload Atomicity:** The PKM daemon polls R2 for the presence of JSON manifests to begin processing. To prevent the daemon from pulling an incomplete session, the mobile app strictly enforces upload order:
   - **Step 1:** Upload all `{session_id}_page{N}.jpg` files to `images/` concurrently or sequentially.
   - **Step 2:** *Only* if Step 1 fully succeeds without errors, upload the `{session_id}.json` manifest to `manifests/`. 
3. **Idempotency and Partial Failures:** If a session upload fails midway (e.g., image 1 uploads, but image 2 fails), the state remains "uploading" or "failed". On the next sync attempt, the app safely re-attempts the upload of all images (overwriting any existing ones in R2, as S3 PUT is idempotent) before uploading the manifest.
4. **Cleanup:** Once the manifest is uploaded successfully, the session is marked as "completed" and local image files are deleted to free up device storage.

### 3. Screen Requirements

- **Camera / Scanner View:** Integrates the document scanner plugin.
- **Capture Review & Tagging:** 
  - Thumbnail gallery of captured pages.
  - Dropdowns (powered by cached schema) to select Domain and MOCs.
  - "Save to Outbox" button.
- **Outbox / Dashboard:** 
  - Lists pending uploads and past uploads.
  - Shows sync status (e.g., "Uploading...", "Offline").
  - Displays the current Expo Push Token for the user to copy.
- **Settings:**
  - Inputs for R2 Endpoint, Bucket Name, Access Key, and Secret Key.

### 4. Data Models

**Session Queue Item (Local SQLite/MMKV)**
```typescript
interface SessionQueueItem {
  sessionId: string;
  timestamp: string;
  domain: string;
  mocs: string[];
  imagePaths: string[]; // local URIs
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}
```

**Manifest (Uploaded to R2)**
```json
{
  "session_id": "math_20260630T210500Z",
  "timestamp": "2026-06-30T21:05:00Z",
  "images": [
    "math_20260630T210500Z_page1.jpg"
  ],
  "domain": "math",
  "mocs": ["linear-algebra"]
}
```

### 5. Push Notification Handling
- On app load, `expo-notifications` retrieves the device's Expo Push Token.
- The app displays this token in the Settings or Outbox screen for the user to manually add to their desktop `.env`.
- The app listens for incoming notifications. If a notification with `type: "parse_failure"` and a specific `session_id` arrives, the app flags the corresponding session in the Outbox as "Failed" and alerts the user to rescan.

### 6. Development Sprints

**Sprint 1: Foundation & Onboarding**
- Setup Expo project and Expo Router.
- Build the Settings screen for onboarding (R2 credentials form).
- Implement secure local storage for credentials.
- Generate and display Expo Push Token for manual desktop `.env` syncing.

**Sprint 2: Cloud Sync & Local Stores**
- Implement `aws-sdk-client-s3` integration for Cloudflare R2.
- Fetch and cache `akasha-schema.json`.
- Setup Zustand for UI state and SQLite/MMKV for the Outbox queue data model.
- Build the schema autocomplete dropdown logic.

**Sprint 3: Document Scanner & Capture Flow**
- Integrate `react-native-document-scanner-plugin`.
- Build the Capture flow (Camera launch, multi-page snapping).
- Build the manual adjustment UI (cropping, B&W filters).
- Build the Session Metadata screen (Domain/MOC tagging) and wire it to save to the Outbox.

**Sprint 4: Outbox & Upload Mechanics**
- Build the Outbox UI (list pending/completed sessions).
- Implement the sync logic (global `isSyncing` lock).
- Implement strict upload atomicity (upload all images, then manifest).
- Handle push notification listeners to update Outbox states on `parse_failure`.

**Sprint 5: Polish & E2E Validation**
- Refine app aesthetics (colors, typography, transitions).
- End-to-end testing with the local `akasha-pkm` daemon.
