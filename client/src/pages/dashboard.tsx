import { MessageSquare, RefreshCw } from "lucide-react";
import { DeploymentStatus } from "@/components/deployment-status";
import { QRCodePanel } from "@/components/qr-code-panel";
import { EnvironmentConfig } from "@/components/environment-config";
import { ActivityLogs } from "@/components/activity-logs";
import { BotStatistics } from "@/components/bot-statistics";
import { useBotStatus } from "@/hooks/use-bot-status";

export default function Dashboard() {
  const { status, isLoading } = useBotStatus();

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="text-3xl text-green-500 w-8 h-8" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  WhatsApp Bot Deployment
                </h1>
                <p className="text-sm text-gray-500">
                  Deploy and manage your AI assistant bot
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  status?.isRunning && status?.isAuthenticated
                    ? "bg-green-100 text-green-800"
                    : status?.isRunning
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                data-testid="status-indicator"
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${
                    status?.isRunning && status?.isAuthenticated
                      ? "bg-green-400"
                      : status?.isRunning
                      ? "bg-yellow-400"
                      : "bg-gray-400"
                  }`}
                ></span>
                {status?.isRunning && status?.isAuthenticated
                  ? "Active"
                  : status?.isRunning
                  ? "Starting"
                  : "Inactive"}
              </span>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
                data-testid="button-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <DeploymentStatus />
            <EnvironmentConfig />
            <ActivityLogs />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QRCodePanel />
            <BotStatistics />
          </div>
        </div>
      </div>
    </div>
  );
}
