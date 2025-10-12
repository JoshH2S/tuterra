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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalXP}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageLevel}</p>
                <p className="text-sm text-muted-foreground">Average Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.length}</p>
                <p className="text-sm text-muted-foreground">Skills Developed</p>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Skills Progress
          </CardTitle>
          <CardDescription>Track your skill development across different areas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SkillCategory | 'all')}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
