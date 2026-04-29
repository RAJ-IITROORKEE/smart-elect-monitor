import { NextRequest, NextResponse } from 'next/server';

// Device control state storage (in-memory)
// In production, use a database like PostgreSQL, MongoDB, or Redis
const deviceControlStore = new Map<string, {
  pir_enabled: boolean;
  led_enabled: boolean;
}>();

// Initialize default control state for a device
function getOrCreateDeviceControl(deviceId: string) {
  if (!deviceControlStore.has(deviceId)) {
    deviceControlStore.set(deviceId, {
      pir_enabled: true,   // PIR enabled by default
      led_enabled: false,  // LED off by default
    });
  }
  return deviceControlStore.get(deviceId)!;
}

// GET handler - Fetch control state for ESP32
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('device_id');

    if (!deviceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing device_id parameter' 
        },
        { status: 400 }
      );
    }

    const controlState = getOrCreateDeviceControl(deviceId);

    return NextResponse.json(
      {
        success: true,
        device_id: deviceId,
        ...controlState
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
    console.error('Error fetching device control:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error fetching device control' 
      },
      { status: 500 }
    );
  }
}

// POST handler - Update control state from dashboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_id, pir_enabled, led_enabled } = body;

    if (!device_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing device_id' 
        },
        { status: 400 }
      );
    }

    const controlState = getOrCreateDeviceControl(device_id);

    // Update only provided fields
    if (pir_enabled !== undefined) {
      controlState.pir_enabled = Boolean(pir_enabled);
    }

    if (led_enabled !== undefined) {
      controlState.led_enabled = Boolean(led_enabled);
    }

    deviceControlStore.set(device_id, controlState);

    console.log('✓ Updated device control:', {
      device_id,
      pir_enabled: controlState.pir_enabled,
      led_enabled: controlState.led_enabled,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Device control updated successfully',
        device_id,
        ...controlState
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
    console.error('Error updating device control:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error updating device control' 
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
