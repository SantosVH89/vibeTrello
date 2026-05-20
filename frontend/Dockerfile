# Fase 1: construye los archivos estaticos de React/Vite.
FROM node:24-alpine AS build

WORKDIR /app

# VITE_API_URL queda incrustado en el frontend al compilar.
# En produccion usamos /vibeTrello/api para que Nginx lo envie al backend interno sin pisar otras apps.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# VITE_BASE_PATH indica a Vite y React Router en que ruta publica vive la app.
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Fase 2: sirve la web ya compilada con Nginx.
FROM nginx:1.27-alpine

# Configuracion propia para servir React y reenviar /api al backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el resultado de Vite dentro de /vibeTrello para servir la app desde esa ruta.
COPY --from=build /app/dist /usr/share/nginx/html/vibeTrello

EXPOSE 80
