'use client';

import { LiveMonitor } from "@/components/live-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSensorData } from "@/hooks/use-sensor-data";
import { SensorDataService } from "@/lib/sensor-data-service";
import { Download, Trash2, Server } from "lucide-react";
import { toast } from "sonner";

export default function LiveDataPage() {
  const { devices, exportData } = useSensorData({ autoStart: true });

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all sensor data? This action cannot be undone.')) {
      try {
        SensorDataService.clearAllData();
        toast.success('All data cleared successfully');
        window.location.reload();
      } catch (error) {
        toast.error('Failed to clear data');
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Data Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Real-time telemetry and device monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearAllData}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Devices Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Devices</CardTitle>
          <CardDescription>
            Overview of all connected sensor nodes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(devices).length > 0 ? (
            <div className="space-y-3">
              {Object.values(devices).map((device) => (
                <div
                  key={device.device_id}
                  className="flex items-center justify-between p-3 border border-border/60 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Server className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{device.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{device.device_id}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">
                      {device.totalReadings} readings
                    </p>
                    <p className={`text-xs ${device.status === 'online' ? 'text-green-500' : 'text-gray-500'}`}>
                      {device.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No devices registered yet. Start sending data from your sensor nodes.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Monitor */}
      <LiveMonitor deviceId="node_01" />
    </div>
  );
}
