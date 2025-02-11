
"use client";

import React from "react"; 
import { AnimatePresence, motion } from "framer-motion";
import { CanvasRevealEffect } from "@/components/ui/canvas-effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Send } from "lucide-react";

export function AITutorChat() {
  const [hovered, setHovered] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Send message logic here
    setMessage("");
  };

  return (
    <div className="">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative mx-auto w-full items-center justify-center overflow-hidden"
      >
        <div className="relative flex w-full items-center justify-center p-4">
          <AnimatePresence>
            <div className="tracking-tightest flex select-none flex-col py-2 text-center text-3xl font-extrabold leading-none md:flex-col md:text-8xl lg:flex-row"></div>
            {hovered && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <CanvasRevealEffect
                  animationSpeed={5}
                  containerClassName="bg-transparent opacity-30 dark:opacity-50"
                  colors={[
                    [245, 5, 55],
                    [245, 5, 55],
                  ]}
                  opacities={[1, 0.8, 1, 0.8, 0.5, 0.8, 1, 0.5, 1, 3]}
                  dotSize={2}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="z-20 w-full">
            <ScrollArea className="h-[360px] w-full overflow-auto p-1">
              <div className="px-6">
                <div className="relative flex h-full w-full justify-center text-center">
                  <h1 className="flex select-none py-2 text-center text-2xl font-extrabold leading-none tracking-tight md:text-2xl lg:text-4xl">
                    <span
                      data-content="AI."
                      className="before:animate-gradient-background-1 relative before:absolute before:bottom-4 before:left-0 before:top-0 before:z-0 before:w-full before:px-2 before:content-[attr(data-content)] sm:before:top-0"
                    >
                      <span className="from-gradient-1-start to-gradient-1-end animate-gradient-foreground-1 bg-gradient-to-r bg-clip-text px-2 text-transparent">
                        AI.
                      </span>
                    </span>
                    <span
                      data-content="Study."
                      className="before:animate-gradient-background-2 relative before:absolute before:bottom-0 before:left-0 before:top-0 before:z-0 before:w-full before:px-2 before:content-[attr(data-content)] sm:before:top-0"
                    >
                      <span className="from-gradient-2-start to-gradient-2-end animate-gradient-foreground-2 bg-gradient-to-r bg-clip-text px-2 text-transparent">
                        Study.
                      </span>
                    </span>
                    <span
                      data-content="Assistant."
                      className="before:animate-gradient-background-3 relative before:absolute before:bottom-1 before:left-0 before:top-0 before:z-0 before:w-full before:px-2 before:content-[attr(data-content)] sm:before:top-0"
                    >
                      <span className="from-gradient-3-start to-gradient-3-end animate-gradient-foreground-3 bg-gradient-to-r bg-clip-text px-2 text-transparent">
                        Assistant.
                      </span>
                    </span>
                  </h1>
                </div>
                <p className="md:text-md lg:text-md mx-auto mt-1 text-center text-xs text-primary/60 md:max-w-2xl">
                  How can I help you with your studies today?
                </p>
              </div>
              <div id="chat" className="h-38 w-full">
                <div className="">
                  <div className="pt-4">
                    <div className="space-y-2 overflow-hidden p-2">
                      {/* Chat messages will go here */}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="relative mt-2 w-full">
              <form onSubmit={handleSubmit}>
                <div className="">
                  <Input
                    className="pl-12"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask something..."
                  />
                </div>
                <Button
                  variant="default"
                  size="icon"
                  className="absolute left-1.5 top-1.5 h-7 rounded-sm"
                  type="button"
                >
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">New Chat</span>
                </Button>

                <Button
                  type="submit"
                  variant="default"
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-7 rounded-sm"
                >
                  <Send className="mx-1 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

