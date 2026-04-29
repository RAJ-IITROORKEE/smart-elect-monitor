'use client';

import { useEffect, useState } from 'react';
import { useSensorData, useSimulateSensorData } from '@/hooks/use-sensor-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, Activity, RefreshCw, Database, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

interface LiveMonitorProps {
  deviceId?: string;
}

export function LiveMonitor({ deviceId = 'node_01' }: LiveMonitorProps) {
  const { latestReading, readings, devices, stats, isLoading, refreshData } = useSensorData({
    deviceId,
    pollingInterval: 5000,
    autoStart: true,
  });

  const { isSimulating, startSimulation, stopSimulation } = useSimulateSensorData(deviceId, 10000);
  const [isPulse, setIsPulse] = useState(false);

  const device = devices[deviceId];
  const last24Hours = readings.slice(-144); // Last 24 hours (assuming 10s intervals = 144 in 24min for demo)

  useEffect(() => {
    if (latestReading) {
      setIsPulse(true);
      const timer = setTimeout(() => setIsPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [latestReading]);

  const temperatureColor = latestReading
    ? latestReading.temperature > 30
      ? 'text-red-500'
      : latestReading.temperature > 25
      ? 'text-orange-500'
      : 'text-green-500'
    : 'text-muted-foreground';

  const humidityColor = latestReading
    ? latestReading.humidity > 70
      ? 'text-blue-500'
      : latestReading.humidity > 50
      ? 'text-cyan-500'
      : 'text-yellow-500'
    : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Header with Device Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Sensor Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Real-time temperature and humidity tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={isSimulating ? 'destructive' : 'default'}
            size="sm"
            onClick={isSimulating ? stopSimulation : startSimulation}
          >
            {isSimulating ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Device Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Device Status</CardTitle>
            <Badge variant={device?.status === 'online' ? 'default' : 'secondary'}>
              <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                device?.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              {device?.status || 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Device ID</p>
              <p className="font-mono font-semibold">{deviceId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Seen</p>
              <p className="font-semibold">
                {device?.lastSeen ? format(new Date(device.lastSeen), 'HH:mm:ss') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Readings</p>
              <p className="font-semibold">{readings.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Storage</p>
              <p className="font-semibold flex items-center gap-1">
                <Database className="h-3 w-3" />
                Local
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Readings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={isPulse ? 'animate-pulse-subtle' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Temperature</CardTitle>
              <Thermometer className={`h-5 w-5 ${temperatureColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-4xl font-bold tracking-tight ${temperatureColor}`}>
                {latestReading ? `${latestReading.temperature.toFixed(1)}°C` : 'N/A'}
              </div>
              {stats && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Min (24h):</span>
                    <span className="font-mono">{stats.minTemperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max (24h):</span>
                    <span className="font-mono">{stats.maxTemperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg (24h):</span>
                    <span className="font-mono">{stats.avgTemperature.toFixed(1)}°C</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={isPulse ? 'animate-pulse-subtle' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Humidity</CardTitle>
              <Droplets className={`h-5 w-5 ${humidityColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-4xl font-bold tracking-tight ${humidityColor}`}>
                {latestReading ? `${latestReading.humidity.toFixed(1)}%` : 'N/A'}
              </div>
              {stats && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Min (24h):</span>
                    <span className="font-mono">{stats.minHumidity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max (24h):</span>
                    <span className="font-mono">{stats.maxHumidity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg (24h):</span>
                    <span className="font-mono">{stats.avgHumidity.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Temperature Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temperature Timeline</CardTitle>
            <CardDescription>Last {last24Hours.length} readings</CardDescription>
          </CardHeader>
          <CardContent>
            {last24Hours.length > 0 ? (
              <div className="h-48 flex items-end gap-1">
                {last24Hours.map((reading, idx) => {
                  const heightPercent = ((reading.temperature - 15) / 20) * 100; // Scale 15-35°C
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-orange-500 to-red-500 rounded-t hover:opacity-80 transition-opacity"
                      style={{ height: `${Math.max(5, Math.min(100, heightPercent))}%` }}
                      title={`${reading.temperature.toFixed(1)}°C at ${format(
                        new Date(reading.timestamp),
                        'HH:mm:ss'
                      )}`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-2" />
                No data available. Start simulation or wait for sensor data.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Humidity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Humidity Timeline</CardTitle>
            <CardDescription>Last {last24Hours.length} readings</CardDescription>
          </CardHeader>
          <CardContent>
            {last24Hours.length > 0 ? (
              <div className="h-48 flex items-end gap-1">
                {last24Hours.map((reading, idx) => {
                  const heightPercent = (reading.humidity / 100) * 100; // Scale 0-100%
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t hover:opacity-80 transition-opacity"
                      style={{ height: `${Math.max(5, Math.min(100, heightPercent))}%` }}
                      title={`${reading.humidity.toFixed(1)}% at ${format(
                        new Date(reading.timestamp),
                        'HH:mm:ss'
                      )}`}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-2" />
                No data available. Start simulation or wait for sensor data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
