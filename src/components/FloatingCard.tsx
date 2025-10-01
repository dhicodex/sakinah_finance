import { LuX } from "react-icons/lu";

type FloatingCardProps = {
    isActive: boolean;
    onClose: () => void;
    title?: string;
    submitLabel?: string;
    hideSubmit?: boolean;
    children?: React.ReactNode
}

const FloatingCard = ({ isActive, onClose, title = "Log Income", submitLabel = "Submit", hideSubmit = false, children }: FloatingCardProps) => {
    return (
        <div className={`floating-card fixed w-full transition-all ease-in-out duration-300 h-[100dvh] z-20 ${isActive ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className={`floating-card__background h-[100dvh] bg-black opacity-50 transition-all ease-in-out duration-300`}></div>
            <div className="floating-card__wrapper absolute bottom-0 bg-white w-full min-h-[400px] rounded-t-2xl">
                <div className="floating-card__header relative flex justify-between px-4 py-2">
                    <div className="floating-card__header-title w-full mt-4 font-bold">{title}</div>
                    <div className="floating-card__header-icon absolute top-5 right-5">
                        <LuX className="h-6 w-6" onClick={() => onClose()}/>
                    </div>
                </div>
                <div className="floating-card__body flex flex-col flex-1 overflow-auto px-5">
                    {children}

                    {!hideSubmit && (
                        <div className="floating-card__btn">
                            <button className="btn btn-primary w-full text-white bg-green-600 py-2 font-semibold rounded-lg mt-4 mb-4">{submitLabel}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default FloatingCard;