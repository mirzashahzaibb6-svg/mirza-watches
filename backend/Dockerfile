FROM node:22-alpine
WORKDIR /app
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 4000
CMD ["sh","-c","npx prisma db push && npx prisma db seed && node dist/main"]
