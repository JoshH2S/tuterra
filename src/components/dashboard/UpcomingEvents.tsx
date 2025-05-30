import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { format, parseISO, isPast, isToday } from "date-fns";

interface UpcomingEventsProps {
  className?: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  type?: string;
  session_id?: string;
}

export function UpcomingEvents({ className = "" }: UpcomingEventsProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get user's internship sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('internship_sessions')
          .select('id')
          .eq('user_id', user.id);
        
        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError);
          setError('Failed to load events');
          return;
        }
        
        if (!sessions?.length) {
          setEvents([]);
          return;
        }
        
        const sessionIds = sessions.map(s => s.id);
        
        // Get all events for these sessions
        const { data: eventData, error: eventsError } = await supabase
          .from('internship_events')
          .select('*')
          .in('session_id', sessionIds)
          .order('date', { ascending: true });
        
        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          setError('Failed to load events');
          return;
        }
        
        // Filter to upcoming events and today's events
        const now = new Date();
        const upcomingEvents = eventData.filter(event => {
          const eventDate = parseISO(event.date);
          return !isPast(eventDate) || isToday(eventDate);
        }).slice(0, 5); // Limit to 5 events
        
        setEvents(upcomingEvents);
      } catch (err) {
        console.error('Unexpected error fetching events:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [user]);

  const getEventStatusClass = (date: string) => {
    const eventDate = parseISO(date);
    if (isToday(eventDate)) return "text-yellow-500";
    return "text-green-500";
  };

  if (loading) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6 h-full">
          <LoadingSpinner size="default" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-base font-medium flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          Upcoming Events
        </h3>
        
        {events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded-full bg-muted ${getEventStatusClass(event.date)}`}>
                    {isToday(parseISO(event.date)) ? "Today" : "Upcoming"}
                  </div>
                </div>
                
                <div className="mt-2 flex items-center text-xs text-muted-foreground gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {format(parseISO(event.date), "MMM d, yyyy - h:mm a")}
                  </span>
                </div>
                
                {event.description && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 