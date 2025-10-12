import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MailOpen, Clock, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SupervisorMetricsProps {
  sessionId: string;
  userId: string;
}

interface MetricsSummary {
  sent_count: number;
  open_rate: number;
  median_reply_hours: number | null;
  total_replies: number;
  unread_count: number;
}

export function SupervisorMetrics({ sessionId, userId }: SupervisorMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const { data, error } = await supabase.rpc('get_supervisor_metrics_summary', {
          p_session: sessionId,
          p_user: userId,
          p_days: 30
        });

        if (error) {
          console.error('Error loading metrics:', error);
          return;
        }

        if (data && data.length > 0) {
          setMetrics(data[0]);
        }
      } catch (error) {
        console.error('Error in loadMetrics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId && userId) {
      loadMetrics();
    }
  }, [sessionId, userId]);

  const formatReplyTime = (hours: number | null): string => {
    if (hours === null || hours === undefined) return 'N/A';
    
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Messages Sent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.sent_count}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      {/* Open Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          <MailOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.open_rate !== null ? `${metrics.open_rate}%` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.sent_count > 0 
              ? `${Math.round((metrics.open_rate / 100) * metrics.sent_count)} of ${metrics.sent_count} opened`
              : 'No messages sent yet'
            }
          </p>
        </CardContent>
      </Card>

      {/* Median Reply Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reply Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatReplyTime(metrics.median_reply_hours)}
          </div>
          <p className="text-xs text-muted-foreground">
            Median response time
          </p>
        </CardContent>
      </Card>

      {/* Total Replies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Replies</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total_replies}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.unread_count > 0 
              ? `${metrics.unread_count} unread message${metrics.unread_count !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

