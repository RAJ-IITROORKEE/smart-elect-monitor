"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Lightbulb, Power, CheckCircle2, Clock, Bell } from "lucide-react";
import { useSensorData } from "@/hooks/use-sensor-data";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "energy_waste" | "high_temp" | "low_humidity" | "high_humidity";
  severity: "warning" | "critical";
  message: string;
  timestamp: string;
  acknowledged: boolean;
  deviceId: string;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const { devices, readings: deviceReadings } = useSensorData({ deviceId: "node_01", autoStart: true });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [ledEnabled, setLedEnabled] = useState(false);
  const [pirEnabled, setPirEnabled] = useState(true);
  const [isUpdatingControl, setIsUpdatingControl] = useState(false);

  const device = devices["node_01"];
  const latestReading = deviceReadings[deviceReadings.length - 1];

  // Fetch current control state
  const fetchControlState = async () => {
    try {
      const response = await fetch("/api/device-control?device_id=node_01");
      if (response.ok) {
        const data = await response.json();
        setLedEnabled(data.led_enabled);
        setPirEnabled(data.pir_enabled);
      }
    } catch (error) {
      console.error("Error fetching control state:", error);
    }
  };

  // Turn off LED
  const turnOffLED = async () => {
    setIsUpdatingControl(true);
    try {
      const response = await fetch("/api/device-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: "node_01",
          led_enabled: false,
        }),
      });

      if (response.ok) {
        setLedEnabled(false);
        toast({
          title: "LED Turned Off",
          description: "Control LED has been disabled successfully",
        });
      }
    } catch (error) {
      console.error("Error turning off LED:", error);
      toast({
        title: "Error",
        description: "Failed to turn off LED",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingControl(false);
    }
  };

  // Generate alerts based on current data
  useEffect(() => {
    if (!latestReading) return;

    const newAlerts: Alert[] = [];
    const timestamp = new Date().toISOString();

    // Energy Waste Alert: LED ON but room is NOT occupied
    if (ledEnabled && !latestReading.occupied && pirEnabled) {
      newAlerts.push({
        id: `energy_waste_${timestamp}`,
        type: "energy_waste",
        severity: "warning",
        message: `LED is ON but room is not occupied. Turn off LED to save energy.`,
        timestamp,
        acknowledged: false,
        deviceId: "node_01",
      });
    }

    // High Temperature Alert
    if (latestReading.temperature > 30) {
      newAlerts.push({
        id: `high_temp_${timestamp}`,
        type: "high_temp",
        severity: latestReading.temperature > 35 ? "critical" : "warning",
        message: `High temperature detected: ${latestReading.temperature.toFixed(1)}°C`,
        timestamp,
        acknowledged: false,
        deviceId: "node_01",
      });
    }

    // Low Humidity Alert
    if (latestReading.humidity < 30) {
      newAlerts.push({
        id: `low_humidity_${timestamp}`,
        type: "low_humidity",
        severity: "warning",
        message: `Low humidity detected: ${latestReading.humidity.toFixed(1)}%`,
        timestamp,
        acknowledged: false,
        deviceId: "node_01",
      });
    }

    // High Humidity Alert
    if (latestReading.humidity > 70) {
      newAlerts.push({
        id: `high_humidity_${timestamp}`,
        type: "high_humidity",
        severity: "warning",
        message: `High humidity detected: ${latestReading.humidity.toFixed(1)}%`,
        timestamp,
        acknowledged: false,
        deviceId: "node_01",
      });
    }

    setAlerts(newAlerts);
  }, [latestReading, ledEnabled, pirEnabled]);

  // Fetch control state on mount and periodically
  useEffect(() => {
    fetchControlState();
    const interval = setInterval(fetchControlState, 5000);
    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been marked as acknowledged",
    });
  };

  const getSeverityColor = (severity: string) => {
    return severity === "critical"
      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "energy_waste":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case "high_temp":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "low_humidity":
      case "high_humidity":
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return "Just now";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Critical alerts and energy-saving recommendations
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {activeAlerts.length} Active Alert{activeAlerts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Room Status</CardTitle>
          <CardDescription>Real-time occupancy and LED control state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground mb-2">Room Occupancy</p>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    latestReading?.occupied
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  }
                >
                  {pirEnabled 
                    ? (latestReading?.occupied ? "Occupied" : "Vacant")
                    : "PIR Disabled"
                  }
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground mb-2">Control LED Status</p>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    ledEnabled
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  }
                >
                  {ledEnabled ? (
                    <>
                      <Lightbulb className="h-3 w-3 mr-1" />
                      LED ON
                    </>
                  ) : (
                    <>
                      <Power className="h-3 w-3 mr-1" />
                      LED OFF
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick Action</p>
              <Button
                size="sm"
                variant={ledEnabled ? "destructive" : "outline"}
                onClick={turnOffLED}
                disabled={!ledEnabled || isUpdatingControl}
                className="w-full"
              >
                {isUpdatingControl ? (
                  <>
                    <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Power className="h-3.5 w-3.5 mr-1.5" />
                    Turn Off LED
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Active Alerts
          </CardTitle>
          <CardDescription>
            Alerts requiring attention or action
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border border-border/60 bg-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        <span className="font-mono">{alert.deviceId}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {alert.type === "energy_waste" && ledEnabled && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={turnOffLED}
                            disabled={isUpdatingControl}
                          >
                            <Power className="h-3.5 w-3.5 mr-1.5" />
                            Turn Off LED Now
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
              <p>No active alerts</p>
              <p className="text-xs mt-1">All systems operating normally</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acknowledged Alerts</CardTitle>
            <CardDescription>Previously acknowledged notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {acknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg border border-border/60 bg-muted/30 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div>{getTypeIcon(alert.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Acknowledged • {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
