'use client'

import BallMenu from "@/components/BallMenu";
import FloatingCard from "@/components/FloatingCard";
import FloatingMenu from "@/components/FloatingMenu";
import Header from "@/components/Header";
import HomeLayout from "@/layouts/Home.layout";
import { useMemo, useState } from "react";
import LogIncomeForm from "@/components/LogIncomeForm";
import LogExpenseForm from "@/components/LogExpenseForm";
import ManageCategory from "@/components/ManageCategory";

export default function Home() {
    const [isFloatingMenu, setIsFloatingMenu] = useState<boolean>(false);
    const [action, setAction] = useState<null | 'log-income' | 'log-expense' | 'manage-category'>(null);

    const { title, body, submitLabel } = useMemo(() => {
        switch (action) {
            case 'log-income':
                return { title: 'Log Income', body: <LogIncomeForm />, submitLabel: 'Save Income' };
            case 'log-expense':
                return { title: 'Log Expense', body: <LogExpenseForm />, submitLabel: 'Save Expense' };
            case 'manage-category':
                return { title: 'Manage Categories', body: <ManageCategory />, submitLabel: 'Done' };
            default:
                return { title: '', body: null, submitLabel: 'Submit' };
        }
    }, [action]);

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
            <BallMenu 
                handleFloatingMenu={() => setIsFloatingMenu(true)}
                onSelect={(val) => setAction(val as any)}
            />
            <FloatingCard 
                isActive={isFloatingMenu} 
                onClose={() => { setIsFloatingMenu(false); setAction(null); }}
                title={title}
                submitLabel={submitLabel}
            >
                {body}
            </FloatingCard>
        </main>
    );
}
