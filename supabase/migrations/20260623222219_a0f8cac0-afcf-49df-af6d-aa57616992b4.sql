
DROP VIEW IF EXISTS public.public_site_settings;

CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE (
  id uuid,
  background_image text,
  booking_url text,
  texts_ar jsonb,
  texts_en jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, background_image, booking_url, texts_ar, texts_en, created_at, updated_at
  FROM public.settings
  ORDER BY created_at ASC
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_site_settings() TO anon, authenticated;
