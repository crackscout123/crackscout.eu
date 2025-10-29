# React + TypeScript + Vite + Docker

Produktionsreifes Frontend mit React/TypeScript und Vite, ausgeliefert als statische SPA über Nginx im Docker‑Container.
Beinhaltet Multi‑Stage Dockerfile, Nginx‑Konfiguration mit SPA‑Fallback, Caching von gehashten Assets und optionales docker‑compose.

## Inhalte

- Entwicklung: lokale Installation, Start, Lint/Build.
- Konfiguration: Vite base, Umgebungsvariablen (.env).
- Deployment: Docker Multi‑Stage Build, Nginx für SPA, Compose.
- Troubleshooting: Routing 404, Base‑Pfad, Caching, Lockfiles.

## Voraussetzungen

- Node 18+ und npm/pnpm/yarn für lokale Entwicklung, oder direkt Docker für Produktion.
- Git und ein gesperrter Lockfile (npm ci empfohlen) für reproduzierbare Builds.

## Lokale Entwicklung

Installieren und starten:  
- npm ci und npm run dev starten den Dev‑Server von Vite mit HMR.
- Standard‑Befehle: npm run build erstellt dist/, npm run preview startet eine lokale Vorschau des Builds.

```bash
# Installation
npm install 
npm ci

# Entwickeln
npm run dev

# Produktionsbuild
npm run build

# Build-Vorschau
npm run preview
```

## Konfiguration

- Base‑Pfad: Wenn die App unter einem Subpfad läuft (z. B. /status/), setze in vite.config base: "/status/" damit Asset‑URLs stimmen.
- Umgebungsvariablen: Vite liest nur Variablen mit Präfix VITE_; lege .env.development und .env.production an, z. B. VITE_API_BASE=https://api.example.com.

Beispiel .env.production:  
```
VITE_API_BASE=https://api.example.com
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Docker Deployment

Produktionsreifer Multi‑Stage Build: Node‑Image für Build, Nginx für Auslieferung.

Dockerfile:  
```dockerfile
# 1) Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm -g i pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm i; fi
COPY . .
RUN npm run build

# 2) Nginx Runtime Stage
FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```


nginx.conf (SPA‑Fallback + Caching):  
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  # Gehashte Assets aggressiv cachen
  location ~* \.(?:js|css|woff2|png|jpg|jpeg|svg)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # index.html nicht cachen, damit neue Bundles geladen werden
  location = /index.html {
    add_header Cache-Control "no-cache";
  }

  # Healthcheck
  location = /healthz {
    return 200 "ok";
    add_header Content-Type text/plain;
  }

  # SPA Fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```


Build & Run:  
- docker build -t my-frontend:latest . baut das Image.
- docker run -p 8080:80 my-frontend:latest startet Nginx und liefert die App unter http://localhost:8080 aus.

## Docker Compose (optional)

docker-compose.yml:  
```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    image: my-frontend:latest
    ports:
      - "8080:80"
    environment:
      # Beispiel für Build-Variablen: via Build-Args oder .env Files
      # - VITE_API_BASE=https://api.example.com
    restart: unless-stopped
```


Starten mit Compose:  
- docker compose up -d baut und startet den Container im Hintergrund.
- Logs prüfen: docker compose logs -f frontend zeigt Nginx‑Logs.

## Umgebungsvariablen

- Build‑Zeit: VITE_* Variablen werden in den Bundle‑Code injiziert; verwende .env.production oder Build‑Args.
- Build‑Args Beispiel: docker build --build-arg VITE_API_BASE=https://api.example.com -t my-frontend . und in der App via import.meta.env.VITE_API_BASE lesen.

## Routing

- Client‑seitiges Routing: Der SPA‑Fallback in nginx.conf sorgt dafür, dass Deep‑Links nicht mit 404 enden.
- Subpfade: Setze base in Vite und passe ggf. Nginx‑Location an, wenn unter /status/ ausgeliefert wird.

## Häufige Stolpersteine

- Base‑Pfad vergessen: Assets laden nicht auf Subpfaden; base in vite.config korrekt setzen.
- 404 bei Deep‑Links: SPA‑Fallback in Nginx fehlt; try_files ... /index.html ergänzen.
- Keine reproduzierbaren Builds: npm ci bzw. gesperrter Lockfile fehlt im Repo.
- Zu aggressives Caching von index.html: führt zu alten Bundles; index.html auf no‑cache setzen.

## Alternative Deploy‑Wege

- CDN/Hoster: Vercel, Netlify, Cloudflare Pages; einfach npm run build und dist/ deployen, base beachten.
- GitHub Pages: gh-pages Tool und Vite base auf /REPO_NAME/ setzen, dann npm run deploy nutzen.

## Referenzen

- Vite Guide: Build/Preview, Base‑Pfad, Env‑Variablen.
- Dockerizing React mit Nginx: Multi‑Stage Beispiel und Compose.
- Nginx SPA‑Fallback und Caching‑Pattern: try_files und Cache‑Header.
