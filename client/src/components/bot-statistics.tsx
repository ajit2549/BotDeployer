import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { BotStats } from "@shared/schema";

export function BotStatistics() {
  // Statistics query
  const { data: stats, isLoading } = useQuery<BotStats>({
    queryKey: ["/api/bot/stats"],
    refetchInterval: 10000,
  });

  const formatUptime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bot Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Messages Processed</span>
              <span className="text-sm font-semibold text-gray-900" data-testid="text-messages-processed">
                {stats?.messagesProcessed?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Promos Detected</span>
              <span className="text-sm font-semibold text-gray-900" data-testid="text-promos-detected">
                {stats?.promosDetected?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">AI Responses</span>
              <span className="text-sm font-semibold text-gray-900" data-testid="text-ai-responses">
                {stats?.aiResponses?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-semibold text-green-600" data-testid="text-uptime">
                {stats?.startTime ? formatUptime(stats.startTime.toString()) : "0m"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replit Integration */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Replit Deployment</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Deploy to Replit for 24/7 hosting with automatic restarts and monitoring.
          </p>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="button-replit-deploy"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Deploy to Replit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
