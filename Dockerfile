FROM node:22.11-alpine3.20

ENV TZ=UTC
ENV PORT=3333
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info
ENV APP_KEY=eWtrs_iO-VBZs97v6WX-6wDOhqVnDOeP
ENV NODE_ENV=production
ENV DB_HOST=db
ENV DB_PORT=3306
ENV DB_USER=z1_user
ENV DB_PASSWORD=z1b4nkdbp455w0rd
ENV DB_DATABASE=main

RUN mkdir /workspace
WORKDIR /workspace

COPY build .
COPY swagger.yml .

RUN npm i

ENTRYPOINT ["node", "./bin/server.js"]
