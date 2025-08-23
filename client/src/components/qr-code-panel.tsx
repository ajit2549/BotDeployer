import { RefreshCw, Download, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useBotStatus } from "@/hooks/use-bot-status";

interface QRResponse {
  qrCode: string | null;
  message?: string;
}

export function QRCodePanel() {
  const { status, restartBot, stopBot, isRestarting, isStopping } = useBotStatus();

  // QR Code query
  const { data: qrData, refetch: refetchQR } = useQuery<QRResponse>({
    queryKey: ["/api/bot/qr"],
    refetchInterval: status?.isRunning && !status?.isAuthenticated ? 5000 : false,
  });

  const handleRefreshQR = () => {
    refetchQR();
  };

  return (
    <div className="space-y-6">
      {/* QR Code Authentication */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              WhatsApp Authentication
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Scan the QR code with your WhatsApp to authenticate the bot
            </p>

            {/* QR Code Display */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
              {qrData?.qrCode ? (
                <img
                  src={qrData.qrCode}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48 mx-auto"
                  data-testid="img-qr-code"
                />
              ) : status?.isAuthenticated ? (
                <div className="w-48 h-48 mx-auto flex items-center justify-center bg-green-100 rounded-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-green-800">Authenticated</p>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">QR Code not available</p>
                  </div>
                </div>
              )}
            </div>

            {status?.isAuthenticated ? (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-600">Connected to WhatsApp</span>
              </div>
            ) : status?.isRunning ? (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Waiting for scan...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600">Bot not running</span>
              </div>
            )}

            <Button
              onClick={handleRefreshQR}
              variant="ghost"
              className="mt-4 text-primary-600 hover:text-primary-700"
              data-testid="button-refresh-qr"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={() => restartBot()}
              disabled={isRestarting}
              variant="secondary"
              className="w-full"
              data-testid="button-restart"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isRestarting ? "Restarting..." : "Restart Bot"}
            </Button>
            <Button
              onClick={() => stopBot()}
              disabled={isStopping}
              variant="destructive"
              className="w-full"
              data-testid="button-stop"
            >
              <Square className="w-4 h-4 mr-2" />
              {isStopping ? "Stopping..." : "Stop Bot"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              data-testid="button-download-logs"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
