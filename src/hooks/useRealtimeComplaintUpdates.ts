import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeComplaintUpdates() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || role !== "student") return;

    const channel = supabase
      .channel("student-complaint-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "complaints",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          if (newRow.status !== oldRow.status) {
            toast({
              title: "Complaint Updated",
              description: `"${newRow.title}" status changed to ${newRow.status}.`,
            });
          }
          queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role, toast, queryClient]);
}
