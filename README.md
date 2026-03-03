# Csimborasszó asszisztens (teszt)

Ez a projekt a Vercel Chatbot template alapján készült, és kifejezetten a Csimborasszó igényeire szabott:
- magyar nyelvű időpont + szakterület-választó asszisztens,
- beépített ár- és csomag eligazítás,
- visszahívási lead rögzítés Postgresbe,
- admin nézet a leadekhez.

## Fő funkciók

- Magyar nyelvű chat asszisztens biztonsági korlátokkal (nem diagnosztizál, nem ad gyógyszerjavaslatot).
- Vészjelzés esetén 112-es sürgősségi iránymutatás.
- "Visszahívást kérek" űrlap a chat felületen.
- Lead mentés Neon/Postgres adatbázisba Drizzle ORM-mel.
- E-mail értesítés küldése Resend API-n keresztül.
- Egyszerű jelszavas admin oldal: `/admin`.

## Kötelező környezeti változók

```bash
OPENAI_API_KEY=...
DATABASE_URL=...
RESEND_API_KEY=...
LEADS_NOTIFY_EMAIL=...
ADMIN_PASSWORD=...
NEXT_PUBLIC_APP_NAME="Csimborasszó asszisztens (teszt)"

# Továbbra is szükségesek a template saját változói:
AUTH_SECRET=...
BLOB_READ_WRITE_TOKEN=...
REDIS_URL=...
AI_GATEWAY_API_KEY=... # ha nem Vercel-en fut
```

## Lokális indítás

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## Build és ellenőrzés

```bash
pnpm lint
pnpm build
```

## Vercel deploy

1. Importáld ezt a repository-t Vercelbe.
2. Add meg a fenti env változókat.
3. Deploy után ellenőrizd:
   - `/` chat működik,
   - callback űrlap ment,
   - `/admin` jelszóval láthatóak a leadek.
