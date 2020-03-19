# 24m-api

- CRON para levantar tweets con imagen y determinados hash.
- API para servir estos tweets.

## .env

- Usamos `dotenv` para levantar la configuración de un archivo `.env`.
- Se puede tomar el archivo `.env-example` de base.
  - CRON_ACTIVE=indicar `true` para configurar si esta instancia va a levantar tweets. Opcional. Default=false.
  - API_PORT=puerto donde va a escuchar express. Opcional. Default: `3333`.
  - API_HOST=host para express. Opcional. Default: `localhost`.
  - MONGODB_URI=conexión a bbdd con formato URI. Mandatorio. E.g.: `mongodb://localhost:27017/24m`
  - MONGODB_PORT=puerto de la bbdd. Opcional. Para usar con Docker.
  - MONGODB_USERNAME=usuario de la bbdd. Opcional. Para usar con Docker.
  - MONGODB_PASSWORD=usuario de la bbdd. Opcional. Para usar con Docker.
  - DOCKER_MONGODB_PORT=puerto de la bbdd para el contenedor. Opcional. Para usar con Docker.
  - DOCKER_API_PORT=puerto de la api para el contenedor. Opcional. Para usar con Docker.
  - FB_TOKEN=token de fb. En desuso.
  - TWITTER_CONSUMER_KEY=accesos a Twitter API.
  - TWITTER_CONSUMER_SECRET=accesos a Twitter API.
  - TWITTER_ACCESS_TOKEN_KEY=accesos a Twitter API.
  - TWITTER_ACCESS_TOKEN_SECRET=accesos a Twitter API.

## Ejecutar

- `npm i`. Instalar dependencias.
- `npm start`. Correr con nodemon (hotreload).

## Acceso a API de Twitter

[Acá](https://elfsight.com/blog/2020/03/how-to-get-twitter-api-key/) encontré un tutorial para obtener keys y acceder a la API de Twitter. Yo tenía keys que había pedido hace un tiempo. Está la posibilidad de que ahora el proceso sea más complejo. Puedo compartir mis keys, pero tenemos que ser cuidadosxs de no saturar la cuota.
