# HotelBook

A responsive React/Vite hotel booking application with an Express and MySQL API.

## Run the frontend

```sh
cd frontend
npm install
npm run dev
```

The frontend includes sample hotels, rooms, and owner dashboard content so the screens remain populated while the API is offline. Set `VITE_API_URL` to point the frontend at another API origin if needed.

## Run the backend

1. Create a MySQL database by running `backend/db/schema.sql`.
2. Copy `backend/.env.example` to `backend/.env` and set database credentials and a private JWT secret.
3. Run `npm install` and `npm run dev` inside `backend`.

The API listens on port 5000. MySQL credentials stay in the backend environment. SQL statements use bound parameters.

## Project map

- `frontend/src/pages` — customer-facing routes
- `frontend/src/owner` — hotel owner routes
- `frontend/src/components` — shared navigation, footer, and cards
- `frontend/src/styles` — shared and page-level CSS
- `backend/routes` and `backend/controllers` — API endpoints and auth handlers
- `backend/db/schema.sql` — MySQL schema

The local sample artwork in `frontend/public/images` is original SVG illustration. `HotelBooking_Logo.png` is retained in the public folder; the responsive navbar renders the HotelBook wordmark in CSS.
