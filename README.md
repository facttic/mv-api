# 24m-api

- CRON para levantar tweets con imagen y determinados hash.
- API para servir estos tweets.

## Restore de BBDD

- Para utilizar una BBDD modelo (tiene tweets de ejemplo y la iremos actualizando), se puede usar el backup que está en la carpeta `/dbdump`.
  - Ir a la carpeta y ejecutar el comando mongorestore con las opciones que correspondan, [sin corchetes]: `mongorestore --db [db_name] --port [mongo_PORT] [--authenticationDatabase auth_db_name_if_needed --username my_user_if_needed --password "my_password_if_needed"] --archive=24m.2020-03-21.gz --gzip`

## GET /api/tweets endpoint

Devuelve la lista de tweets, según los siguientes parámetros (`query params`):

- `page`. Página actual. Opcional. Int positivo. Default: 1.
- `perPage`. Cantidad de entradas por página. Opcional. Int positivo. Default: 5.
- `sortBy`. Ordenar los resultados por este campo. Opcional. String. Default: _id.
- `query`. Permite filtrar usando el valor asignado de alguno de los campos. Opcional. Default: null.

## .env

- Usamos `dotenv` para levantar la configuración de un archivo `.env`.
- Se puede tomar el archivo `.env-example` de base.
  - TWITTER_CRON_ACTIVE=indicar `true` para configurar si esta instancia va a levantar tweets. Opcional. Default=false.
  - TWITTER_CRAWLER_MAX_TWEETS=cantidad de tweets total a obtener al llenar BBDD la 1era vez. Opcional. Default: 1400.
  - TWITTER_CRAWLER_MAX_TWEETS_PER_QUERY=Cantidad de tweets a obtener en cada llamada a la API de twitter. Opcional. Default: 100.
  - TWITTER_CRON_TIMELAPSE=tiempo en minutos entre llamads a la API de twitter. Opcional. Default: 5 (minutos).
  - TWITTER_CONSUMER_KEY=accesos a Twitter API.
  - TWITTER_CONSUMER_SECRET=accesos a Twitter API.
  - TWITTER_ACCESS_TOKEN_KEY=accesos a Twitter API.
  - TWITTER_ACCESS_TOKEN_SECRET=accesos a Twitter API.
  - API_PORT=puerto donde va a escuchar express. Opcional. Default: `3333`.
  - API_HOST=host para express. Opcional. Default: `localhost`.
  - MONGODB_URI=conexión a bbdd con formato URI. Mandatorio. E.g.: `mongodb://localhost:27017/24m`
  - MONGODB_PORT=puerto de la bbdd. Opcional. Para usar con Docker.
  - MONGODB_USERNAME=usuario de la bbdd. Opcional. Para usar con Docker.
  - MONGODB_PASSWORD=usuario de la bbdd. Opcional. Para usar con Docker.
  - DOCKER_MONGODB_PORT=puerto de la bbdd para el contenedor. Opcional. Para usar con Docker.
  - DOCKER_API_PORT=puerto de la api para el contenedor. Opcional. Para usar con Docker.
  - FB_TOKEN=token de fb. En desuso.
  - JWT_KEY=key para generar tokens
  - CACHE_TTL=*Time To Live* en segundos para los elementos en *cache*
  - CACHE_CHECKPERIOD=valor en segundos para determinar el *delete check interval*

## Ejecutar

- `npm i`. Instalar dependencias.
- `npm start`. Correr con nodemon (hotreload).

## Acceso a API de Twitter

[Acá](https://elfsight.com/blog/2020/03/how-to-get-twitter-api-key/) encontré un tutorial para obtener keys y acceder a la API de Twitter. Yo tenía keys que había pedido hace un tiempo. Está la posibilidad de que ahora el proceso sea más complejo. Puedo compartir mis keys, pero tenemos que ser cuidadosxs de no saturar la cuota.
