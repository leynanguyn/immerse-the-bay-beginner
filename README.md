# Aila VR Therapy – WebXR Companion for Pico 4

> Submission for the Stanford XR Demo hackathon. Aila is a spatial wellbeing companion built for open WebXR headsets like the Pico 4, blending embodied 3D presence with on-device voice capture and OpenAI-powered, real-time conversational therapy.

The experience places a calming therapy robot in a room-scale scene, lets participants select their preferred tone of care, and streams live audio bi-directionally so conversations feel colocated—whether you are testing on desktop or inside the Pico Browser/Wolvic on a Pico 4 headset.

## Hackathon Snapshot
- **Theme focus:** Accessible mental health support delivered through consumer VR hardware
- **Primary headset:** Pico 4 running a WebXR-capable browser (Pico Browser or Wolvic)
- **Fallback:** Responsive 2D layout for laptops/tablets so judges can review without a visor
- **Interaction model:** Hand tracking + controller events bridged through WebXR, plus mouse/keyboard mirroring on desktop
- **Key differentiator:** Live tone shifting + embodied AI therapist anchored to a photorealistic clearing with spatial audio

## Experience Highlights
- **Tone-aware assistant:** Choose Friendly, Soft, or Analytical modes; UI, prompts, and speech prosody update immediately.
- **Forest immersion:** Physical-based directional lights, fog, and ambient cues keep the session grounded and comfortable.
- **Embodied robot guide:** `public/models/robot.glb` is spatially anchored, scaled for room presence, and bound to a spatial audio source.
- **Realtime speech pipeline:** `src/audio/*` handles microphone capture, VAD gating, PCM16 encoding, and playback of OpenAI Realtime responses.
- **Session memory bridge:** `src/api/sessionApi.ts` persists summaries/transcripts to the backend so each intake resumes smoothly.
- **Graceful fallback:** When WebXR is unavailable the dashboard + 3D preview run in any browser so demos remain judge-friendly.

## Architecture Overview
```text
React 19 + Vite 7 (TypeScript)
  ├─ XR shell (src/xr/*)        → manages WebXR sessions, controller events, spatial layout + audio anchors
  ├─ Spatial UI (src/components)→ XR dashboard, tone selector, forest + robot scenes powered by @react-three/fiber
  ├─ Therapy state (app-shell)  → orchestrates idle/intake/active therapy flows
  ├─ Audio pipeline (src/audio) → mic capture, VAD, PCM encoding, playback of OpenAI Realtime responses
  └─ Session API (src/api)      → REST calls to backend for session start/end + health checks
```

## Local Development & Demo Instructions
### 1. Requirements
- Node.js 18+
- npm 10+
- A Pico 4 (or any WebXR headset) with Wolvic or the stock Pico Browser
- Local network access so the headset can reach your laptop dev server

### 2. Install dependencies
```bash
npm install
```

### 3. Desktop/Web testing
```bash
npm run dev
# Visit http://localhost:5173 for the responsive fallback experience
```

### 4. Testing on Pico 4 over WebXR
1. Find your laptop IP address on the same Wi-Fi network as the headset.
2. Run Vite with HTTPS + host binding so the Pico browser accepts the secure WebXR session:
   ```bash
   npm run dev -- --host 0.0.0.0 --https --port 5173
   ```
   The project already includes `@vitejs/plugin-basic-ssl`, so certificates are auto-generated.
3. On the headset, open Wolvic/Pico Browser and navigate to `https://<YOUR_LAN_IP>:5173`.
4. Grant microphone + motion permissions when prompted. The WebXR overlay should activate, placing the robot in-front of you.

> Tip: If the headset complains about an invalid certificate, use the browser’s "proceed" option or install the generated cert via the Pico settings.

### 5. Production builds
```bash
# Standard web bundle for deployment
npm run build

# Preview the production build locally
yarn preview  # or npm run preview
```
Host the contents of `dist/` on any HTTPS origin that the headset can reach.

### Environment variables
Create a `.env` file (copy `.env.example` if available) and configure the backends:
```bash
VITE_API_URL=http://localhost:3002      # REST session service
VITE_WS_URL=ws://localhost:3001         # WebSocket/WebRTC bridge that proxies to OpenAI Realtime
```
These values are consumed throughout `src/api/*`, `src/audio/*`, and `src/xr/*`.

### npm scripts reference
| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server for desktop + headset testing |
| `npm run dev -- --host 0.0.0.0 --https` | Desktop dev server exposed to Pico 4 over LAN with secure WebXR |
| `npm run build` | Production bundle for static hosting |
| `npm run build:avp` | Legacy WebSpatial build (kept for reference, not required for Pico) |
| `npm run build:ipa` | Historical Vision Pro IPA path (unused in Pico workflow) |
| `npm run run:avp` | Legacy WebSpatial simulator launcher (unused unless targeting visionOS again) |
| `npm run lint` | ESLint with React/TypeScript presets |
| `npm run preview` | Serves the `dist/` folder locally for smoke tests |

## Packages & Frameworks Used
- **React 19 / React DOM 19** – UI + state orchestration
- **Three.js 0.181 + @react-three/fiber/drei/xr** – Rendering pipeline, XR interactions, GLB/GLTF helpers
- **WebXR Polyfill** – Allows desktop browsers to simulate XR APIs for fallback testing
- **@webspatial/core-sdk & @webspatial/react-sdk** – Spatial UI primitives, XR context helpers, and utilities we reused while pivoting to Pico
- **@webspatial/vite-plugin & @vitejs/plugin-basic-ssl** – Ensures `/webspatial/avp/` builds and HTTPS dev servers; still useful for secure WebXR hosting
- **@google/model-viewer** – USDZ/GLB previewing for marketing captures
- **Vite 7 + TypeScript 5.9** – Build tooling and type safety for the XR hooks
- **ESLint 9 + `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`** – Linting + DX quality gates

## Assets & Media
- `public/models/robot.glb` – Primary therapist robot rendered via `ImmersiveRobot` (supports Pico scale)
- `public/models/ILA_Chatbot_1116011010_texture.usdz` – USDZ companion for AR Quick Look / promos
- `public/icon-1024.png`, `public/icon-512.png`, `public/icon-192.png` – Icon set for manifests/shortcuts
- `public/vite.svg`, `src/assets/react.svg` – Placeholder vector art for fallback web layouts
- `public/Info.plist` – Historic visionOS config (retained for completeness)

## AI & Backend Services
- **OpenAI Realtime API** – Multimodal therapist brain; microphone buffers (24 kHz PCM16) are streamed via WebSocket and generated speech is rendered through `audioPlayback.ts`.
- **Voice Activity Detector (`src/audio/vad.ts`)** – WebAudio-based VAD that reduces latency + token usage by gating OpenAI traffic.
- **Session Service (`VITE_API_URL`)** – REST API that logs session metadata, tone selection, and transcripts for continuity between therapy visits.
- **WebSocket Bridge (`VITE_WS_URL`)** – Companion service that multiplexes microphone chunks, robot responses, and telemetry between the headset and OpenAI.

## Project Structure
```
webspatial-client/
├── src/
│   ├── api/                # REST clients for session lifecycle + health checks
│   ├── app-shell/          # Therapy state machine + provider
│   ├── audio/              # Mic capture, VAD, audio playback, pipeline docs
│   ├── components/         # 2D + spatial UI (dashboards, tone selectors, XR helpers)
│   ├── xr/                 # WebXR session manager, spatial layout helpers, spatial audio
│   ├── assets/             # Static SVG/logo assets used in the fallback UI
│   ├── main.tsx            # React entry point that wires XR + therapy context
│   └── App.tsx             # Feature composition + WebXR fallback logic
├── public/                 # Manifest, Info.plist, icons, GLB/USDZ models
├── vite.config.ts          # Vite + HTTPS configuration for WebXR
├── tsconfig*.json          # TypeScript build targets
└── eslint.config.js        # Flat config for linting React/TypeScript + XR code
```

## Troubleshooting Tips
- **Headset cannot reach dev server:** Ensure your laptop firewall allows inbound 5173 traffic and both devices share the same network.
- **WebXR session fails to start:** Double-check that you loaded the HTTPS endpoint and granted motion + spatial tracking permissions in the headset browser.
- **Audio not streaming:** Confirm microphone permissions on the headset and verify that `VITE_WS_URL` is reachable from the LAN.
- **Controller/hand tracking mismatch:** Use the Pico browser’s WebXR debugging UI to switch input profiles or use the desktop fallback for demos.

## License
This project is distributed under the [MIT License](LICENSE).
