const isServer = typeof window === 'undefined'
export const baseUrl = isServer
  ? (process.env.SERVER_API_BASE_URL || "http://api-gateway.togather.svc.cluster.local:8000")
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000");
