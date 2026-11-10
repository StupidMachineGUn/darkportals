# build context = repo root:  docker build -f deploy/Dockerfile -t darkportals:$(cat VERSION) .
FROM node:22-bookworm-slim AS client
WORKDIR /src
COPY VERSION ./VERSION
COPY client ./client
RUN mkdir -p server && sh client/build.sh

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY server/src ./src
COPY VERSION ./VERSION
COPY --from=client /src/server/public ./public
COPY client ./client
ENV CLIENT_SRC=/app/client
USER node
EXPOSE 8080
CMD ["node","src/index.js"]
