import { LuPackage } from "react-icons/lu";

const EmptyState = () => {
    return (
        <div className="empty-state flex flex-col gap-2 items-center justify-center text-gray-400 py-20">
            <LuPackage className="h-6 w-6 text-orange-400" />
            <span className="text-[10px]">Belum ada transaksi</span>
        </div>
    )
}

export default EmptyState;
    