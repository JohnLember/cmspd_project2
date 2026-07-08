-- ============================================================================
-- Merge Programs into Announcements + assistance recipient tracking / receipts
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Safe to run on the CMSPD_System2 project (idempotent where possible).
-- ============================================================================

-- 1. Remove the now-retired Programs feature.
DROP TABLE IF EXISTS public.program_recipients CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;

-- 2. An announcement can optionally be a distribution: what item is given.
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS item_type text;
COMMENT ON COLUMN public.announcements.item_type IS
  'Optional assistance/item for distribution events (e.g. Wheelchair). Shown on receipts.';

-- 3. Per-PWD recipient tracking for an announcement/event distribution.
CREATE TABLE IF NOT EXISTS public.announcement_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  pwd_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',   -- 'pending' | 'received'
  received_at timestamptz,
  receipt_number text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, pwd_id)
);

CREATE INDEX IF NOT EXISTS announcement_recipients_announcement_id_idx
  ON public.announcement_recipients (announcement_id);
CREATE INDEX IF NOT EXISTS announcement_recipients_pwd_id_idx
  ON public.announcement_recipients (pwd_id);

ALTER TABLE public.announcement_recipients ENABLE ROW LEVEL SECURITY;

-- PDAO staff can read/write everything; a PWD can read only their own rows.
DROP POLICY IF EXISTS announcement_recipients_select ON public.announcement_recipients;
CREATE POLICY announcement_recipients_select ON public.announcement_recipients
  FOR SELECT TO authenticated
  USING (
    (((auth.jwt() -> 'user_metadata') ->> 'role') = 'pdao')
    OR (pwd_id = auth.uid())
  );

DROP POLICY IF EXISTS announcement_recipients_pdao_write ON public.announcement_recipients;
CREATE POLICY announcement_recipients_pdao_write ON public.announcement_recipients
  FOR ALL TO authenticated
  USING ((((auth.jwt() -> 'user_metadata') ->> 'role') = 'pdao'))
  WITH CHECK ((((auth.jwt() -> 'user_metadata') ->> 'role') = 'pdao'));

-- 4. Live updates in the app.
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcement_recipients;
