# DocuForge — AI Document Generation & Visual Editor Studio

> An intelligent, full-stack SaaS platform designed for generating, customizing, and exporting high-grade academic reports, investigatory project documents, bonafide certificates, and formal presentations.

---

## ✨ Features

- 🤖 **AI-Powered Generation**: Instantly generate publication-ready academic projects (Cover Page, Certificates, Candidate Declaration, Table of Contents, Chapters, and Bibliography) powered by Google Gemini 2.0 AI.
- 🎨 **Visual Canvas Studio**: Built with Fabric.js for interactive text editing, font styling, color customization, position dragging, and custom page border styles (`double`, `single`, `ornamental`, `none`).
- ✍️ **AI Section Writer**: Generate complete academic sections/chapters on any topic with 1 click.
- 📄 **Multi-Format Export**: Export projects to high-definition multi-page PDF files (with vector print support), PowerPoint (`.pptx`), and MS Word (`.docx`).
- 🎓 **Student & School Placeholder Sync**: Dynamically sync student names, school names, guide teachers, roll numbers, and academic sessions across all pages in real time.
- 🛡️ **Role-Based Admin Console**: Dedicated dashboard for administrators to view system usage analytics, manage user roles, and monitor AI generations.
- 💾 **Local Persistence & Auto-Save**: Zustand stores persist state across page reloads with 1.2s debounced backend auto-save.
- 🚀 **Performant & Cached Backend**: HTTP request logging with Morgan-style logging, Redis caching, and TanStack React Query on the frontend.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS Variables (Green SaaS Theme) + TailwindCSS
- **Canvas Engine**: Fabric.js (Textbox word wrapping & font engine)
- **State Management**: Zustand (with LocalStorage persistence)
- **Data Fetching**: TanStack React Query
- **Icons & Toast Notifications**: Lucide React + Sonner

### Backend
- **Runtime**: Node.js + Express
- **Database**: Neon PostgreSQL with Drizzle ORM
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Document Exporters**: `html2pdf.js`, `pptxgenjs`, `docx`
- **Caching**: Redis with in-memory TTL map fallback

---

## 📁 Repository Structure

```
docuforge/
├── client/                 # Frontend React Application
│   ├── public/             # Static assets & SVG Favicon
│   └── src/
│       ├── components/     # UI, Layout, & Visual Canvas components
│       ├── pages/          # Dashboard, Editor, Templates, Settings, Admin
│       ├── store/          # Zustand state management stores
│       └── styles/         # Global design tokens & themes
├── server/                 # Backend Node.js Express API
│   └── src/
│       ├── config/         # Database, Gemini AI, Redis config
│       ├── db/             # Drizzle ORM schemas & migrations
│       ├── middleware/     # Auth JWT, RBAC, Morgan logger
│       └── modules/        # Auth, Documents, AI, Exports, Admin
├── .gitignore              # Repository git ignore definitions
└── README.md               # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ 
- pnpm or npm

### 1. Installation
Clone the repository and install dependencies in both `client` and `server`:

```bash
# Clone the repository
git clone https://github.com/your-username/docuforge.git
cd docuforge

# Install client dependencies
cd client
pnpm install

# Install server dependencies
cd ../server
pnpm install
```

### 2. Environment Configuration
Create a `.env` file in `server/`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@neon-db-host/docuforge
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Database Migration
Push the Drizzle ORM schema to your PostgreSQL database:

```bash
cd server
pnpm db:push
```

### 4. Running Locally
Start both backend and frontend dev servers:

```bash
# Terminal 1: Backend Server (http://localhost:5000)
cd server
pnpm dev

# Terminal 2: Frontend Studio (http://localhost:5173)
cd client
pnpm dev
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for details.
