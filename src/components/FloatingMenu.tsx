'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutGrid, LuCircleArrowDown, LuCircleArrowUp, LuChartSpline } from "react-icons/lu";

const FloatingMenu = () => {
    const pathname = usePathname();

    const MenuList = [
        {
            icon: <LuLayoutGrid />,
            label: 'Dashboard',
            href: '/'
        },
        {
            icon: <LuChartSpline />,
            label: 'Analytics',
            href: '/analytics'
        }
    ];

    return (
        <div className="floating-menu shadow-2xl border-t border-gray-100">
            <div className="floating-menu__wrapper flex justify-around py-1">
                {MenuList.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={i} href={item.href} className={`floating-menu__item flex flex-col gap-0.5 items-center justify-center px-5 py-1 rounded-full transition-all ease-in-out duration-100 ${isActive ? 'bg-gray-100' : ''}`}>
                            <span className={`${isActive ? 'text-green-500' : 'text-gray-400'}`}>{item.icon}</span>
                            <span className={`text-[8px] ${isActive ? 'text-green-500' : 'text-gray-400'}`}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
};

export default FloatingMenu;