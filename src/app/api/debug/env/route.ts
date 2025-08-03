import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Debug environment variables...');
  
  const envInfo = {
    polygonApiKey: process.env.POLYGON_API_KEY ? 'Set' : 'Not set',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    hasApiKey: !!process.env.POLYGON_API_KEY,
    apiKeyLength: process.env.POLYGON_API_KEY?.length || 0
  };
  
  console.log('Environment info:', envInfo);
  
  return NextResponse.json({
    success: true,
    environment: envInfo,
    message: 'Environment variables checked'
  });
} 