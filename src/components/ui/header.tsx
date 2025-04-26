
"use client";

import { Button } from "@/components/ui/button";
import { Menu, MoveRight, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header1() {
    const navigationItems = [
        {
            title: "Home",
            href: "/",
            description: "",
        },
        {
            title: "About Us",
            href: "/about",
        },
        {
            title: "Contact Us",
            href: "/contact",
        }
    ];

    const [isOpen, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/auth?tab=signup');
    };

    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-background">
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
                <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
                    {navigationItems.map((item) => (
                        <Button key={item.title} variant="ghost" asChild>
                            <Link to={item.href}>{item.title}</Link>
                        </Button>
                    ))}
                </div>
                
                <div className="flex lg:justify-center justify-start">
                    <Link to="/">
                        <img 
                            src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png" 
                            alt="tuterra.ai logo" 
                            className="h-12 w-auto object-contain" 
                        />
                    </Link>
                </div>
                
                <div className="flex justify-end w-full gap-4">
                    <div className="border-r hidden md:inline"></div>
                    <Button variant="outline" asChild>
                        <Link to="/auth">Sign in</Link>
                    </Button>
                    <Button onClick={handleGetStarted}>
                        Get started
                    </Button>
                </div>
                
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <Button variant="ghost" onClick={() => setOpen(!isOpen)} className="touch-manipulation">
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-background shadow-lg py-4 container gap-8">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.title}
                                    to={item.href}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-lg">{item.title}</span>
                                    <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                                </Link>
                            ))}
                            <div className="flex flex-col gap-3 mt-4">
                                <Link to="/auth" className="flex justify-between items-center">
                                    <span className="text-lg">Sign in</span>
                                    <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                                </Link>
                                <Link to="/auth?tab=signup" className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-primary">Get started</span>
                                    <MoveRight className="w-4 h-4 stroke-1 text-primary" />
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
