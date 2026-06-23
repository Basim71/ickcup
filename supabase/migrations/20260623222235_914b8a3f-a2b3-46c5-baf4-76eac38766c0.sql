
DROP FUNCTION IF EXISTS public.get_public_site_settings();

CREATE POLICY "Anon read settings"
ON public.settings
FOR SELECT
TO anon
USING (true);

REVOKE SELECT ON public.settings FROM anon;
GRANT SELECT (id, background_image, booking_url, texts_ar, texts_en, created_at, updated_at)
  ON public.settings TO anon;
