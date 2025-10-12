import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Settings,
  TrendingUp
} from 'lucide-react';
import { ThreadedMessagingService, ResponseMetrics } from '@/services/threadedMessaging';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function ResponseMonitoringDashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ResponseMetrics | null>(null);
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [serviceKey, setServiceKey] = useState('');

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsData, dashboardDataResult] = await Promise.all([
        ThreadedMessagingService.getResponseMetrics(),
        ThreadedMessagingService.getResponseDashboard(100)
      ]);

      setMetrics(metricsData);
      setDashboardData(dashboardDataResult);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load response monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load configuration
  const loadConfig = async () => {
    try {
      const [url, key] = await Promise.all([
        ThreadedMessagingService.getAppConfig('supabase_url'),
        ThreadedMessagingService.getAppConfig('service_role_key')
      ]);

      setSupabaseUrl(url || '');
      setServiceKey(key ? key.substring(0, 20) + '...' : '');
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  // Update configuration
  const updateConfig = async () => {
    if (!supabaseUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Supabase URL",
        variant: "destructive"
      });
      return;
    }

    setConfigLoading(true);
    try {
      await ThreadedMessagingService.updateAppConfig('supabase_url', supabaseUrl.trim());
      
      toast({
        title: "Configuration updated",
        description: "Supabase URL has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error updating configuration",
        description: "Failed to update configuration",
        variant: "destructive"
      });
    } finally {
      setConfigLoading(false);
    }
  };

  // Trigger manual processing
  const triggerProcessing = async () => {
    try {
      await ThreadedMessagingService.triggerResponseProcessing();
      toast({
        title: "Processing triggered",
        description: "Manual response processing has been triggered"
      });
      
      // Reload data after a short delay
      setTimeout(loadData, 2000);
    } catch (error) {
      console.error('Error triggering processing:', error);
      toast({
        title: "Error triggering processing",
        description: "Failed to trigger response processing",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadData();
    loadConfig();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle2 className="w-4 h-4" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Response Monitoring Dashboard</h2>
          <p className="text-gray-600">Monitor intern response processing and system health</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={triggerProcessing} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Trigger Processing
          </Button>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_processed}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Escalated</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_escalated}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.escalation_rate?.toFixed(1) || 0}% of processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avg_processing_time_minutes?.toFixed(1) || 0}m
              </div>
              <p className="text-xs text-muted-foreground">Average time to process</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supabase-url">Supabase URL</Label>
              <Input
                id="supabase-url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-key">Service Role Key (Read-only)</Label>
              <Input
                id="service-key"
                value={serviceKey}
                disabled
                placeholder="Service key is set but hidden for security"
              />
            </div>
          </div>
          <Button 
            onClick={updateConfig} 
            disabled={configLoading}
            className="w-full md:w-auto"
          >
            {configLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Configuration'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Recent Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No responses found</p>
            ) : (
              dashboardData.slice(0, 10).map((response) => (
                <div key={response.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(response.processing_status)}
                      <Badge className={getStatusColor(response.processing_status)}>
                        {response.processing_status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Reply to: {response.reply_to_name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {response.content}
                    </p>
                    {response.escalation_reason && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Escalation reason: {response.escalation_reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{formatDistanceToNow(new Date(response.received_at), { addSuffix: true })}</div>
                    {response.response_time_hours && (
                      <div>Response time: {response.response_time_hours.toFixed(1)}h</div>
                    )}
                    {response.auto_response_generated && (
                      <div className="text-green-600">Auto-response sent</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 