# 🔔 ToGather 실시간 알림 시스템 구현 가이드

## 📋 개요
ToGather-Server에서 실시간 히스토리 알림 시스템이 구현되었습니다. 프론트엔드에서는 SSE(Server-Sent Events)를 통해 실시간 알림을 수신하고 UI에 표시해야 합니다.

## 🚀 구현된 기능

### Server-Side (완료됨)
- ✅ **JPA Event Listener**: DB에 History가 저장될 때 자동으로 이벤트 발행
- ✅ **NotificationService**: SSE 연결 관리 및 그룹 멤버들에게 알림 전송
- ✅ **NotificationController**: SSE 엔드포인트 및 알림 API 제공
- ✅ **API Gateway 라우팅**: `/api/notification/**` 경로 추가

### 알림 타입
- 🗳️ **VOTE_CREATED**: 새로운 투표 생성
- ✅ **VOTE_APPROVED**: 투표 가결
- ❌ **VOTE_REJECTED**: 투표 부결
- 💰 **TRADE_EXECUTED**: 거래 체결
- ⚠️ **TRADE_FAILED**: 거래 실패
- 💳 **CASH_DEPOSIT_COMPLETED**: 예수금 충전 완료
- 💸 **PAY_CHARGE_COMPLETED**: 페이 충전 완료
- 🎯 **GOAL_ACHIEVED**: 목표 달성

## 🎯 프론트엔드 구현 요구사항

### 1. SSE 연결 관리
```typescript
// src/hooks/useNotification.ts (이미 구현됨)
- EventSource를 통한 SSE 연결
- 자동 재연결 로직
- 알림 카운트 관리
- 토스트 알림 표시
```

### 2. BottomBar 알림 점 표시 (이미 구현됨)
```typescript
// src/components/layout/BottomBar.tsx
- 히스토리 탭에 빨간 점 표시
- 탭 클릭 시 알림 카운트 초기화
```

### 3. 추가 구현 필요 사항

#### A. 브라우저 알림 권한 처리
```typescript
// 페이지 로드 시 브라우저 알림 권한 요청
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);
```

#### B. 알림 설정 페이지 (선택사항)
```typescript
// src/app/(shell)/settings/notifications/page.tsx
- 알림 on/off 설정
- 알림 타입별 설정
- 브라우저 알림 설정
```

#### C. 알림 히스토리 (선택사항)
```typescript
// src/components/notification/NotificationList.tsx
- 최근 받은 알림 목록
- 알림 읽음/안읽음 상태 관리
```

## 🔧 API 엔드포인트

### SSE 연결
```
GET /api/notification/stream
Headers: X-User-Id: {userId}
```

### 알림 상태 조회
```
GET /api/notification/status
Response: { connectedUsers: number, timestamp: number }
```

## 📱 사용자 경험 플로우

1. **사용자 로그인** → SSE 연결 자동 시작
2. **그룹에서 히스토리 생성** → 실시간 알림 수신
3. **히스토리 탭에 빨간 점** → 새 알림 표시
4. **히스토리 탭 클릭** → 알림 점 사라짐
5. **브라우저 알림** → 권한 허용 시 팝업 표시

## 🎨 UI/UX 가이드라인

### 알림 점 스타일
```css
.notification-dot {
  width: 8px;
  height: 8px;
  background-color: #ff4444;
  border-radius: 50%;
  position: absolute;
  top: -2px;
  right: -2px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
```

### 토스트 알림 스타일
```css
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #447AFA;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
```

## 🐛 디버깅 가이드

### 콘솔 로그 확인
```javascript
// 브라우저 개발자 도구에서 확인
- "🔔 알림 스트림 연결 성공"
- "📢 히스토리 알림 수신: {data}"
- "🔔 SSE 연결 오류" (문제 발생 시)
```

### 네트워크 탭 확인
```
- EventStream 타입의 연결 확인
- 200 상태 코드로 연결 유지
- 실시간 데이터 스트림 확인
```

## 🚀 배포 시 주의사항

1. **CORS 설정**: API Gateway에서 SSE 연결 허용
2. **타임아웃 설정**: 30분 SSE 타임아웃 적용
3. **로드밸런서**: SSE 연결 유지를 위한 sticky session 고려
4. **방화벽**: EventStream 프로토콜 허용

## 📞 지원

구현 중 문제가 발생하면 다음을 확인하세요:
1. 서버 로그: `vote-service`의 NotificationService 로그
2. 브라우저 콘솔: SSE 연결 상태 및 오류 메시지
3. 네트워크 탭: EventStream 연결 상태

---

**이 가이드를 따라 구현하면 완벽한 실시간 알림 시스템이 완성됩니다!** 🎉
