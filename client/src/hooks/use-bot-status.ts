import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BotStatus {
  isRunning: boolean;
  isAuthenticated: boolean;
  qrCode: string | null;
  error: string | null;
}

export function useBotStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  // Bot status query
  const statusQuery = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    refetchInterval: 5000,
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status') {
          queryClient.setQueryData(["/api/bot/status"], data.data);
        } else if (data.type === 'log') {
          queryClient.invalidateQueries({ queryKey: ["/api/bot/logs"] });
          queryClient.invalidateQueries({ queryKey: ["/api/bot/stats"] });
        }
      };
      
      wsRef.current.onerror = () => {
        console.warn('WebSocket connection failed, falling back to polling');
      };
    } catch (error) {
      console.warn('WebSocket not available, using polling only');
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  // Start bot mutation
  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/start"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({ title: "Bot started successfully", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to start bot", variant: "destructive" });
    },
  });

  // Stop bot mutation
  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/stop"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({ title: "Bot stopped successfully", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to stop bot", variant: "destructive" });
    },
  });

  // Restart bot mutation
  const restartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/restart"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({ title: "Bot restarted successfully", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to restart bot", variant: "destructive" });
    },
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    startBot: startMutation.mutate,
    stopBot: stopMutation.mutate,
    restartBot: restartMutation.mutate,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    isRestarting: restartMutation.isPending,
  };
}
