import { LuCircleDollarSign, LuBanknote } from "react-icons/lu";

type CardTransactionProps = {
    day: string;
}

const CardTransaction = ({ day }: CardTransactionProps) => {
    return (
        <div className="card-transaction w-full">
            <div className="card-transaction__header border-b border-gray-300 pb-2 mb-4 flex">
                <div className="transaction__header-date flex flex-col flex-1">
                    <span className="text-[8px] text-white bg-black w-fit px-2 py-0.5">{day}</span>
                    <span className="text-[10px] mt-1 text-gray-500">10 Sept 2025</span>
                </div>
                <div className="transaction__header-income text-green-500 relatie flex-1 items-end justify-end flex text-[11px] font-bold">Rp. 2.000.000</div>
                <div className="transaction__header-expense text-red-500 relative flex-1 items-end justify-end flex text-[11px] font-bold">Rp. 200.000</div>
            </div>

            <div className="card-transaction__body grid gap-4">
                <div className="item-info flex items-center">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center gap-1">
                            <LuCircleDollarSign className="text-blue-500 h-3 w-3" />
                            <span className="text-[10px] font-bold text-green-500">Income</span>
                        </div>
                        <div className="text-[8px] w-fit font-bold">Gaji <span className="text-gray-400">- PT. XYZ</span></div>
                    </div>
                    <div className="item-amount__income flex flex-1 justify-end">
                        <span className="text-[10px] text-green-500 font-semibold">Rp. 1.000.000</span>
                    </div>
                    <div className="item-amount__expense flex flex-1 justify-end">
                        <span className="text-[10px] text-red-500 font-semibold"></span>
                    </div>
                </div>

                <div className="item-info flex items-center">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center gap-1">
                            <LuBanknote className="text-green-500 h-3 w-3" />
                            <span className="text-[10px] font-bold text-green-500">Income</span>
                        </div>
                        <div className="text-[8px] w-fit font-bold">Gaji <span className="text-gray-400">- PT. XYZ</span></div>
                    </div>
                    <div className="item-amount__income flex flex-1 justify-end">
                        <span className="text-[10px] text-green-500 font-semibold">Rp. 1.000.000</span>
                    </div>
                    <div className="item-amount__expense flex flex-1 justify-end">
                        <span className="text-[10px] text-red-500 font-semibold"></span>
                    </div>
                </div>

                <div className="item-info flex items-center">
                    <div className="flex flex-col flex-1 gap-1">
                        <div className="flex items-center gap-1">
                            <LuBanknote className="text-green-500 h-3 w-3" />
                            <span className="text-[10px] font-bold text-red-500">Expense</span>
                        </div>
                        <div className="text-[8px] w-fit font-bold">Makanan <span className="text-gray-400">- Bakso</span></div>
                    </div>
                    <div className="item-amount__income flex flex-1 justify-end">
                        <span className="text-[10px] text-green-500 font-semibold"></span>
                    </div>
                    <div className="item-amount__expense flex flex-1 justify-end">
                        <span className="text-[10px] text-red-500 font-semibold">Rp. 200.000</span>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default CardTransaction;