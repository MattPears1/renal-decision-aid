# Claude Code Instructions

**Last Updated:** 21 January 2026

Project-specific instructions for AI agents working on this codebase.

## Process Management - CRITICAL

**DO NOT kill all Node.js processes.** This terminates other running Claude Code sessions and dev servers.

### Correct Approach: Kill by Port

When you need to restart a service, kill only the specific port:

```bash
# Windows - Kill process on specific port
npx kill-port 3006    # Frontend (Vite)
npx kill-port 5006    # Backend (Express)

# Or using netstat + taskkill on Windows
netstat -ano | findstr :3006
taskkill /PID <PID> /F
```

### What NOT to Do

```bash
# NEVER do this - kills ALL node processes including other Claude sessions
taskkill /F /IM node.exe
pkill node
killall node
Get-Process node | Stop-Process -Force
```

### Service Ports

| Service | Port | Command to Kill |
|---------|------|-----------------|
| Frontend (Vite) | 3006 | `npx kill-port 3006` |
| Backend (Express) | 5006 | `npx kill-port 5006` |

### Before Starting Services

Check if ports are in use first:

```bash
# Check if port is in use
netstat -ano | findstr :3006
netstat -ano | findstr :5006
```

## Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend
```

## Code Rules

- Maximum 900 lines per file
- All user-facing text must use i18n keys
- All components must be WCAG 2.2 AA compliant
- See CONTRIBUTING.md for full guidelines
