
"use client";

import { Button } from "@/components/ui/button";
import { Menu, MoveRight, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Header1Props {
    variant?: "default" | "transparent";
}

function Header1({ variant = "default" }: Header1Props) {
    const navigationItems = [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "About Us",
            href: "/about",
        },
        {
            title: "Contact Us",
            href: "/contact",
        },
    ];

    const [isOpen, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/auth?tab=signup");
    };

    const isTransparent = variant === "transparent";

    const headerBg = "bg-white border-b border-black/[0.06] shadow-sm";
    const navLinkClass = "text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-150";

    return (
        <header className={`w-full z-40 fixed top-0 left-0 transition-all duration-300 ${headerBg}`}>
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
                {/* Left nav links */}
                <div className="justify-start items-center gap-6 lg:flex hidden flex-row">
                    {navigationItems.map((item) => (
                        <Link key={item.title} to={item.href} className={navLinkClass}>
                            {item.title}
                        </Link>
                    ))}
                </div>

                {/* Center logo */}
                <div className="flex lg:justify-center justify-start">
                    <Link to="/">
                        <img
                            src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
                            alt="tuterra.ai logo"
                            className="h-12 w-auto object-contain"
                        />
                    </Link>
                </div>

                {/* Right CTAs */}
                <div className="flex justify-end w-full gap-3">
                    <Button variant="outline" asChild>
                        <Link to="/auth">Sign in</Link>
                    </Button>
                    <Button onClick={handleGetStarted}>Get started</Button>
                </div>

                {/* Mobile hamburger */}
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <button
                        onClick={() => setOpen(!isOpen)}
                        className="p-2 rounded-lg touch-manipulation text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    {isOpen && (
                        <div className="absolute top-20 flex flex-col w-full right-0 bg-white border-t border-gray-100 shadow-xl py-5 container gap-6">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.title}
                                    to={item.href}
                                    className="flex justify-between items-center"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="text-base text-gray-700">{item.title}</span>
                                    <MoveRight className="w-4 h-4 stroke-1 text-gray-400" />
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                                <Link
                                    to="/auth"
                                    className="flex justify-between items-center"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="text-base text-gray-700">Sign in</span>
                                    <MoveRight className="w-4 h-4 stroke-1 text-gray-400" />
                                </Link>
                                <Link
                                    to="/auth?tab=signup"
                                    className="flex justify-between items-center"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="text-base font-semibold text-[#091747]">Get started</span>
                                    <MoveRight className="w-4 h-4 stroke-1 text-[#091747]" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export { Header1 };

