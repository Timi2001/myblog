import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Basic health check
    const health: {
      status: string;
      timestamp: string;
      version: string;
      environment: string;
      uptime: number;
      checks: {
        database: string;
        memory: string | { status: string; used: string; total: string; percentage: number };
        disk: string;
      };
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: 'unknown',
        memory: 'unknown',
        disk: 'unknown',
      },
    };

    // Check database connectivity
    try {
      // Try to read from a collection we know exists and has proper rules
      const { collection, getDocs, limit, query } = await import('firebase/firestore');
      const articlesRef = collection(db, 'articles');
      const q = query(articlesRef, limit(1));
      await getDocs(q);
      health.checks.database = 'healthy';
    } catch (error) {
      console.error('Database health check failed:', error);
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Check memory usage (Node.js only)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memoryLimitMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      health.checks.memory = {
        status: memoryUsageMB < 500 ? 'healthy' : 'warning', // 500MB threshold
        used: `${memoryUsageMB}MB`,
        total: `${memoryLimitMB}MB`,
        percentage: Math.round((memoryUsageMB / memoryLimitMB) * 100),
      };
    }

    // Response time check
    const responseTime = Date.now() - startTime;
    const responseTimeStatus = responseTime < 1000 ? 'healthy' : 'slow';

    const response = {
      ...health,
      responseTime: `${responseTime}ms`,
      responseTimeStatus,
    };

    // Determine overall status
    const hasUnhealthyChecks = Object.values(health.checks).some(
      check => typeof check === 'string' ? check === 'unhealthy' : check.status === 'unhealthy'
    );

    if (hasUnhealthyChecks) {
      response.status = 'unhealthy';
    } else if (responseTime > 1000) {
      response.status = 'degraded';
    }

    const statusCode = response.status === 'healthy' ? 200 : 
                      response.status === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Health check failed',
      responseTime: `${Date.now() - startTime}ms`,
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

// Simple ping endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
}