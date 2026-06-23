
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

DROP POLICY "Anyone can create booking" ON public.bookings;
CREATE POLICY "Anyone can create booking" ON public.bookings FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 120
    AND char_length(mobile_number) BETWEEN 4 AND 30
    AND language IN ('ar','en')
  );

DROP POLICY "Admins insert settings" ON public.settings;
CREATE POLICY "Admins insert settings" ON public.settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY "Admins update settings" ON public.settings;
CREATE POLICY "Admins update settings" ON public.settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
