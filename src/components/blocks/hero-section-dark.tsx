
import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: React.ReactNode
  ctaHref?: string
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

const FloatingElement = ({ className, delay = 0, xFactor = 1, yFactor = 1 }) => {
  const isMobile = useIsMobile()
  
  // Reduce animation intensity on mobile
  const intensity = isMobile ? 0.4 : 1
  
  return (
    <motion.div
      className={cn("absolute rounded-full blur-3xl opacity-50", className)}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 0.5,
        y: [0, 20 * intensity, 0],
        x: [0, 10 * intensity * xFactor, 0]
      }}
      transition={{
        duration: 8,
        delay: delay,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />
  )
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}

const TypedText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const isMobile = useIsMobile()
  
  // Use faster typing on mobile
  const typingSpeed = isMobile ? 70 : 100
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, typingSpeed)
      
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, typingSpeed])
  
  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      gridOptions,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const isMobile = useIsMobile()
    
    const springConfig = { damping: 25, stiffness: 150 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)
    
    // Parallax effect based on mouse/touch movement
    useEffect(() => {
      if (isMobile) return // Limit heavy effects on mobile
      
      const handleMouseMove = (e: MouseEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        
        // Calculate mouse position relative to center of container
        const centerX = rect.x + rect.width / 2
        const centerY = rect.y + rect.height / 2
        
        // Set mouse position values - makes parallax effect more subtle
        mouseX.set((e.clientX - centerX) * 0.03)
        mouseY.set((e.clientY - centerY) * 0.03)
      }
      
      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY, isMobile])
    
    // Handle touch events for mobile - simpler implementation
    useEffect(() => {
      if (!isMobile) return
      
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 0) return
        
        const touch = e.touches[0]
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        
        // Calculate touch position relative to center
        const centerX = rect.width / 2
        const touchX = touch.clientX - rect.left
        
        // Subtle horizontal movement only
        mouseX.set((touchX - centerX) * 0.01)
      }
      
      const containerElement = containerRef.current
      if (containerElement) {
        containerElement.addEventListener("touchmove", handleTouchMove)
        return () => containerElement.removeEventListener("touchmove", handleTouchMove)
      }
    }, [mouseX, isMobile])

    return (
      <div 
        className={cn("relative min-h-screen overflow-hidden", className)} 
        ref={React.useMemo(() => {
          if (ref) {
            return typeof ref === 'function' ? (el) => { ref(el); containerRef.current = el; } : { ...ref, current: containerRef.current }
          }
          return containerRef
        }, [ref])}
        {...props}
      >
        <div className="absolute top-0 z-[0] h-full w-screen bg-blue-950/10 dark:bg-blue-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(9,23,71,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(9,23,71,0.3),rgba(255,255,255,0))]" />
        
        {/* Decorative elements */}
        <FloatingElement 
          className="bg-blue-400/20 w-64 h-64 left-[10%] top-1/4" 
          delay={0.5}
          xFactor={-1}
        />
        <FloatingElement 
          className="bg-purple-400/20 w-72 h-72 right-[15%] top-1/3" 
          delay={1.2}
        />
        <FloatingElement 
          className="bg-teal-400/20 w-48 h-48 left-[30%] bottom-1/4" 
          delay={0.8}
          xFactor={0.5}
        />
        
        <section className="relative max-w-full mx-auto z-1">
          <RetroGrid {...gridOptions} />
          
          <div className="max-w-screen-xl z-10 mx-auto px-4 py-16 md:py-28 gap-8 md:gap-12 md:px-8">
            <motion.div 
              className="space-y-4 md:space-y-5 max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1 
                className="text-sm text-gray-600 dark:text-gray-400 group font-geist mx-auto px-5 py-2 bg-gradient-to-tr from-zinc-300/20 via-gray-400/20 to-transparent dark:from-zinc-300/5 dark:via-gray-400/5 border-[2px] border-black/5 dark:border-white/5 rounded-3xl w-fit"
                style={{ x: useTransform(x, v => v * -0.5), y: useTransform(y, v => v * -0.5) }}
              >
                {title}
                <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
              </motion.h1>
              
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-6xl tracking-tighter font-geist bg-clip-text text-transparent mx-auto bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]"
                style={{ x: useTransform(x, v => v * 0.3), y: useTransform(y, v => v * 0.3) }}
              >
                {subtitle.regular}
                <TypedText 
                  text={subtitle.gradient}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500"
                />
              </motion.h2>
              
              <motion.p 
                className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-sm md:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ x: useTransform(x, v => v * 0.1), y: useTransform(y, v => v * 0.1) }}
              >
                {description}
              </motion.p>
              
              <motion.div 
                className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {typeof ctaText === 'string' ? (
                  <motion.span 
                    className="relative inline-block overflow-hidden rounded-full p-[1.5px]"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-950 text-xs font-medium backdrop-blur-3xl">
                      <a
                        href={ctaHref}
                        className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-zinc-300/20 via-[#091747]/30 to-transparent dark:from-zinc-300/5 dark:via-[#091747]/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-[#091747]/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-[#091747]/30 transition-all sm:w-auto py-3 md:py-4 px-6 md:px-10"
                      >
                        {ctaText}
                      </a>
                    </div>
                  </motion.span>
                ) : (
                  ctaText
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
