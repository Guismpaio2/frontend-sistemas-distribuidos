# ---- Etapa 1: gera os arquivos estáticos com o Vite ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# O Vite "embute" esta URL no código durante o build (não é lida em tempo de execução).
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Etapa 2: servidor web leve entregando os arquivos ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
