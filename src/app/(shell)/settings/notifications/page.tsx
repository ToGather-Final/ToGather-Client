"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Smartphone, Monitor } from "lucide-react";

// Switch 컴포넌트 인라인 정의
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = ({ checked = false, onCheckedChange, disabled = false, className }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-500" : "bg-gray-200"
      } ${className || ""}`}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default function NotificationSettingsPage() {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  const [toastNotificationsEnabled, setToastNotificationsEnabled] = useState(true);

  useEffect(() => {
    // 브라우저 알림 권한 상태 확인
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      
      if (permission === 'granted') {
        setBrowserNotificationsEnabled(true);
        console.log('🔔 브라우저 알림이 활성화되었습니다.');
      }
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ToGather 테스트 알림', {
        body: '알림이 정상적으로 작동합니다!',
        icon: '/logo_blue.png'
      });
    }
  };

  const testToast = () => {
    // 토스트 알림 테스트
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; flex-shrink: 0;"></div>
        <span style="flex: 1; font-size: 14px; line-height: 1.4;">토스트 알림 테스트입니다!</span>
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
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  };

  return (
    <div className="bg-white p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">알림 설정</h1>
          <p className="text-gray-600">알림 방식을 설정하고 테스트해보세요.</p>
        </div>

        {/* 전체 알림 설정 */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">알림 받기</h3>
                <p className="text-sm text-gray-600">모든 알림을 활성화/비활성화합니다</p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </Card>

        {/* 브라우저 알림 설정 */}
        <Card className="p-4 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-semibold">브라우저 알림</h3>
                  <p className="text-sm text-gray-600">
                    현재 상태: {
                      browserPermission === 'granted' ? '허용됨' :
                      browserPermission === 'denied' ? '거부됨' : '요청 필요'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={browserNotificationsEnabled}
                onCheckedChange={setBrowserNotificationsEnabled}
                disabled={browserPermission === 'denied'}
              />
            </div>
            
            {browserPermission === 'default' && (
              <Button 
                onClick={requestBrowserPermission}
                className="w-full"
                variant="outline"
              >
                브라우저 알림 권한 요청
              </Button>
            )}
            
            {browserPermission === 'granted' && (
              <Button 
                onClick={testNotification}
                className="w-full"
                variant="outline"
              >
                브라우저 알림 테스트
              </Button>
            )}
          </div>
        </Card>

        {/* 토스트 알림 설정 */}
        <Card className="p-4 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-purple-500" />
                <div>
                  <h3 className="font-semibold">토스트 알림</h3>
                  <p className="text-sm text-gray-600">화면에 팝업으로 알림을 표시합니다</p>
                </div>
              </div>
              <Switch
                checked={toastNotificationsEnabled}
                onCheckedChange={setToastNotificationsEnabled}
              />
            </div>
            
            <Button 
              onClick={testToast}
              className="w-full"
              variant="outline"
            >
              토스트 알림 테스트
            </Button>
          </div>
        </Card>

        {/* 알림 타입별 설정 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">알림 타입별 설정</h3>
          <div className="space-y-3">
            {[
              { type: 'VOTE_CREATED', label: '투표 생성', icon: '🗳️' },
              { type: 'VOTE_APPROVED', label: '투표 가결', icon: '✅' },
              { type: 'VOTE_REJECTED', label: '투표 부결', icon: '❌' },
              { type: 'TRADE_EXECUTED', label: '거래 체결', icon: '💰' },
              { type: 'TRADE_FAILED', label: '거래 실패', icon: '⚠️' },
              { type: 'CASH_DEPOSIT_COMPLETED', label: '예수금 충전', icon: '💳' },
              { type: 'PAY_CHARGE_COMPLETED', label: '페이 충전', icon: '💸' },
              { type: 'GOAL_ACHIEVED', label: '목표 달성', icon: '🎯' },
            ].map(({ type, label, icon }) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm">{label}</span>
                </div>
                <Switch checked={true} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
