FROM node:20-alpine3.17

WORKDIR /

COPY package.json ./

RUN apk update && apk upgrade && \
    apk add --no-cache git
    
RUN npm install

RUN npm run get

COPY . .

RUN npm run build