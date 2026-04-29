'use client';

import { useEffect, useState } from 'react';
import { useSensorData } from '@/hooks/use-sensor-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, Activity, RefreshCw, Database, Users, Lightbulb, Eye, EyeOff, Power } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface LiveMonitorProps {
  deviceId?: string;
}

export function LiveMonitor({ deviceId = 'node_01' }: LiveMonitorProps) {
  const { latestReading, readings, devices, stats, isLoading, refreshData } = useSensorData({
    deviceId,
    pollingInterval: 5000,
    autoStart: true,
  });

  const [isPulse, setIsPulse] = useState(false);
  const [pirEnabled, setPirEnabled] = useState(true);
  const [ledEnabled, setLedEnabled] = useState(false);
  const [isUpdatingControl, setIsUpdatingControl] = useState(false);

  const device = devices[deviceId];
  const last100Readings = readings.slice(-100);

  useEffect(() => {
    if (latestReading) {
      setIsPulse(true);
      const timer = setTimeout(() => setIsPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [latestReading]);

  // Fetch initial control state
  useEffect(() => {
    fetchControlState();
  }, [deviceId]);

  const fetchControlState = async () => {
    try {
      const response = await fetch(`/api/device-control?device_id=${deviceId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPirEnabled(data.pir_enabled);
          setLedEnabled(data.led_enabled);
        }
      }
    } catch (error) {
      console.error('Failed to fetch control state:', error);
    }
  };

  const updateControlState = async (updates: { pir_enabled?: boolean; led_enabled?: boolean }) => {
    setIsUpdatingControl(true);
    try {
      const response = await fetch('/api/device-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          ...updates,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (updates.pir_enabled !== undefined) setPirEnabled(data.pir_enabled);
          if (updates.led_enabled !== undefined) setLedEnabled(data.led_enabled);
          toast.success('Device control updated successfully');
        }
      } else {
        toast.error('Failed to update device control');
      }
    } catch (error) {
      console.error('Failed to update control:', error);
      toast.error('Failed to update device control');
    } finally {
      setIsUpdatingControl(false);
    }
  };

  const togglePIR = () => {
    updateControlState({ pir_enabled: !pirEnabled });
  };

  const toggleLED = () => {
    updateControlState({ led_enabled: !ledEnabled });
  };

  // Temperature badge logic
  const getTemperatureBadge = (temp: number) => {
    if (temp < 15) return { label: 'Cold', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' };
    if (temp < 20) return { label: 'Cool', variant: 'secondary' as const, color: 'bg-cyan-100 text-cyan-800' };
    if (temp < 25) return { label: 'Comfortable', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
    if (temp < 30) return { label: 'Warm', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' };
    return { label: 'Hot', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' };
  };

  // Humidity badge logic
  const getHumidityBadge = (humidity: number) => {
    if (humidity < 30) return { label: 'Dry', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' };
    if (humidity < 50) return { label: 'Comfortable', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
    if (humidity < 70) return { label: 'Humid', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' };
    return { label: 'Very Humid', variant: 'destructive' as const, color: 'bg-indigo-100 text-indigo-800' };
  };

  const tempBadge = latestReading ? getTemperatureBadge(latestReading.temperature) : null;
  const humidityBadge = latestReading ? getHumidityBadge(latestReading.humidity) : null;

  return (
    <div className="space-y-6">
      {/* Header with Device Info */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Sensor Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Real-time temperature, humidity & occupancy tracking
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
              <p className="text-muted-foreground">Occupancy Rate</p>
              <p className="font-semibold">{stats ? `${stats.occupancyRate.toFixed(1)}%` : 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Device Controls</CardTitle>
          <CardDescription>
            Control PIR sensor and LED remotely • Current Status: PIR {pirEnabled ? 'ON' : 'OFF'} | LED {ledEnabled ? 'ON' : 'OFF'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={pirEnabled ? 'default' : 'outline'}
              size="default"
              onClick={togglePIR}
              disabled={isUpdatingControl}
              className={`flex-1 min-w-[200px] ${pirEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {isUpdatingControl ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : pirEnabled ? (
                <>
                  <Eye className="h-5 w-5 mr-2" />
                  PIR Sensor: ON
                </>
              ) : (
                <>
                  <EyeOff className="h-5 w-5 mr-2" />
                  PIR Sensor: OFF
                </>
              )}
            </Button>
            <Button
              variant={ledEnabled ? 'default' : 'outline'}
              size="default"
              onClick={toggleLED}
              disabled={isUpdatingControl}
              className={`flex-1 min-w-[200px] ${ledEnabled ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
            >
              {isUpdatingControl ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : ledEnabled ? (
                <>
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Control LED: ON
                </>
              ) : (
                <>
                  <Power className="h-5 w-5 mr-2" />
                  Control LED: OFF
                </>
              )}
            </Button>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            {isUpdatingControl ? (
              <p className="flex items-center gap-2">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Sending command to device...
              </p>
            ) : (
              <p>
                Changes will be applied to ESP32 within 5 seconds
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Readings */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Temperature Card */}
        <Card className={isPulse ? 'animate-pulse-subtle' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Temperature</CardTitle>
              <Thermometer className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-4xl font-bold tracking-tight">
                {latestReading ? `${latestReading.temperature.toFixed(1)}°C` : 'N/A'}
              </div>
              {tempBadge && (
                <Badge className={tempBadge.color}>
                  {tempBadge.label}
                </Badge>
              )}
              {stats && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
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

        {/* Humidity Card */}
        <Card className={isPulse ? 'animate-pulse-subtle' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Humidity</CardTitle>
              <Droplets className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-4xl font-bold tracking-tight">
                {latestReading ? `${latestReading.humidity.toFixed(1)}%` : 'N/A'}
              </div>
              {humidityBadge && (
                <Badge className={humidityBadge.color}>
                  {humidityBadge.label}
                </Badge>
              )}
              {stats && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
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

        {/* Occupancy Card */}
        <Card className={isPulse ? 'animate-pulse-subtle' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Room Occupancy</CardTitle>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-4xl font-bold tracking-tight">
                {pirEnabled 
                  ? (latestReading ? (latestReading.occupied ? 'YES' : 'NO') : 'N/A')
                  : 'OFF'
                }
              </div>
              <Badge className={
                !pirEnabled 
                  ? 'bg-gray-100 text-gray-800' 
                  : latestReading?.occupied 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
              }>
                {!pirEnabled ? 'PIR Disabled' : latestReading?.occupied ? 'Occupied' : 'Vacant'}
              </Badge>
              {stats && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <div className="flex justify-between">
                    <span>PIR Status:</span>
                    <span className={`font-mono ${pirEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {pirEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupancy Rate:</span>
                    <span className="font-mono">{stats.occupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Readings:</span>
                    <span className="font-mono">{readings.length}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Time-Series Graphs */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Temperature Timeline Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temperature Trend</CardTitle>
            <CardDescription>Last {last100Readings.length} readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {last100Readings.length > 0 ? (
              <ChartContainer
                config={{
                  temperature: {
                    label: "Temperature",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={last100Readings.map((reading) => ({
                      time: format(new Date(reading.timestamp), 'HH:mm:ss'),
                      temperature: reading.temperature,
                    }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value, index) => {
                        // Show every 10th tick to avoid crowding
                        return index % 10 === 0 ? value : '';
                      }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-sm">
                            <p className="mb-1 text-muted-foreground">{data.time}</p>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Temperature</span>
                              <span className="font-mono text-foreground">{data.temperature.toFixed(1)}°C</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="hsl(24, 95%, 53%)"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-2" />
                No data available. Waiting for sensor data from ESP32.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Humidity Timeline Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Humidity Trend</CardTitle>
            <CardDescription>Last {last100Readings.length} readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            {last100Readings.length > 0 ? (
              <ChartContainer
                config={{
                  humidity: {
                    label: "Humidity",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={last100Readings.map((reading) => ({
                      time: format(new Date(reading.timestamp), 'HH:mm:ss'),
                      humidity: reading.humidity,
                    }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value, index) => {
                        // Show every 10th tick to avoid crowding
                        return index % 10 === 0 ? value : '';
                      }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={[0, 100]}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-sm">
                            <p className="mb-1 text-muted-foreground">{data.time}</p>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Humidity</span>
                              <span className="font-mono text-foreground">{data.humidity.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-2" />
                No data available. Waiting for sensor data from ESP32.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupancy Timeline</CardTitle>
          <CardDescription>Room occupancy history - Last {last100Readings.length} readings</CardDescription>
        </CardHeader>
        <CardContent>
          {last100Readings.length > 0 ? (
            <div className="h-24 flex items-stretch gap-[2px]">
              {last100Readings.map((reading, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded ${
                    reading.occupied 
                      ? 'bg-green-500' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  } hover:opacity-80 transition-opacity cursor-pointer`}
                  title={`${reading.occupied ? 'Occupied' : 'Vacant'} at ${format(
                    new Date(reading.timestamp),
                    'HH:mm:ss'
                  )}`}
                />
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
              <Activity className="h-4 w-4 mr-2" />
              No data available. Waiting for sensor data from ESP32.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
