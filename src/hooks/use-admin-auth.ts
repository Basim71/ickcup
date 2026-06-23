import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setUserId(null);
        setEmail(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!active) return;
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      setLoading(false);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setLoading(true);
        check();
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, userId, email, isAdmin };
}
