// src/hooks/useNotification.ts
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/utils/token';

interface NotificationData {
  type: string;
  message: string;
  groupId: string;
  timestamp: string;
  notificationId: string;
}

interface UseNotificationReturn {
  isConnected: boolean;
  notificationCount: number;
  clearNotification: () => void;
}

export function useNotification(): UseNotificationReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [eventSource, setEventSource] = useState<any>(null);
  const router = useRouter();

  // 알림 카운트 초기화
  const clearNotification = useCallback(() => {
    setNotificationCount(0);
  }, []);

  useEffect(() => {
    const connectSSE = async () => {
      try {
        // 기존 연결이 있다면 종료
        if (eventSource) {
          eventSource.close();
        }

        // 사용자 ID 가져오기 (토큰에서 추출하거나 localStorage에서)
        const userId = getCurrentUserId();
        if (!userId) {
          console.warn('🔔 사용자 ID가 없어 알림 연결을 건너뜁니다.');
          return;
        }

        // SSE 연결 생성 (Next.js API 라우트를 통해 프록시)
        const streamUrl = '/api/notification/stream';
        
        console.log('🔔 스트림 URL:', streamUrl);
        
        // EventSource는 커스텀 헤더를 지원하지 않으므로 Next.js API 라우트 사용
        const token = localStorage.getItem('togather_access_token');
        
        console.log('🔔 토큰 존재 여부:', !!token);
        console.log('🔔 토큰 값:', token ? token.substring(0, 20) + '...' : 'null');
        
        if (!token) {
          console.error('🔔 토큰이 없습니다. 로그인을 다시 시도해주세요.');
          return;
        }
        
        // fetch API를 사용하여 SSE 구현 (Authorization 헤더 지원)
        const authUrl = streamUrl;
        console.log('🔔 최종 SSE URL:', authUrl);
        
        // fetch로 SSE 요청 (Authorization 헤더 포함)
        const response = await fetch(authUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }
        
        // ReadableStream을 EventSource처럼 사용
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }
        
        const es = {
          close: () => reader.cancel(),
          addEventListener: (event: string, callback: (event: any) => void) => {
            // SSE 이벤트 처리 - 완전히 새로운 방식
            const pump = async () => {
              try {
                const { done, value } = await reader.read();
                if (done) return;
                
                const text = new TextDecoder().decode(value);
                console.log('🔔 SSE 원본 데이터:', text);
                
                // SSE 데이터가 있으면 무조건 알림 처리
                if (text.includes('event:history-notification') || text.includes('data:')) {
                  console.log('🔔 알림 데이터 감지 - 히스토리 알림 표시');
                  
                  // 알림 카운트 증가
                  setNotificationCount(prev => prev + 1);
                  
                  // 브라우저 알림 표시
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('ToGather 알림', {
                      body: '새로운 소식이 있습니다!',
                      icon: '/logo_blue.png'
                    });
                  }
                  
                  // 토스트 알림 표시
                  showToast('새로운 소식이 있습니다!');
                  
                  console.log('🔔 히스토리 알림 처리 완료');
                }
                
                pump();
              } catch (error) {
                console.error('SSE 읽기 오류:', error);
              }
            };
            pump();
          },
          onopen: null as (() => void) | null,
          onerror: null as ((error: any) => void) | null,
        };

        // 연결 성공
        console.log('🔔 알림 스트림 연결 성공');
        setIsConnected(true);
        setEventSource(es);

        // 히스토리 알림 수신
        es.addEventListener('history-notification', (event) => {
          try {
            const data: NotificationData = JSON.parse(event.data);
            console.log('📢 히스토리 알림 수신:', data);
            
            // 알림 카운트 증가
            setNotificationCount(prev => prev + 1);
            
            // 브라우저 알림 표시 (권한 허용 시)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('ToGather 알림', {
                body: data.message,
                icon: '/logo_blue.png'
              });
            }
            
            // 토스트 알림 표시 (선택사항)
            showToast(data.message);
            
          } catch (error) {
            console.error('🔔 알림 데이터 파싱 실패:', error);
          }
        });

        // 사용자 개별 알림 수신
        es.addEventListener('user-notification', (event) => {
          try {
            const data: NotificationData = JSON.parse(event.data);
            console.log('📢 개별 알림 수신:', data);
            
            // 개별 알림 처리 로직
            showToast(data.message);
            
          } catch (error) {
            console.error('🔔 개별 알림 데이터 파싱 실패:', error);
          }
        });

        // 연결 오류 처리
        try {
          // SSE 이벤트 처리 로직
        } catch (error) {
          console.error('🔔 알림 스트림 연결 오류:', error);
          setIsConnected(false);
          
          // 3초 후 재연결 시도
          setTimeout(() => {
            connectSSE();
          }, 3000);
        }

        // 페이지 언마운트 시 연결 해제
        return () => {
          es.close();
          setIsConnected(false);
        };

      } catch (error) {
        console.error('🔔 SSE 연결 생성 실패:', error);
        setIsConnected(false);
      }
    };

    // 페이지 포커스 시 재연결
    const handleFocus = () => {
      if (!isConnected) {
        connectSSE();
      }
    };

    // 브라우저 알림 권한 요청 (자동 요청)
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          console.log('🔔 브라우저 알림 권한을 요청합니다...');
          const permission = await Notification.requestPermission();
          console.log('🔔 알림 권한 상태:', permission);
          
          if (permission === 'granted') {
            console.log('🔔 브라우저 알림이 활성화되었습니다.');
            // 테스트 알림 표시
            new Notification('ToGather 알림', {
              body: '알림이 성공적으로 활성화되었습니다!',
              icon: '/logo_blue.png'
            });
          } else if (permission === 'denied') {
            console.warn('🔔 브라우저 알림이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
          }
        } else if (Notification.permission === 'denied') {
          console.warn('🔔 브라우저 알림이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
          // 사용자에게 알림 설정 안내
          alert('브라우저 알림이 거부되었습니다.\n주소창 왼쪽의 자물쇠 아이콘을 클릭하여 알림을 허용해주세요.');
        } else {
          console.log('🔔 현재 알림 권한 상태:', Notification.permission);
        }
      } else {
        console.warn('🔔 이 브라우저는 알림을 지원하지 않습니다.');
      }
    };

    requestNotificationPermission();

    // 초기 연결
    connectSSE();

    // 포커스 이벤트 리스너 등록
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return {
    isConnected,
    notificationCount,
    clearNotification
  };
}

// 사용자 ID 가져오기 (token.ts의 getUserId 함수 사용)
function getCurrentUserId(): string | null {
  try {
    const userId = getUserId();
    if (!userId) {
      console.warn('🔔 localStorage에 userId가 없습니다.');
      return null;
    }
    
    console.log('🔔 사용자 ID 확인:', userId);
    return userId;
  } catch (error) {
    console.error('사용자 ID 추출 실패:', error);
    return null;
  }
}

// 토스트 알림 표시 (개선된 스타일)
function showToast(message: string) {
  console.log('🍞 토스트:', message);
  
  // 기존 토스트가 있다면 제거
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => toast.remove());
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; flex-shrink: 0;"></div>
      <span style="flex: 1; font-size: 14px; line-height: 1.4;">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none; border: none; color: white; cursor: pointer; 
        padding: 4px; margin-left: 8px; opacity: 0.7; font-size: 16px;
      ">×</button>
    </div>
  `;
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #447AFA 0%, #3B82F6 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    z-index: 9999;
    font-size: 14px;
    max-width: 350px;
    min-width: 280px;
    box-shadow: 0 8px 32px rgba(68, 122, 250, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    animation: slideInRight 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // CSS 애니메이션 추가
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    .toast-notification {
      animation: slideInRight 0.3s ease-out;
    }
    .toast-notification.removing {
      animation: slideOutRight 0.3s ease-in;
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // 5초 후 자동 제거 (개선된 애니메이션)
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }
  }, 5000);
}
