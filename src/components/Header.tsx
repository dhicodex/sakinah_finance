import { LuSquareTerminal } from "react-icons/lu";

const Header = () => {
    return (
        <div className="header">
            <div className="header__wrapper flex justify-between items-center">
                <div className="flex gap-1 items-center">
                    <div className="header__icon">
                        <LuSquareTerminal />
                    </div>
                    <div className="header__title">
                        <h1 className="font-bold pt-1 text-[10px]">Sakinah Finance</h1>
                    </div>
                </div>

                <div className="font-bold text-[10px] text-gray-400 underline">#JOurneytodESTIny</div>
            </div>
        </div>
    )
}

export default Header;