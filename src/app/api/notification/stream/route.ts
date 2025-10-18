import { NextRequest } from 'next/server';

// SSE 프록시 - Authorization 헤더를 추가하여 백엔드로 전달
export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new Response('Authorization header required', { status: 401 });
    }

    // 백엔드 SSE 엔드포인트로 프록시
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    const backendStreamUrl = `${backendUrl}/notification/stream`;

    // 백엔드로 SSE 요청 전달 (Authorization 헤더 포함)
    const response = await fetch(backendStreamUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend SSE connection failed: ${response.status}`);
    }

    // SSE 응답을 클라이언트로 스트리밍
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body?.getReader();
        
        function pump(): Promise<void> {
          return reader!.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            controller.enqueue(value);
            return pump();
          });
        }
        
        return pump();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization',
      },
    });

  } catch (error) {
    console.error('SSE 프록시 오류:', error);
    return new Response('SSE connection failed', { status: 500 });
  }
}
