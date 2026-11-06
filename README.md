# MIRZA Watches (starter)
1. `docker compose up -d`  (PostgreSQL)
2. Backend: `cd backend && npm i && npx prisma migrate dev --name init && npx prisma db seed && npm run start:dev`  (API :4000, Swagger /docs)
3. Frontend: `cd frontend && npm i && npm run dev`  (:3000)
Demo admin (dev only): admin@mirza.dev / Admin@12345
Note: hero-watch.jpg is cropped from the reference mockup. Replace with your own licensed MIRZA product photos in frontend/public/images before going live.

## Tests
With the API running: `bash backend/test/smoke.sh` (guest blocked, register, admin 403, order+coupon, wishlist).
Everything in one go: `docker compose up --build` -> web :3000, api :4000 (Swagger /docs). Coupon: WELCOME10.
Not built yet: online payment gateways, emails/verification, PDF invoices, refresh tokens, Cloudinary upload, Flip card transition.
