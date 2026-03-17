
"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Header1Props {
    variant?: "default" | "transparent";
}

function Header1({ variant = "default" }: Header1Props) {
    const navigationItems = [
        { title: "Home", href: "/" },
        { title: "About Us", href: "/about" },
        { title: "Contact Us", href: "/contact" },
    ];

    const [isOpen, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 32);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleGetStarted = () => {
        navigate("/auth?tab=signup");
    };

    return (
        <header
            className={`w-full z-40 fixed top-0 left-0 transition-all duration-500 ${
                scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-black/[0.04]"
                    : "bg-white/80 backdrop-blur-sm"
            }`}
        >
            <div className="container relative mx-auto flex h-20 items-center justify-between px-6 lg:px-10">
                {/* Left nav links */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.title}
                            to={item.href}
                            className={`text-[13px] font-medium tracking-wide uppercase transition-colors duration-200 ${
                                scrolled
                                    ? "text-foreground/70 hover:text-foreground"
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>

                {/* Center logo */}
                <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:flex lg:justify-center lg:flex-1">
                    <Link to="/">
                        <img
                            src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
                            alt="tuterra.ai logo"
                            className={`h-10 w-auto object-contain transition-all duration-300 ${
                                scrolled ? "" : "brightness-0 invert"
                            }`}
                        />
                    </Link>
                </div>

                {/* Right CTAs */}
                <div className="hidden lg:flex items-center gap-3">
                    <Link
                        to="/auth"
                        className={`text-[13px] font-medium tracking-wide uppercase transition-colors duration-200 ${
                            scrolled
                                ? "text-foreground/70 hover:text-foreground"
                                : "text-white/70 hover:text-white"
                        }`}
                    >
                        Sign in
                    </Link>
                    <Button
                        onClick={handleGetStarted}
                        size="sm"
                        className={`rounded-full px-6 text-[13px] font-semibold tracking-wide transition-all duration-300 ${
                            scrolled
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-white/15 text-white backdrop-blur-sm border border-white/20 hover:bg-white/25"
                        }`}
                    >
                        Get started
                    </Button>
                </div>

                {/* Mobile hamburger */}
                <div className="flex lg:hidden items-center">
                    <button
                        onClick={() => setOpen(!isOpen)}
                        className={`p-2 rounded-lg touch-manipulation transition-colors ${
                            scrolled
                                ? "text-foreground hover:bg-muted"
                                : "text-white hover:bg-white/10"
                        }`}
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-black/[0.04] shadow-xl">
                    <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.title}
                                to={item.href}
                                className="text-[15px] font-medium text-foreground/80 hover:text-foreground py-2 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                {item.title}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 pt-3 border-t border-border">
                            <Link
                                to="/auth"
                                className="text-[15px] font-medium text-foreground/80 hover:text-foreground py-2"
                                onClick={() => setOpen(false)}
                            >
                                Sign in
                            </Link>
                            <Button
                                onClick={() => { setOpen(false); handleGetStarted(); }}
                                className="rounded-full w-full"
                            >
                                Get started
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export { Header1 };
