FROM node:20.7.0-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

# srcフォルダを作った場合はこれ必須
COPY . .

RUN yarn --frozen-lockfile
# RUN yarn prisma generate
RUN yarn build

ENV PORT 3000
EXPOSE 3000

RUN chmod +x ./start.sh
CMD  ["./start.sh"]
