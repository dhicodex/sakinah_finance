'use client'

import { useState } from "react";
import { LuPenLine, LuX } from "react-icons/lu";

type BallMenuProps = {
    handleFloatingMenu: () => void;
    onSelect?: (value: string) => void;
}

const BallMenu = ({ handleFloatingMenu, onSelect }: BallMenuProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const menuBall = [
        {
            label: 'Manage Category',
            value: 'manage-category'
        },
        {
            label: 'Log Expense',
            value: 'log-expense'
        },
        {
            label: 'Log Income',
            value: 'log-income'
        },
        {
            label: 'Tarik Tunai',
            value: 'tarik-tunai'
        }
    ];

    return (
        <div className={`ball-menu fixed z-10 p-3 bg-black shadow-2xl rounded-full bottom-18 right-5`}>
            { isOpen ? (
                <LuX className="text-white" onClick={() => setIsOpen(false)}/>
            ) : (
                <LuPenLine className="text-white" onClick={() => setIsOpen(true)}/>
            ) }

            <div className={`ball-menu__list absolute top-0 -z-10`}>
                {menuBall.map((item, i) => (
                    <div className="ball-menu__item bg-black text-[10px] px-3 py-2 rounded-full whitespace-nowrap transition-all ease-in-out duration-200 w-fit" 
                    onClick={() => {
                        handleFloatingMenu();
                        if (onSelect) onSelect(item.value);
                        setIsOpen(false);
                    }}
                    key={i} style={{
                        transitionDelay: `${i * 0.1}s`,
                        transform: `translateY(${i * (isOpen ? -75 : -20)}px) ${isOpen ? 'scale(1)' : 'scale(0)'} translateX(${isOpen ? (-i * -20) + -130 : 0}px)`
                    }}>
                        <span className="text-white">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default BallMenu;