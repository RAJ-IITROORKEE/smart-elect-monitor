import { NextRequest, NextResponse } from 'next/server';

// Define the sensor data interface
interface SensorData {
  device_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

// In-memory storage for sensor data (last 500 readings per device)
// In production, use a database like PostgreSQL, MongoDB, or Redis
const sensorDataStore = new Map<string, SensorData[]>();
const MAX_READINGS_PER_DEVICE = 500;

// POST handler for receiving sensor data from ESP32
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body: SensorData = await request.json();

    // Validate required fields
    if (!body.device_id || body.temperature === undefined || body.humidity === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: device_id, temperature, humidity' 
        },
        { status: 400 }
      );
    }

    // Validate data types and ranges
    if (typeof body.temperature !== 'number' || typeof body.humidity !== 'number') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data types for temperature or humidity' 
        },
        { status: 400 }
      );
    }

    // Add server timestamp
    const sensorData: SensorData = {
      device_id: body.device_id,
      temperature: body.temperature,
      humidity: body.humidity,
      timestamp: new Date().toISOString(),
    };

    // Store data in memory
    const deviceReadings = sensorDataStore.get(body.device_id) || [];
    deviceReadings.push(sensorData);
    
    // Keep only the last MAX_READINGS_PER_DEVICE readings
    if (deviceReadings.length > MAX_READINGS_PER_DEVICE) {
      deviceReadings.shift();
    }
    
    sensorDataStore.set(body.device_id, deviceReadings);

    // Log received data (for development/debugging)
    console.log('✓ Stored sensor data:', {
      device_id: sensorData.device_id,
      temperature: `${sensorData.temperature}°C`,
      humidity: `${sensorData.humidity}%`,
      timestamp: sensorData.timestamp,
      total_readings: deviceReadings.length,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data received successfully',
        data: sensorData,
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

// GET handler to fetch stored sensor data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (deviceId) {
      // Get data for specific device
      const deviceReadings = sensorDataStore.get(deviceId) || [];
      const limitedReadings = deviceReadings.slice(-limit);
      
      return NextResponse.json(
        {
          success: true,
          device_id: deviceId,
          count: limitedReadings.length,
          readings: limitedReadings,
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
      const allDevices: Record<string, any> = {};
      
      sensorDataStore.forEach((readings, deviceId) => {
        const latestReading = readings[readings.length - 1];
        allDevices[deviceId] = {
          device_id: deviceId,
          latest_reading: latestReading,
          total_readings: readings.length,
        };
      });

      return NextResponse.json(
        {
          success: true,
          devices: allDevices,
          total_devices: sensorDataStore.size,
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
