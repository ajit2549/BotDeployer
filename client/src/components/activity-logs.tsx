import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BotLog } from "@shared/schema";

export function ActivityLogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Logs query
  const { data: logs, isLoading } = useQuery<BotLog[]>({
    queryKey: ["/api/bot/logs"],
    refetchInterval: 5000,
  });

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/bot/logs"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/logs"] });
      toast({ title: "Logs cleared successfully", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to clear logs", variant: "destructive" });
    },
  });

  const refreshLogs = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/bot/logs"] });
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "success":
        return "text-green-400";
      case "info":
        return "text-blue-400";
      case "warn":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Activity Logs
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => clearLogsMutation.mutate()}
              disabled={clearLogsMutation.isPending}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              data-testid="button-clear-logs"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              onClick={refreshLogs}
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700"
              data-testid="button-refresh-logs"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {isLoading ? (
            <div className="text-gray-500">Loading logs...</div>
          ) : logs && logs.length > 0 ? (
            logs.map((log: any, index: number) => (
              <div key={log.id || index} className={`${getLogColor(log.level)} mb-1`}>
                <span className="text-gray-500">
                  [{formatDate(log.timestamp)} {formatTime(log.timestamp)}]
                </span>{" "}
                {log.message}
              </div>
            ))
          ) : (
            <div className="text-gray-500">No logs available</div>
          )}
          <div className="animate-pulse">
            <span className="text-gray-500">
              [{formatDate(new Date().toISOString())} {formatTime(new Date().toISOString())}]
            </span>{" "}
            <span className="text-white">_</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
