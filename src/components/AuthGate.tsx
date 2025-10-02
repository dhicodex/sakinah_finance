"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { initData } from "@/lib/storage";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    // Safety: ensure we don't stay in loading forever (e.g. network hangs or initData stalls)
    const loadingTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 7000); // 7s

    // Robust auth check: try getUser() first (authenticated against server), then fallback to getSession()
    (async () => {
      try {
        if (typeof window === 'undefined') return;
        // primary: getUser() is more authoritative and will hit the auth server
        try {
          const { data: userData } = await supabase.auth.getUser();
          const hasUser = Boolean(userData?.user);
          if (mounted) setIsAuthed(hasUser);
          if (hasUser) {
            initData().catch(() => {});
            return;
          }
        } catch (e) {
          // ignore and fallback to getSession
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (mounted) setError(error.message);
        }
        const hasSession = Boolean(data?.session?.user);
        if (mounted) {
          setIsAuthed(hasSession);
          // initialize or clear cache depending on session
          initData().catch(() => {});
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Gagal memeriksa sesi.');
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(loadingTimeout);
      }
    })();

    // Normalize subscription return shape across supabase versions
    const subRes: any = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!mounted) return;
      setIsAuthed(Boolean(session?.user));
      initData().catch(() => {});
      if (mounted) setLoading(false);
    });
    // possible shapes: { data: { subscription } } or { subscription } or the subscription itself
    const sub = subRes?.data?.subscription ?? subRes?.subscription ?? subRes;

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      try {
        // unsubscribe gracefully regardless of shape
        if (!sub) return;
        if (typeof (sub as any).unsubscribe === 'function') {
          (sub as any).unsubscribe();
        } else if (typeof (sub as any).subscription?.unsubscribe === 'function') {
          (sub as any).subscription.unsubscribe();
        }
      } catch {}
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      // include redirectTo to ensure we return to the correct origin after OAuth flow
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: redirectTo ? { redirectTo } : undefined });
      if (error) setError(error.message);
    } catch (e: any) {
      setError(e?.message || 'Login gagal. Pastikan provider telah diaktifkan di Supabase.');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center text-[11px] text-gray-500">Loading...</div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-lg p-6 w-[360px] grid gap-3 text-center">
          <div className="text-[14px] font-bold">Sakinah Finance</div>
          <div className="text-[10px] text-gray-500">Silakan login untuk mulai mencatat keuangan Anda.</div>
          {error && (
            <div className="text-[10px] text-red-600 bg-red-50 border border-red-100 rounded p-2 text-left">
              {error}
              <div className="text-[9px] text-gray-500 mt-1">Hint: Aktifkan Google OAuth di Supabase Auth Settings dan tambahkan Redirect URL.</div>
            </div>
          )}
          <button onClick={signInWithGoogle} className="text-white bg-green-600 py-2 rounded-lg text-[10px]">Login dengan Google</button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
