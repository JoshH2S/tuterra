import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillCard } from "./SkillCard";
import { XPGainNotification } from "./XPGainNotification";
import { useUserSkills } from "@/hooks/useUserSkills";
import { SkillsDashboardProps, SKILL_CATEGORIES, SkillCategory } from "@/types/skills";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap,
  Award,
  Star,
  BarChart3
} from "lucide-react";

export function SkillsDashboard({ sessionId, userId }: SkillsDashboardProps) {
  const { skills, progress, loading, error, totalXP, averageLevel, refreshSkills } = useUserSkills(userId);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const isMobile = useIsMobile();
  const [xpNotification, setXpNotification] = useState<{
    skillName: string;
    xpGained: number;
    newLevel?: number;
  } | null>(null);

  // Filter skills by category
  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  // Calculate category stats
  const categoryStats = Object.entries(SKILL_CATEGORIES).map(([key, category]) => {
    const categorySkills = skills.filter(skill => skill.category === key as SkillCategory);
    const categoryProgress = categorySkills.map(skill => 
      progress.find(p => p.skill_id === skill.id)
    ).filter(Boolean);
    
    const avgLevel = categoryProgress.length > 0 
      ? categoryProgress.reduce((sum, p) => sum + (p?.current_level || 0), 0) / categoryProgress.length
      : 0;
    
    const totalCategoryXP = categoryProgress.reduce((sum, p) => sum + (p?.current_xp || 0), 0);

    return {
      key: key as SkillCategory,
      ...category,
      skillCount: categorySkills.length,
      avgLevel: Math.round(avgLevel * 10) / 10,
      totalXP: totalCategoryXP,
      progressCount: categoryProgress.length
    };
  });

  // Get top performing skills
  const topSkills = [...progress]
    .sort((a, b) => (b.current_level * 1000 + b.current_xp) - (a.current_level * 1000 + a.current_xp))
    .slice(0, 3)
    .map(p => ({
      ...p,
      skill: skills.find(s => s.id === p.skill_id)
    }))
    .filter(item => item.skill);

  // Handle XP notifications (would be triggered by real-time updates)
  const showXPNotification = (skillName: string, xpGained: number, newLevel?: number) => {
    setXpNotification({ skillName, xpGained, newLevel });
  };

  if (loading) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <LoadingSpinner size="default" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <CardContent className="text-center">
          <p className="text-destructive mb-2">Error loading skills</p>
          <Button variant="outline" onClick={refreshSkills}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* XP Gain Notification */}
      {xpNotification && (
        <XPGainNotification
          skillName={xpNotification.skillName}
          xpGained={xpNotification.xpGained}
          newLevel={xpNotification.newLevel}
          isVisible={!!xpNotification}
          onClose={() => setXpNotification(null)}
        />
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className={isMobile ? "p-2.5" : "p-4"}>
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
              <div className={`rounded-lg bg-blue-100 ${isMobile ? 'p-1.5' : 'p-2'}`}>
                <Zap className={`text-blue-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </div>
              <div className={isMobile ? 'text-center' : ''}>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>{totalXP}</p>
                <p className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-sm'}`}>Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={isMobile ? "p-2.5" : "p-4"}>
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
              <div className={`rounded-lg bg-green-100 ${isMobile ? 'p-1.5' : 'p-2'}`}>
                <TrendingUp className={`text-green-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </div>
              <div className={isMobile ? 'text-center' : ''}>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>{averageLevel}</p>
                <p className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-sm'}`}>Avg Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={isMobile ? "p-2.5" : "p-4"}>
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
              <div className={`rounded-lg bg-purple-100 ${isMobile ? 'p-1.5' : 'p-2'}`}>
                <Target className={`text-purple-600 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </div>
              <div className={isMobile ? 'text-center' : ''}>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>{progress.length}</p>
                <p className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-sm'}`}>Skills</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills */}
      {topSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Skills
            </CardTitle>
            <CardDescription>Your highest performing skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topSkills.map((item, index) => (
                <div key={item.skill_id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.skill?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Level {item.current_level} • {item.current_xp} XP
                    </p>
                  </div>
                  <Award className="h-4 w-4 text-yellow-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills by Category */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            Skills Progress
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Track your skill development across different areas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SkillCategory | 'all')}>
            {/* Scrollable filter chips on mobile */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 pb-2 sm:pb-0 min-w-max sm:min-w-0 sm:flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                    selectedCategory === 'all'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  )}
                >
                  All
                </button>
                {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as SkillCategory)}
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                      selectedCategory === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {/* Category Stats */}
              {selectedCategory !== 'all' && (
                <div className="mb-6 p-4 rounded-lg bg-accent/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {categoryStats.find(c => c.key === selectedCategory)?.skillCount || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Skills</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {categoryStats.find(c => c.key === selectedCategory)?.avgLevel || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Level</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {categoryStats.find(c => c.key === selectedCategory)?.totalXP || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total XP</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Grid */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSkills.map(skill => {
                  const skillProgress = progress.find(p => p.skill_id === skill.id);
                  
                  if (!skillProgress) return null;

                  return (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      progress={skillProgress}
                      onClick={() => {
                        // Handle skill detail view
                        console.log('Open skill details for:', skill.name);
                      }}
                    />
                  );
                })}
              </div>

              {filteredSkills.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No skills developed in this category yet.</p>
                  <p className="text-sm">Complete tasks to start building your skills!</p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
