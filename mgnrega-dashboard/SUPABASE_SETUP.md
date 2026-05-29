# Supabase Setup Status

## Completed for you
- Created `.env` in the project root with your new Supabase project values:
  - `VITE_SUPABASE_URL=https://vdaiwrvyzcbkgqcsdnin.supabase.co`
  - `VITE_SUPABASE_ANON_KEY=sb_publishable_fsSGRhb_xCxL4u-e_H1WoQ_hFDBNYiU`
- Created `.env.example` with placeholders for future use.

## What the app needs now
1. **Database table data**
   - The app reads district metadata from `districts` when available, and otherwise derives the district list directly from `district_performance`.
   - `district_performance` must contain the imported CSV performance rows.

2. **Row Level Security (RLS) settings**
   - If you enabled RLS on the tables, run these SQL commands in Supabase SQL editor:

```sql
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on districts"
  ON districts FOR SELECT
  USING (true);

ALTER TABLE district_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on district_performance"
  ON district_performance FOR SELECT
  USING (true);
```

## How to finish it
- In Supabase Dashboard, upload `raw_mgnrega_data.csv` to the new tables.
- Map the CSV columns to the table columns.
- Make sure `district_performance` contains performance rows. The app can work even if `districts` is not present.

## If you want me to help further
Please tell me one of these:
- The CSV header and the exact columns in your Supabase tables, or
- Whether you want me to generate a data-import script for the local repo.

## Optional values
- `VITE_GOOGLE_MAPS_API_KEY` for reverse geocoding
- `VITE_GOOGLE_TTS_API_KEY` for Google TTS

If you want, I can also give you a script to import `raw_mgnrega_data.csv` directly into Supabase using your `service_role` key.

## Import script added
- Run `npm install` once to add `dotenv`.
- Create a local `.env.local` file with:

```env
SUPABASE_URL=https://vdaiwrvyzcbkgqcsdnin.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- Then run:

```bash
npm run import-data
```

This imports CSV rows into `districts` and `district_performance`.
