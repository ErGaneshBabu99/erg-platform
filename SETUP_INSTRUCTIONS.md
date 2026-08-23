# Report Check — Upload Fix Setup

## 1. Files ma k badliyo (kaha rakhne)

Copy garera aafno repo ma yestai path ma rakhnus (existing file lai overwrite garne):

| File | Type |
|---|---|
| `lib/report-check/validation.ts` | modified — 50MB limit |
| `lib/report-check/pdfCompress.ts` | **new** — client-side PDF compression |
| `app/api/report-check/upload-url/route.ts` | **new** — Blob upload token route |
| `app/api/report-check/upload/route.ts` | modified — ab blob URL process garcha, size limit garda ni delete garcha |
| `app/api/cron/report-check-cleanup/route.ts` | **new** — hourly orphan blob cleanup |
| `components/report-check/ReportUploader.tsx` | modified — compress + upload progress % |
| `components/report-check/ReportCheckClient.tsx` | modified — better error messages |
| `vercel.json` | **new** — cron schedule |
| `.env.example` | modified — 2 naya env vars ko reference |
| `package.json` | modified — 3 naya dependency |

## 2. Vercel Blob store enable garne (production)

1. Vercel dashboard → aafno project → **Storage** tab → **Create Database** → **Blob**
2. Enable garepachi Vercel ले automatically `BLOB_READ_WRITE_TOKEN` environment variable project ma add gardincha
3. Local dev ko lagi: Vercel dashboard बाट tyo token copy garera `.env.local` ma pest garnus:
   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   ```

## 3. Cron secret set garne (safety-net cleanup ko lagi)

1. Jaha bhaye pani random string generate garnus (jasto `openssl rand -hex 32`)
2. Vercel project ko Environment Variables ma `CRON_SECRET` naam ma add garnus
3. `.env.local` ma pani same value rakhnus (local ma cron chaldaina, tara consistency ko lagi)

## 4. Install garne

```bash
npm install
```

Yesले `@vercel/blob`, `pdfjs-dist`, `jspdf` install garcha.

## 5. Deploy garne pachi test garne

1. 50MB bhanda thulo PDF upload garera herne — "Compressing..." dekhincha ki, ani upload progress % dekhincha ki
2. Compress vayepachi 50MB muni aayo bhane automatically upload huncha
3. Vercel dashboard → Storage → Blob store maa herda, extraction sakepachi file automatically delete bhaeko dekhincha (persist hudaina)

## Design decisions (kina yesari banaye)

- **Storage**: uploaded file permanent rakhinna. Extraction sakepachi (success ya fail jehi hos) blob delete huncha. Extracted text matra 2-hour TTL sanga session ma basxa (jun already existing system ho).
- **Cleanup cron**: hourly chalcha, 2 hours bhanda purano orphan blob haru (server crash jasto edge case ma bachna sakne) auto-delete garcha. Yo safety-net matra ho — normal flow ma pahile nai delete hunxa.
- **Compression**: PDF matra compress huncha (scanned/image PDF ko lagi effective). DOCX 50MB bhanda thulo bhaye compress hudaina — user lai clear message dincha kina.
- **Error messages**: ab generic "couldn't reach server" chai truly network-down case ma matra dekhincha. Baaki sabai case (file too large, server error, blob fetch fail) ma specific reason dekhincha.
