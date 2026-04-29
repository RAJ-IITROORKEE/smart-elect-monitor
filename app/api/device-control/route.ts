import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    // Get or create device control state
    let controlState = await prisma.deviceControl.findUnique({
      where: { deviceId },
    });

    if (!controlState) {
      // Create default control state
      controlState = await prisma.deviceControl.create({
        data: {
          deviceId,
          pirEnabled: true,  // PIR enabled by default
          ledEnabled: false, // LED off by default
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        device_id: deviceId,
        pir_enabled: controlState.pirEnabled,
        led_enabled: controlState.ledEnabled,
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

    // Build update data only for provided fields
    const updateData: any = {};
    if (pir_enabled !== undefined) {
      updateData.pirEnabled = Boolean(pir_enabled);
    }
    if (led_enabled !== undefined) {
      updateData.ledEnabled = Boolean(led_enabled);
    }

    // Upsert device control state
    const controlState = await prisma.deviceControl.upsert({
      where: { deviceId: device_id },
      update: updateData,
      create: {
        deviceId: device_id,
        pirEnabled: pir_enabled !== undefined ? Boolean(pir_enabled) : true,
        ledEnabled: led_enabled !== undefined ? Boolean(led_enabled) : false,
      },
    });

    console.log('✓ Updated device control:', {
      device_id,
      pir_enabled: controlState.pirEnabled,
      led_enabled: controlState.ledEnabled,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Device control updated successfully',
        device_id,
        pir_enabled: controlState.pirEnabled,
        led_enabled: controlState.ledEnabled,
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
