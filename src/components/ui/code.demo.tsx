
'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

export function SplineSceneBasic() {
  const isMobile = useIsMobile();
  
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="w-full bg-black/[0.96] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex flex-col md:flex-row">
        {/* Left content */}
        <div className={`
          flex-1 relative z-10 flex flex-col justify-center
          ${isMobile ? 'p-6 pb-4' : 'p-8'}
        `}>
          <h1 className={`
            font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400
            ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}
          `}>
            {profile ? `Welcome, ${profile.first_name}!` : 'Welcome!'}
          </h1>
          <p className={`
            mt-4 text-neutral-300 max-w-lg
            ${isMobile ? 'text-sm' : ''}
          `}>
            I'm your AI Study Assistant, ready to help you learn and understand your course materials. 
            Let's work together to enhance your learning experience.
          </p>
        </div>

        {/* Right content */}
        <div className="relative flex-1" style={{ 
          height: isMobile ? '300px' : '500px',
          maxHeight: isMobile ? '300px' : '500px'
        }}>
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
