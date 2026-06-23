
-- Restrict direct read of settings (which contains contact_phone) to authenticated users
DROP POLICY IF EXISTS "Anyone read settings" ON public.settings;

CREATE POLICY "Authenticated read settings"
ON public.settings
FOR SELECT
TO authenticated
USING (true);

-- Public-safe view: everything except contact_phone
CREATE OR REPLACE VIEW public.public_site_settings
WITH (security_invoker = off) AS
SELECT id, background_image, booking_url, texts_ar, texts_en, created_at, updated_at
FROM public.settings;

GRANT SELECT ON public.public_site_settings TO anon, authenticated;
