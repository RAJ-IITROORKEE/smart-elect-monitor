import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define the sensor data interface
interface SensorData {
  device_id: string;
  temperature: number;
  humidity: number;
  occupied: boolean;
  timestamp?: string;
}

const POLLING_INTERVAL_SECONDS = 10; // ESP32 sends data every 10 seconds
const OFFLINE_THRESHOLD_SECONDS = POLLING_INTERVAL_SECONDS * 2; // 20 seconds
const MAX_READINGS_PER_DEVICE = 500;
const SERIES_POINTS = 50; // Number of points for time-series charts

export const dynamic = 'force-dynamic';

// POST handler for receiving sensor data from ESP32
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body: SensorData = await request.json();

    // Validate required fields
    if (!body.device_id || body.temperature === undefined || body.humidity === undefined || body.occupied === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: device_id, temperature, humidity, occupied' 
        },
        { status: 400 }
      );
    }

    // Validate data types and ranges
    if (typeof body.temperature !== 'number' || typeof body.humidity !== 'number' || typeof body.occupied !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data types for temperature, humidity, or occupied' 
        },
        { status: 400 }
      );
    }

    // Store sensor reading in MongoDB
    const sensorReading = await prisma.sensorReading.create({
      data: {
        deviceId: body.device_id,
        deviceName: body.device_id,
        temperature: body.temperature,
        humidity: body.humidity,
        occupied: body.occupied,
      },
    });

    // Update or create device info
    await prisma.deviceInfo.upsert({
      where: { deviceId: body.device_id },
      update: {
        status: 'online',
        lastSeen: new Date(),
        totalReadings: { increment: 1 },
      },
      create: {
        deviceId: body.device_id,
        deviceName: body.device_id,
        status: 'online',
        lastSeen: new Date(),
        totalReadings: 1,
      },
    });

    // Clean up old readings (keep only last MAX_READINGS_PER_DEVICE)
    const totalReadings = await prisma.sensorReading.count({
      where: { deviceId: body.device_id },
    });

    if (totalReadings > MAX_READINGS_PER_DEVICE) {
      const readingsToDelete = totalReadings - MAX_READINGS_PER_DEVICE;
      const oldestReadings = await prisma.sensorReading.findMany({
        where: { deviceId: body.device_id },
        orderBy: { createdAt: 'asc' },
        take: readingsToDelete,
        select: { id: true },
      });

      await prisma.sensorReading.deleteMany({
        where: {
          id: { in: oldestReadings.map(r => r.id) },
        },
      });
    }

    // Log received data (for development/debugging)
    console.log('✓ Stored sensor data:', {
      device_id: body.device_id,
      temperature: `${body.temperature}°C`,
      humidity: `${body.humidity}%`,
      occupied: body.occupied,
      timestamp: sensorReading.createdAt.toISOString(),
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data received successfully',
        data: {
          device_id: body.device_id,
          temperature: body.temperature,
          humidity: body.humidity,
          occupied: body.occupied,
          timestamp: sensorReading.createdAt.toISOString(),
        },
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error processing sensor data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error processing sensor data' 
      },
      { status: 500 }
    );
  }
}

// GET handler to fetch stored sensor data with time-series format
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (deviceId) {
      // Get data for specific device
      const [readings, deviceInfo, totalCount] = await Promise.all([
        prisma.sensorReading.findMany({
          where: { deviceId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.deviceInfo.findUnique({
          where: { deviceId },
        }),
        prisma.sensorReading.count({
          where: { deviceId },
        }),
      ]);

      // Check device online status
      const lastSeenMs = deviceInfo ? Date.now() - deviceInfo.lastSeen.getTime() : null;
      const lastSeenSeconds = lastSeenMs !== null ? Math.max(0, Math.floor(lastSeenMs / 1000)) : null;
      const isOnline = lastSeenSeconds !== null && lastSeenSeconds <= OFFLINE_THRESHOLD_SECONDS;

      // Update device status if changed
      if (deviceInfo && deviceInfo.status !== (isOnline ? 'online' : 'offline')) {
        await prisma.deviceInfo.update({
          where: { deviceId },
          data: { status: isOnline ? 'online' : 'offline' },
        });
      }

      // Format readings for frontend
      const formattedReadings = readings.reverse().map(r => ({
        device_id: r.deviceId,
        temperature: r.temperature,
        humidity: r.humidity,
        occupied: r.occupied,
        timestamp: r.createdAt.toISOString(),
      }));

      // Create time-series data for charts (last SERIES_POINTS)
      const seriesReadings = await prisma.sensorReading.findMany({
        where: { deviceId },
        orderBy: { createdAt: 'desc' },
        take: SERIES_POINTS,
      });

      const series = seriesReadings.reverse().map(r => ({
        timestamp: r.createdAt.toISOString(),
        temperature: r.temperature,
        humidity: r.humidity,
        occupied: r.occupied ? 1 : 0,
      }));

      // Calculate stats
      const tempVals = readings.map(r => r.temperature);
      const humVals = readings.map(r => r.humidity);
      const occupiedCount = readings.filter(r => r.occupied).length;

      const avgTemp = tempVals.length ? +(tempVals.reduce((a, b) => a + b, 0) / tempVals.length).toFixed(1) : null;
      const avgHumidity = humVals.length ? +(humVals.reduce((a, b) => a + b, 0) / humVals.length).toFixed(1) : null;
      const occupancyRate = readings.length ? +((occupiedCount / readings.length) * 100).toFixed(1) : 0;

      return NextResponse.json(
        {
          success: true,
          device_id: deviceId,
          count: formattedReadings.length,
          totalCount,
          readings: formattedReadings,
          latest: formattedReadings[formattedReadings.length - 1] || null,
          series,
          stats: {
            avgTemperature: avgTemp,
            avgHumidity: avgHumidity,
            minTemp: tempVals.length ? Math.min(...tempVals) : null,
            maxTemp: tempVals.length ? Math.max(...tempVals) : null,
            minHumidity: humVals.length ? Math.min(...humVals) : null,
            maxHumidity: humVals.length ? Math.max(...humVals) : null,
            occupancyRate,
          },
          health: {
            status: isOnline ? 'online' : 'offline',
            lastSeenSeconds,
          },
          deviceInfo: deviceInfo ? {
            deviceId: deviceInfo.deviceId,
            deviceName: deviceInfo.deviceName,
            location: deviceInfo.location,
            status: isOnline ? 'online' : 'offline',
            lastSeen: deviceInfo.lastSeen.toISOString(),
            totalReadings: deviceInfo.totalReadings,
          } : null,
        },
        { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    } else {
      // Get all devices and their latest readings
      const devices = await prisma.deviceInfo.findMany({
        orderBy: { lastSeen: 'desc' },
      });

      const allDevicesData: Record<string, any> = {};

      for (const device of devices) {
        const latestReading = await prisma.sensorReading.findFirst({
          where: { deviceId: device.deviceId },
          orderBy: { createdAt: 'desc' },
        });

        const lastSeenMs = Date.now() - device.lastSeen.getTime();
        const lastSeenSeconds = Math.max(0, Math.floor(lastSeenMs / 1000));
        const isOnline = lastSeenSeconds <= OFFLINE_THRESHOLD_SECONDS;

        // Update device status if changed
        if (device.status !== (isOnline ? 'online' : 'offline')) {
          await prisma.deviceInfo.update({
            where: { deviceId: device.deviceId },
            data: { status: isOnline ? 'online' : 'offline' },
          });
        }

        allDevicesData[device.deviceId] = {
          device_id: device.deviceId,
          device_name: device.deviceName,
          location: device.location,
          status: isOnline ? 'online' : 'offline',
          last_seen: device.lastSeen.toISOString(),
          last_seen_seconds: lastSeenSeconds,
          total_readings: device.totalReadings,
          latest_reading: latestReading ? {
            temperature: latestReading.temperature,
            humidity: latestReading.humidity,
            occupied: latestReading.occupied,
            timestamp: latestReading.createdAt.toISOString(),
          } : null,
        };
      }

      return NextResponse.json(
        {
          success: true,
          devices: allDevicesData,
          total_devices: devices.length,
        },
        { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error fetching sensor data' 
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
