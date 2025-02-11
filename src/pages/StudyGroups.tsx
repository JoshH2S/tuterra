
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { fetchMyStudyGroups } from "@/api/socialApi";

export default function StudyGroups() {
  const navigate = useNavigate();
  const { data: studyGroups, isLoading } = useQuery({
    queryKey: ['myStudyGroups'],
    queryFn: fetchMyStudyGroups
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">
            Join or create study groups to collaborate with your peers
          </p>
        </div>
        <Button onClick={() => navigate("/study-groups/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Study Group
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studyGroups?.map((group) => (
          <Card 
            key={group.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(`/study-groups/${group.id}`)}
          >
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{group.current_members} / {group.max_members} members</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {studyGroups?.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>You haven't joined any study groups yet.</p>
            <p>Create one or join an existing group to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
