'use client';

import { LiveMonitor } from "@/components/live-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSensorData } from "@/hooks/use-sensor-data";
import { SensorDataService } from "@/lib/sensor-data-service";
import { Download, Trash2, Server, BarChart3, Table as TableIcon, Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";

export default function LiveDataPage() {
  const { devices, exportData, readings, stats: deviceStats } = useSensorData({ deviceId: "node_01", autoStart: true });
  const [activeTab, setActiveTab] = useState("graphs");
  
  // Get device info for node_01
  const device = devices["node_01"];
  
  // Use readings from the hook (not from device)
  const deviceReadings = readings;
  
  // Calculate insights
  const insights = useMemo(() => {
    if (deviceReadings.length === 0) return null;
    
    const latestReading = deviceReadings[deviceReadings.length - 1];
    
    // Calculate trends (last 10 readings)
    const recentReadings = deviceReadings.slice(-10);
    const tempTrend = recentReadings.length >= 2 
      ? recentReadings[recentReadings.length - 1].temperature - recentReadings[0].temperature 
      : 0;
    const humidityTrend = recentReadings.length >= 2 
      ? recentReadings[recentReadings.length - 1].humidity - recentReadings[0].humidity 
      : 0;
    
    // Check for anomalies
    const highTemp = latestReading.temperature > 30;
    const lowHumidity = latestReading.humidity < 30;
    const highHumidity = latestReading.humidity > 70;
    
    return {
      temperature: {
        current: latestReading.temperature,
        trend: tempTrend,
        status: highTemp ? "warning" : "normal",
      },
      humidity: {
        current: latestReading.humidity,
        trend: humidityTrend,
        status: lowHumidity || highHumidity ? "warning" : "normal",
      },
      occupancy: {
        rate: deviceStats?.occupancyRate || 0,
        current: latestReading.occupied,
      },
      anomalies: {
        highTemp,
        lowHumidity,
        highHumidity,
      }
    };
  }, [deviceReadings, deviceStats]);

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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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

      {/* Key Insights */}
      {insights && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Key Insights
            </CardTitle>
            <CardDescription>
              Real-time analysis and trends based on latest data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Temperature Insight */}
              <div className="p-4 rounded-lg border border-border/60 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Temperature Trend</p>
                  {insights.temperature.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  ) : insights.temperature.trend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-blue-500" />
                  ) : null}
                </div>
                <p className="text-2xl font-bold">
                  {insights.temperature.current.toFixed(1)}°C
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {insights.temperature.trend > 0 ? "+" : ""}
                  {insights.temperature.trend.toFixed(1)}°C in last 10 readings
                </p>
                {insights.anomalies.highTemp && (
                  <Badge variant="destructive" className="mt-2 text-[10px]">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    High Temperature
                  </Badge>
                )}
              </div>

              {/* Humidity Insight */}
              <div className="p-4 rounded-lg border border-border/60 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Humidity Trend</p>
                  {insights.humidity.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  ) : insights.humidity.trend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                  ) : null}
                </div>
                <p className="text-2xl font-bold">
                  {insights.humidity.current.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {insights.humidity.trend > 0 ? "+" : ""}
                  {insights.humidity.trend.toFixed(1)}% in last 10 readings
                </p>
                {(insights.anomalies.lowHumidity || insights.anomalies.highHumidity) && (
                  <Badge variant="destructive" className="mt-2 text-[10px]">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {insights.anomalies.lowHumidity ? "Low Humidity" : "High Humidity"}
                  </Badge>
                )}
              </div>

              {/* Occupancy Insight */}
              <div className="p-4 rounded-lg border border-border/60 bg-card">
                <p className="text-xs font-medium text-muted-foreground mb-2">Room Occupancy</p>
                <p className="text-2xl font-bold">
                  {insights.occupancy.rate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  24-hour occupancy rate
                </p>
                <Badge 
                  className={`mt-2 text-[10px] ${
                    insights.occupancy.current 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  }`}
                >
                  Currently: {insights.occupancy.current ? "Occupied" : "Vacant"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Graphs vs Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="graphs" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Graphs
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Data Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="graphs" className="mt-6">
          <LiveMonitor deviceId="node_01" />
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sensor Data Points</CardTitle>
              <CardDescription>
                All readings with timestamps (showing latest {Math.min(deviceReadings.length, 50)} readings)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deviceReadings.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Temperature (°C)</TableHead>
                        <TableHead>Humidity (%)</TableHead>
                        <TableHead>Occupied</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deviceReadings.slice(-50).reverse().map((reading, idx) => (
                        <TableRow key={`${reading.timestamp}-${idx}`}>
                          <TableCell className="font-mono text-xs">
                            {formatTimestamp(reading.timestamp)}
                          </TableCell>
                          <TableCell className="font-mono">
                            <span className={
                              reading.temperature > 30 ? "text-red-600 font-semibold" :
                              reading.temperature < 18 ? "text-blue-600 font-semibold" :
                              "text-foreground"
                            }>
                              {reading.temperature.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono">
                            <span className={
                              reading.humidity > 70 ? "text-blue-600 font-semibold" :
                              reading.humidity < 30 ? "text-orange-600 font-semibold" :
                              "text-foreground"
                            }>
                              {reading.humidity.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                reading.occupied 
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
                              }
                            >
                              {reading.occupied ? "YES" : "NO"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
