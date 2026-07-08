# Learnix Frontend - AI Assistant & Claude Code Rules

This file outlines the strict codebase conventions, design standards, and architecture guidelines for the **Learnix Frontend** project (Online Examination & AI-powered EdTech platform). 
ALL AI assistants (Claude Code, Gemini, Cursor) MUST strictly follow these rules when generating or refactoring code.

---

## 1. Technology Stack & Architecture

- **Framework**: Next.js 15+ (App Router, Turbopack, React 19)
- **Language**: Strict TypeScript (`noImplicitAny: true`, no `any` types allowed. Must explicitly type all component props, state, and API response models).
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`) utilizing custom CSS variables, OKLCH color spaces, and Glassmorphism.
- **UI Primitives**: Base UI (`@base-ui/react`) for accessible, unstyled headless primitives (Button, Combobox, Popover, Dialog, Tooltip, Select, etc.).
- **State Management**: Zustand (`zustand`) for global client state (Auth session, Active Exam timer, Sidebar state).
- **API Client**: Axios (`lib/api/client.ts`) configured with custom interceptors (Base URL: `/api/v1`, auto-injecting JWT Bearer tokens, handling 401 token refresh/logout).
- **Validation**: Zod (`zod`) schemas located in `lib/validations/`.
- **Notifications**: Sonner (`sonner`) for toast alerts.
- **Realtime**: Socket.io Client (`socket.io-client`) for live exam countdowns and anti-cheat monitoring.

---

## 2. Directory Organization

All code MUST adhere to this exact folder structure (matching VS Code workspace):

```text
LEARNIX-FRONTEND/
├── app/                  # Next.js App Router (Pages, Layouts, Route handlers)
│   ├── globals.css       # Tailwind v4 import, theme variables, custom animations
│   └── (routes)/         # Domain routes (e.g., login/, classrooms/, exams/, dashboard/)
├── components/           # Reusable React Components
│   ├── layout/           # Shared layout wrappers (Navbar, Sidebar, ExamHeader)
│   ├── ui/               # Atomic UI components wrapped over Base UI
│   └── [domain]/         # Domain-specific modules (e.g., exam/, classroom/, auth/, ai-plans/)
├── hooks/                # Custom React Hooks (e.g., useCountdown, useAntiCheat, useSocket)
├── lib/                  # Services and core utilities
│   ├── api/              # Axios client instance and API endpoint wrappers
│   ├── auth/             # Token storage, cookie helpers, and permission checks
│   ├── stores/           # Zustand global state stores
│   ├── utils/            # Helper functions (Tailwind `cn`, date formatters, etc.)
│   └── validations/      # Zod validation schemas for forms and API inputs
└── public/               # Static assets (images, icons, sample PDFs)