import { NextRequest, NextResponse } from 'next/server';

// Define the sensor data interface
interface SensorData {
  device_id: string;
  temperature: number;
  humidity: number;
  timestamp?: string;
}

// Configure API route for external requests
export const runtime = 'edge';

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

    // Log received data (for development/debugging)
    console.log('Received sensor data:', {
      device_id: sensorData.device_id,
      temperature: `${sensorData.temperature}°C`,
      humidity: `${sensorData.humidity}%`,
      timestamp: sensorData.timestamp,
    });

    // In a production environment, you would:
    // 1. Store this data in a database (PostgreSQL, MongoDB, etc.)
    // 2. Trigger real-time updates via WebSocket/Server-Sent Events
    // 3. Process data for analytics and alerting
    // 4. Cache recent data in Redis for quick access
    
    // For now, we're just acknowledging receipt
    // The frontend will use localStorage to store data on the client side

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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

// OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

// GET handler to check API status
export async function GET() {
  return NextResponse.json(
    {
      status: 'active',
      message: 'Sensor Data API is operational',
      endpoint: '/api/sensor-data',
      methods: ['POST'],
      expectedPayload: {
        device_id: 'string',
        temperature: 'number',
        humidity: 'number',
      },
    },
    { status: 200 }
  );
}
