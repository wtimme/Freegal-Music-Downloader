# syntax=docker/dockerfile:1
FROM camilin87/node-cron:latest

ENV TASK_SCHEDULE='*/5 * * * *'
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .