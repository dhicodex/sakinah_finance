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
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (mounted) setError(error.message);
        }
        const hasSession = Boolean(data?.session?.user);
        if (!mounted) return;
        setIsAuthed(hasSession);
        // initialize or clear cache depending on session
        try {
          await initData();
        } catch (e) {
          // ignore init errors here
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Gagal memeriksa sesi.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setIsAuthed(Boolean(session?.user));
      try {
        await initData(); // initData should handle both init and clearing
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      try {
        sub?.subscription?.unsubscribe();
      } catch {}
    };
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
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
