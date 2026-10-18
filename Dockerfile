# syntax=docker/dockerfile:1
FROM node@sha256:2cf067cfed83d5ea958367df9f966191a942351a2df77d6f0193e162b5febfc0
WORKDIR /app
COPY package.json package-lock.json* ./
# The one stage that runs npm (npmStage, T44): with a committed lockfile npm
# install builds exactly its versions; j-unpinned has none and resolves fresh.
RUN npm install --omit=dev --no-audit --no-fund --ignore-scripts
COPY server.js ./
RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
EXPOSE 8080
CMD ["node", "server.js"]
