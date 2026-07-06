# Code Connect MCP server — HTTP transport (Connect.md §9).
# Build from the MONOREPO ROOT so workspace linking + the packages/react source
# (needed by validate_mapping's live re-scan) are available:
#   docker build -f tooling/code-connect/deploy/Dockerfile -t code-connect-mcp .
FROM node:20-slim

RUN corepack enable
WORKDIR /app

# Install with the full workspace so pnpm links everything deterministically.
COPY . .
RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
# The committed manifest is the source of truth the server serves.
ENV CODE_CONNECT_MANIFEST_DIR=/app/manifest
# Set CODE_CONNECT_HTTP_TOKEN at run time to require bearer auth.

EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3333)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["pnpm", "--filter", "@ui-organized/code-connect", "mcp:http"]
