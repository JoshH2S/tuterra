import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function DebugTaskSubmission() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [requestPayload, setRequestPayload] = useState<any>(null);
  const [responseDetails, setResponseDetails] = useState<any>(null);
  
  const checkTableStructure = async () => {
    setLoading(true);
    setError(null);
    setRequestPayload(null);
    setResponseDetails(null);
    
    try {
      // Try to fetch a sample row to inspect the columns
      const { data: columnData, error: columnError } = await supabase
        .from('internship_task_submissions')
        .select('*')
        .limit(1);
        
      if (columnError) throw columnError;
      
      setResults({
        sampleRow: columnData && columnData.length > 0 ? columnData[0] : null,
        columnNames: columnData && columnData.length > 0 
          ? Object.keys(columnData[0]) 
          : 'No data available to determine columns'
      });
      
    } catch (err: any) {
      console.error('Debug error:', err);
      setError(err.message || 'An error occurred');
      setResponseDetails(err);
    } finally {
      setLoading(false);
    }
  };
  
  const testSimpleSubmission = async () => {
    if (!sessionId || !taskId) {
      setError('Please provide session ID and task ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    setRequestPayload(null);
    setResponseDetails(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create the submission payload
      const payload = {
        session_id: sessionId,
        task_id: taskId,
        user_id: user.id,
        response_text: 'Debug test submission',
        content_type: 'text',
        status: 'submitted'
      };
      
      // Save the payload for debugging
      setRequestPayload(payload);
      
      // Try a minimal submission
      const response = await supabase
        .from('internship_task_submissions')
        .insert(payload)
        .select()
        .single();
        
      // Capture both success and error responses
      setResponseDetails(response);
      
      if (response.error) throw response.error;
      
      setResults({
        submission: response.data
      });
      
    } catch (err: any) {
      console.error('Test submission error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const checkUserPermissions = async () => {
    setLoading(true);
    setError(null);
    setRequestPayload(null);
    setResponseDetails(null);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');
      
      // Check if the user exists in profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Check if the session exists and belongs to the user
      const { data: sessionData, error: sessionError } = await supabase
        .from('internship_sessions')
        .select('id, user_id')
        .eq('id', sessionId)
        .single();
        
      if (sessionError) throw sessionError;
      
      // Check if the task exists and belongs to the session
      const { data: taskData, error: taskError } = await supabase
        .from('internship_tasks')
        .select('id, session_id')
        .eq('id', taskId)
        .single();
        
      if (taskError) throw taskError;
      
      setResults({
        user: {
          id: user.id,
          email: user.email
        },
        profile: profileData,
        session: sessionData,
        task: taskData,
        validations: {
          userMatchesSession: user.id === sessionData.user_id,
          taskMatchesSession: taskData.session_id === sessionId
        }
      });
      
    } catch (err: any) {
      console.error('Permission check error:', err);
      setError(err.message || 'An error occurred');
      setResponseDetails(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Debug Task Submission</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              onClick={checkTableStructure}
              disabled={loading}
              variant="secondary"
            >
              Check Table Structure
            </Button>
            
            <Button 
              onClick={checkUserPermissions}
              disabled={loading || !sessionId || !taskId}
              variant="outline"
            >
              Check Permissions
            </Button>
          </div>
          
          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1">
              <label className="text-sm font-medium">Session ID</label>
              <Input 
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-sm font-medium">Task ID</label>
              <Input 
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Enter task ID"
              />
            </div>
            <Button 
              onClick={testSimpleSubmission}
              disabled={loading || !sessionId || !taskId}
            >
              Test Submission
            </Button>
          </div>
        </div>
        
        {loading && <div className="text-center">Loading...</div>}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 whitespace-pre-wrap">
            <h3 className="font-bold mb-2">Error:</h3>
            {error}
          </div>
        )}
        
        {requestPayload && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 overflow-auto max-h-40">
            <h3 className="font-bold mb-2">Request Payload:</h3>
            <pre className="text-xs">{JSON.stringify(requestPayload, null, 2)}</pre>
          </div>
        )}
        
        {responseDetails && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 overflow-auto max-h-40">
            <h3 className="font-bold mb-2">Full Response:</h3>
            <pre className="text-xs">{JSON.stringify(responseDetails, null, 2)}</pre>
          </div>
        )}
        
        {results && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3 overflow-auto max-h-96">
            <h3 className="font-bold mb-2">Results:</h3>
            <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 