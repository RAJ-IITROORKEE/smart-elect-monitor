'use client';

import { useEffect, useState } from 'react';
import { useSensorData, useSimulateSensorData } from '@/hooks/use-sensor-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, Activity, RefreshCw, Database, Play, Pause, Users, Lightbulb, Eye, EyeOff, Power } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

      {/* Separate Line Graphs */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Temperature Timeline Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temperature Trend</CardTitle>
            <CardDescription>Last {last100Readings.length} readings</CardDescription>
          </CardHeader>
          <CardContent>
            {last100Readings.length > 0 ? (
              <div className="h-48 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="45" x2="400" y2="45" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  <line x1="0" y1="135" x2="400" y2="135" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  
                  {/* Temperature line path */}
                  <path
                    d={last100Readings.map((reading, idx) => {
                      const x = (idx / (last100Readings.length - 1)) * 400;
                      const tempNormalized = ((reading.temperature - 10) / 30); // Normalize 10-40°C to 0-1
                      const y = 180 - (tempNormalized * 180); // Invert Y axis
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(0, Math.min(180, y))}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgb(249, 115, 22)"
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Data points */}
                  {last100Readings.map((reading, idx) => {
                    const x = (idx / (last100Readings.length - 1)) * 400;
                    const tempNormalized = ((reading.temperature - 10) / 30);
                    const y = 180 - (tempNormalized * 180);
                    const temp = reading.temperature;
                    const color = temp > 30 ? 'rgb(239, 68, 68)' : temp > 25 ? 'rgb(249, 115, 22)' : 'rgb(34, 197, 94)';
                    
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={Math.max(0, Math.min(180, y))}
                        r="3"
                        fill={color}
                        className="hover:r-5 transition-all cursor-pointer"
                      >
                        <title>{`${reading.temperature.toFixed(1)}°C at ${format(new Date(reading.timestamp), 'HH:mm:ss')}`}</title>
                      </circle>
                    );
                  })}
                </svg>
                {/* Y-axis labels */}
                <div className="absolute top-0 left-0 text-xs text-muted-foreground">40°C</div>
                <div className="absolute top-1/2 left-0 text-xs text-muted-foreground -translate-y-1/2">25°C</div>
                <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">10°C</div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                <Activity className="h-4 w-4 mr-2" />
                No data available. Start simulation or wait for sensor data.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Humidity Timeline Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Humidity Trend</CardTitle>
            <CardDescription>Last {last100Readings.length} readings</CardDescription>
          </CardHeader>
          <CardContent>
            {last100Readings.length > 0 ? (
              <div className="h-48 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="45" x2="400" y2="45" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  <line x1="0" y1="135" x2="400" y2="135" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
                  
                  {/* Humidity line path */}
                  <path
                    d={last100Readings.map((reading, idx) => {
                      const x = (idx / (last100Readings.length - 1)) * 400;
                      const humidityNormalized = reading.humidity / 100; // Normalize 0-100% to 0-1
                      const y = 180 - (humidityNormalized * 180); // Invert Y axis
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${Math.max(0, Math.min(180, y))}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Data points */}
                  {last100Readings.map((reading, idx) => {
                    const x = (idx / (last100Readings.length - 1)) * 400;
                    const humidityNormalized = reading.humidity / 100;
                    const y = 180 - (humidityNormalized * 180);
                    const humidity = reading.humidity;
                    const color = humidity > 70 ? 'rgb(99, 102, 241)' : humidity > 50 ? 'rgb(59, 130, 246)' : 'rgb(34, 211, 238)';
                    
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={Math.max(0, Math.min(180, y))}
                        r="3"
                        fill={color}
                        className="hover:r-5 transition-all cursor-pointer"
                      >
                        <title>{`${reading.humidity.toFixed(1)}% at ${format(new Date(reading.timestamp), 'HH:mm:ss')}`}</title>
                      </circle>
                    );
                  })}
                </svg>
                {/* Y-axis labels */}
                <div className="absolute top-0 left-0 text-xs text-muted-foreground">100%</div>
                <div className="absolute top-1/2 left-0 text-xs text-muted-foreground -translate-y-1/2">50%</div>
                <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">0%</div>
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
              No data available. Start simulation or wait for sensor data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
