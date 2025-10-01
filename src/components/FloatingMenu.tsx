'use client';

import { useState } from "react";
import { LuLayoutGrid, LuCircleArrowDown, LuCircleArrowUp, LuChartSpline } from "react-icons/lu";

const FloatingMenu = () => {
    const [isActive, setIsActive] = useState<number>(0);

    const MenuList = [
        {
            icon: <LuLayoutGrid />,
            label: 'Dashboard'
        },
        // {
        //     icon: <LuCircleArrowDown />,
        //     label: 'Income'
        // },
        // {
        //     icon: <LuCircleArrowUp />,
        //     label: 'Expense'
        // },
        {
            icon: <LuChartSpline />,
            label: 'Analytics'
        }
    ];

    return (
        <div className="floating-menu shadow-2xl border-t border-gray-100">
            <div className="floating-menu__wrapper flex justify-around py-1">
                {MenuList.map((item, i) => (
                    <div className={`floating-menu__item flex flex-col gap-0.5 items-center justify-center px-5 py-1 rounded-full transition-all ease-in-out duration-100 ${isActive === i ? 'bg-gray-100' : ''}`} key={i} onClick={() => setIsActive(i)}>
                        <span className={`${isActive === i ? 'text-green-500' : 'text-gray-400'}`}>{item.icon}</span>
                        <span className={`text-[8px] ${isActive === i ? 'text-green-500' : 'text-gray-400'}`}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default FloatingMenu;