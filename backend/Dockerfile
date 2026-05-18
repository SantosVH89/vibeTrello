# Imagen ligera de Node para ejecutar el backend Express en produccion.
FROM node:24-alpine

# Carpeta interna donde vivira el backend dentro del contenedor.
WORKDIR /app

# Copiamos primero los package para aprovechar cache de Docker al instalar dependencias.
COPY package*.json ./

# Instalamos solo dependencias necesarias para ejecutar la API.
RUN npm ci --omit=dev

# Copiamos codigo fuente, migraciones y scripts de arranque.
COPY src ./src
COPY migrations ./migrations
COPY seed.sql ./seed.sql
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# Damos permiso de ejecucion al script que espera PostgreSQL y aplica migraciones.
RUN chmod +x ./docker-entrypoint.sh

# Express escuchara en el puerto 4000 dentro de la red Docker.
EXPOSE 4000

# El entrypoint prepara BD y luego arranca npm start.
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
