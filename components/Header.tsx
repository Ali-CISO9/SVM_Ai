import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="fixed top-6 left-0 right-0 z-50 px-6 flex justify-center">
            <nav className="w-full max-w-[900px] bg-white/[0.03] backdrop-blur-[40px] saturate-[120%] border border-white/[0.06] shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2),inset_0_0_1px_1px_rgba(255,255,255,0.02)] rounded-full px-6 py-2.5 flex items-center justify-center gap-4">
                
                <div className="flex items-center gap-2.5 text-white group cursor-pointer pl-2">
                    <div className="size-6 text-primary transition-transform group-hover:scale-110">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <span className="text-white text-sm font-bold tracking-tight">MediScan AI</span>
                </div>

            </nav>
        </header>
    );
};

export default Header;