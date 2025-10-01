'use client'

import BallMenu from "@/components/BallMenu";
import FloatingCard from "@/components/FloatingCard";
import FloatingMenu from "@/components/FloatingMenu";
import Header from "@/components/Header";
import HomeLayout from "@/layouts/Home.layout";
import { useState } from "react";

export default function Home() {
    const [isFloatingMenu, setIsFloatingMenu] = useState<boolean>(true);

    return (
        <main className="flex h-[100dvh] flex-col">
            <div className="top py-1 px-2">
                <Header />
            </div>
            <div className="center flex flex-1 relative bg-gray-50 overflow-auto">
                <HomeLayout />
            </div>
            <div className="bottom">
                <FloatingMenu />
            </div>
            <BallMenu handleFloatingMenu={() => setIsFloatingMenu(!isFloatingMenu)} />
            <FloatingCard 
                isActive={isFloatingMenu} 
                onClose={() => setIsFloatingMenu(false)}    
            />
        </main>
    );
}
