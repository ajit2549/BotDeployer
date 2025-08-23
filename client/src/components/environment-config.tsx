import { useState, useEffect } from "react";
import { Eye, EyeOff, Save, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BotConfig } from "@shared/schema";

export function EnvironmentConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    openrouterApiKey: "",
    targetGroupId: "",
    forwardToGroupId: "",
  });

  // Get current config
  const { data: config, isLoading } = useQuery<BotConfig>({
    queryKey: ["/api/bot/config"],
  });

  // Update form data when config changes
  useEffect(() => {
    if (config) {
      setFormData({
        openrouterApiKey: config.openrouterApiKey || "",
        targetGroupId: config.targetGroupId || "",
        forwardToGroupId: config.forwardToGroupId || "",
      });
    }
  }, [config]);

  // Save config mutation
  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/bot/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/config"] });
      toast({ title: "Configuration saved successfully", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to save configuration", variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Environment Configuration
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            variant="ghost"
            className="text-primary-600 hover:text-primary-700"
            data-testid="button-save-config"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* OpenRouter API Key */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              OpenRouter API Key
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="sk-or-..."
                value={formData.openrouterApiKey}
                onChange={(e) => handleInputChange("openrouterApiKey", e.target.value)}
                className="pr-10"
                data-testid="input-api-key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                data-testid="button-toggle-api-key"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Target Group ID */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              Target Group ID
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="120363123456789012@g.us"
              value={formData.targetGroupId}
              onChange={(e) => handleInputChange("targetGroupId", e.target.value)}
              data-testid="input-target-group"
            />
          </div>

          {/* Forward to Group ID */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              Forward to Group ID
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="120363987654321098@g.us"
              value={formData.forwardToGroupId}
              onChange={(e) => handleInputChange("forwardToGroupId", e.target.value)}
              data-testid="input-forward-group"
            />
          </div>

          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-sm text-blue-700">
              <strong>How to get Group IDs:</strong> Add the bot to your groups first,
              then check the console logs when messages are sent. Group IDs look like
              "120363123456789012@g.us"
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
