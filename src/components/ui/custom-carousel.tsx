
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlideData {
  title: string;
  button: string;
  src: string;
}

interface CustomCarouselProps {
  slides: SlideData[];
  className?: string;
}

export function CustomCarousel({ slides, className }: CustomCarouselProps) {
  return (
    <div className={cn("relative", className)}>
      <Carousel 
        className="w-full" 
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={slide.src} 
                  alt={slide.title}
                  className="w-full aspect-video object-cover transition-all hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                  <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>
                  <Button variant="outline" className="w-full mt-2 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white">
                    {slide.button}
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="hidden md:block">
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </div>
        
        {/* Mobile navigation dots */}
        <div className="mt-4 flex justify-center gap-1 md:hidden">
          {slides.map((_, index) => (
            <div 
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300"
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
