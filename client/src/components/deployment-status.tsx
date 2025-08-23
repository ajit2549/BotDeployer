import { Rocket, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useBotStatus } from "@/hooks/use-bot-status";

export function DeploymentStatus() {
  const { status, startBot, isStarting } = useBotStatus();

  const getProgress = () => {
    if (!status?.isRunning) return 0;
    if (status.isRunning && !status.isAuthenticated) return 50;
    if (status.isRunning && status.isAuthenticated) return 100;
    return 0;
  };

  const deploymentSteps = [
    {
      title: "Environment Variables Configured",
      description: "All required API keys and group IDs set",
      status: "complete",
      icon: Check,
    },
    {
      title: "Bot Authentication",
      description: status?.isAuthenticated
        ? "WhatsApp authenticated successfully"
        : "Waiting for WhatsApp QR scan",
      status: status?.isAuthenticated
        ? "complete"
        : status?.isRunning
        ? "in-progress"
        : "pending",
      icon: status?.isAuthenticated ? Check : Loader2,
    },
    {
      title: "24/7 Monitoring Active",
      description: "Continuous deployment monitoring",
      status: status?.isRunning && status?.isAuthenticated ? "complete" : "pending",
      icon: status?.isRunning && status?.isAuthenticated ? Check : Loader2,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Deployment Status
          </CardTitle>
          <Button
            onClick={() => startBot()}
            disabled={isStarting || status?.isRunning}
            className="bg-primary-500 hover:bg-primary-600 text-white"
            data-testid="button-deploy"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {isStarting ? "Deploying..." : status?.isRunning ? "Running" : "Deploy Now"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Deployment Progress
            </span>
            <span className="text-sm text-gray-500" data-testid="text-progress">
              {getProgress()}%
            </span>
          </div>
          <Progress value={getProgress()} className="w-full" />
        </div>

        {/* Deployment Steps */}
        <div className="space-y-3">
          {deploymentSteps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.status === "complete"
                      ? "bg-green-500"
                      : step.status === "in-progress"
                      ? "bg-primary-500"
                      : "bg-gray-300"
                  }`}
                >
                  <step.icon
                    className={`text-white text-xs w-3 h-3 ${
                      step.status === "in-progress" ? "animate-spin" : ""
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.status === "pending" ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-xs ${
                    step.status === "pending" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {step.description}
                </p>
              </div>
              <span
                className={`text-xs font-medium ${
                  step.status === "complete"
                    ? "text-green-600"
                    : step.status === "in-progress"
                    ? "text-primary-600"
                    : "text-gray-400"
                }`}
              >
                {step.status === "complete"
                  ? "Complete"
                  : step.status === "in-progress"
                  ? "In Progress"
                  : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
