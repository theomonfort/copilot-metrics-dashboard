# Copilot Metrics Dashboard

A modern dashboard for visualizing GitHub Copilot usage metrics for the **octodemo** organization. Built with Next.js, TypeScript, Recharts, and Tailwind CSS.

## Features

### 📊 Overview Dashboard
- **KPI Cards**: Monthly/Daily Active Users, Code Acceptance Rate, LOC Added, Agent & Chat Adoption
- **Active Users Trend**: DAU/WAU/MAU over 28 days
- **Code Completions**: Suggested vs Accepted (daily)
- **Acceptance Rate**: Trend over time
- **Lines of Code**: LOC added/deleted trend
- **Feature Usage**: Distribution across code completion, chat, agent, CLI
- **IDE Usage**: Distribution across VS Code, JetBrains, etc.
- **Pull Request Metrics**: Created, merged, Copilot-authored PRs

### 👥 User Metrics
- **Sortable Table**: All org members with Copilot stats
- **Filters**: Search by username, filter by Agent/Chat/CLI usage
- **User Detail Page**: Individual activity trends, language/IDE/feature breakdowns

### 🔤 Languages & IDE
- **Language Distribution**: Top languages by LOC added
- **Language Trends**: Daily language usage over time
- **IDE Usage**: Per-day IDE breakdown
- **Model Usage**: AI model distribution
- **Language × Feature Matrix**: Heatmap of language usage across features

## Getting Started

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token with appropriate permissions

### Token Setup

Create a fine-grained PAT or classic token:

**Fine-grained PAT (recommended):**
- Organization: `octodemo`
- Permissions: `Organization Copilot metrics (read)` + `Members (read)`

**Classic PAT:**
- Scope: `read:org`

### Installation

```bash
git clone <repository-url>
cd copilot-metrics-dashboard
npm install
```

### Configuration

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_ORG=octodemo
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## API Architecture

The dashboard uses Next.js API Routes as a proxy to keep GitHub tokens server-side:

```
Browser → /api/metrics/org → GitHub API → download_links → NDJSON → parsed data
Browser → /api/metrics/users → GitHub API → download_links → NDJSON → parsed data
Browser → /api/members → GitHub API → paginated member list
```

### GitHub API Endpoints Used

| Route | GitHub API Endpoint |
|---|---|
| `/api/metrics/org` | `GET /orgs/{org}/copilot/metrics/reports/organization-28-day/latest` |
| `/api/metrics/users` | `GET /orgs/{org}/copilot/metrics/reports/users-28-day/latest` |
| `/api/members` | `GET /orgs/{org}/members` |

## Tech Stack

- **Next.js 15** (App Router) — React framework with API routes
- **TypeScript** — Type-safe development
- **Recharts** — React charting library
- **Tailwind CSS** — Utility-first styling
- **SWR** — Data fetching with caching
- **Lucide React** — Icon library

## Project Structure

```
src/
├── app/
│   ├── api/metrics/{org,users}/  # Server-side API routes
│   ├── api/members/              # Members API route
│   ├── users/[login]/            # User detail page
│   ├── users/                    # Users list page
│   ├── languages/                # Language & IDE analysis
│   └── page.tsx                  # Overview dashboard
├── components/
│   ├── charts/                   # Recharts chart components
│   ├── cards/                    # KPI and chart card components
│   ├── tables/                   # Data table components
│   ├── layout/                   # Sidebar, Header
│   └── ui/                       # ErrorState, LoadingSkeleton, EmptyState
├── hooks/                        # SWR data fetching hooks
└── lib/                          # API client, types, utilities
```

## Notes

- **Data Availability**: Copilot usage metrics reports are available from October 10, 2025 onwards
- **Rate Limiting**: SWR caching (5-10 min) helps stay within GitHub API rate limits
- **NDJSON**: The API returns download links to NDJSON files, not direct JSON responses
