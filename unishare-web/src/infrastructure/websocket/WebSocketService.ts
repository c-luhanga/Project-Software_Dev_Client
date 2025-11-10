/**
 * WebSocket Service for Real-time Messaging
 * 
 * Provides real-time communication for messaging features following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles WebSocket connection management
 * - Open/Closed Principle (OCP): Extensible through event handlers
 * - Dependency Inversion Principle (DIP): Uses abstractions for token management
 */

export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'MESSAGE_READ' | 'TYPING' | 'USER_ONLINE' | 'USER_OFFLINE';
  payload: any;
  timestamp: string;
}

export interface WebSocketEventHandlers {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onReconnect?: () => void;
}

/**
 * WebSocket Service Implementation
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection state management
 * - Message queuing during disconnection
 * - Heartbeat/ping-pong for connection health
 * - JWT token authentication
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private handlers: WebSocketEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private heartbeatInterval: number | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isConnecting = false;
  private isConnected = false;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Set authentication token for WebSocket connection
   */
  setToken(token: string | null): void {
    this.token = token;
    
    // If we're already connected, reconnect with new token
    if (this.isConnected && token) {
      this.disconnect();
      this.connect();
    }
  }

  /**
   * Set event handlers
   */
  setHandlers(handlers: WebSocketEventHandlers): void {
    this.handlers = { ...handlers };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      if (!this.token) {
        reject(new Error('Authentication token required for WebSocket connection'));
        return;
      }

      this.isConnecting = true;
      
      try {
        // Include token in WebSocket URL or headers
        const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Send queued messages
          this.sendQueuedMessages();
          
          // Notify handlers
          this.handlers.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', message);
            
            // Handle ping/pong for heartbeat
            if (message.type === 'PING' as any) {
              this.send({ type: 'PONG' as any, payload: {}, timestamp: new Date().toISOString() });
              return;
            }
            
            this.handlers.onMessage?.(message);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.isConnected = false;
          this.stopHeartbeat();
          
          this.handlers.onDisconnect?.();
          
          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.handlers.onError?.(error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.stopHeartbeat();
  }

  /**
   * Send message through WebSocket
   */
  send(message: WebSocketMessage): void {
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
        console.log('📤 WebSocket message sent:', message);
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
        // Queue message for retry
        this.messageQueue.push(message);
      }
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      console.log('📝 WebSocket message queued (not connected):', message);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; connecting: boolean } {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting
    };
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    
    console.log(`🔄 Scheduling WebSocket reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        console.log(`🔄 Attempting WebSocket reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect().then(() => {
          this.handlers.onReconnect?.();
        }).catch((error) => {
          console.error('❌ WebSocket reconnect failed:', error);
        });
      }
    }, this.reconnectDelay);
    
    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'PING' as any,
          payload: {},
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send all queued messages
   */
  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }
}

/**
 * WebSocket Service Factory
 * Creates a singleton WebSocket service instance
 */
let webSocketServiceInstance: WebSocketService | null = null;

export function createWebSocketService(wsUrl: string): WebSocketService {
  if (!webSocketServiceInstance) {
    webSocketServiceInstance = new WebSocketService(wsUrl);
  }
  return webSocketServiceInstance;
}

export function getWebSocketService(): WebSocketService | null {
  return webSocketServiceInstance;
}

/**
 * Message Types for Messaging Feature
 */
export interface NewMessagePayload {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  timestamp: string;
  senderName?: string;
}

export interface MessageReadPayload {
  messageId: number;
  conversationId: number;
  readerId: number;
  timestamp: string;
}

export interface TypingPayload {
  conversationId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface UserStatusPayload {
  userId: number;
  userName: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}