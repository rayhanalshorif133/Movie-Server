import { NextResponse } from 'next/server';
import { getMovieFileInfo } from '@/utils/google/movie-info';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url') || searchParams.get('fileId') || '';

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL or fileId query parameter is required'
      }, { status: 400 });
    }

    const result = await getMovieFileInfo(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Movie info API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const url = body.url || body.fileId || '';

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL or fileId is required in request body'
      }, { status: 400 });
    }

    const result = await getMovieFileInfo(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Movie info API POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

