# CineSky Frontend

Frontend cua CineSky Movie Web, xay bang React 19, React Router 6 va Vite.

## Cai dat

```bash
npm install
copy .env.example .env
```

Neu dung macOS/Linux:

```bash
cp .env.example .env
```

`Frontend/.env` can tro toi backend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Chay local

```bash
npm run dev
```

Ung dung chay tai `http://localhost:3000`.

## Script chinh

- `npm start`: chay frontend o che do development.
- `npm run dev`: chay frontend o che do development.
- `npm run build`: build production vao thu muc `dist`.
- `npm run preview`: xem thu ban production build.

## Ghi chu

- Can dung Node `^20.19.0` hoac `>=22.12.0` de chay Vite 7.
- Backend can chay truoc o `http://localhost:5000` neu dung cau hinh mac dinh.
- Sau khi doi `VITE_API_BASE_URL`, can tat va chay lai frontend.
- OAuth, JWT, database va seed data duoc cau hinh o thu muc `Backend`.
