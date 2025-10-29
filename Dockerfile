# 1) Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Install only what is needed
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Prefer npm ci for reproducible builds
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm -g i pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm i; fi

# Copy sources and build
COPY . .
# Optional: set Vite base if you serve under a subpath e.g. /status
# ENV VITE_BASE=/  # adjust if needed
RUN npm run build

# 2) Nginx Runtime Stage
FROM nginx:1.27-alpine
# Remove default config and add our own
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY --from=build /app/dist /usr/share/nginx/html

# Non-root optional (uncomment if your environment requires it)
# RUN adduser -D -H -u 10001 appuser \
#   && chown -R appuser:appuser /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html
# USER appuser

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
