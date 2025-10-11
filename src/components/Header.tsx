"use client";
import { LuSquareTerminal } from "react-icons/lu";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const Header = () => {
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data } = await supabase.auth.getSession();
            if (!mounted) return;
            setEmail(data.session?.user?.email ?? null);
        })();
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
            setEmail(session?.user?.email ?? null);
        });
        return () => { mounted = false; sub.subscription.unsubscribe(); };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="header">
            <div className="header__wrapper flex justify-between items-center">
                <div className="flex gap-1 items-center">
                    <div className="header__icon">
                        <LuSquareTerminal />
                    </div>
                    <div className="header__title">
                        <h1 className="font-bold pt-1 text-[11px]">Sakinah Finance</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {email && <span className="text-[10px] text-gray-500">{email}</span>}
                    {email && (
                        <button onClick={signOut} className="text-[10px] text-red-500 underline">Sign out</button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header;