
import { useQuery } from "@tanstack/react-query";
import { fetchMyStudyGroups, fetchLatestResources } from "@/api/socialApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Share2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SocialSection = () => {
  const navigate = useNavigate();
  
  const { data: studyGroups, isLoading: loadingGroups } = useQuery({
    queryKey: ['myStudyGroups'],
    queryFn: fetchMyStudyGroups
  });

  const { data: resources, isLoading: loadingResources } = useQuery({
    queryKey: ['latestResources'],
    queryFn: fetchLatestResources
  });

  if (loadingGroups || loadingResources) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Social</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
            <div className="h-20 bg-gray-100 animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Social</CardTitle>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/study-groups/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Study Group
            </Button>
          </div>
        </div>
        <CardDescription>
          Your study groups and shared resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              My Study Groups
            </h3>
            <div className="space-y-3">
              {studyGroups?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven't joined any study groups yet
                </p>
              ) : (
                studyGroups?.map((group) => (
                  <div 
                    key={group.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/study-groups/${group.id}`)}
                  >
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {group.current_members} members
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              Latest Shared Resources
            </h3>
            <div className="space-y-3">
              {resources?.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No resources have been shared yet
                </p>
              ) : (
                resources?.map((resource) => (
                  <div 
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/resources/${resource.id}`)}
                  >
                    <div>
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(resource.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
