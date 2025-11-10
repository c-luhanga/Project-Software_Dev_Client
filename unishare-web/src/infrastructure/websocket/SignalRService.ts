/**
 * SignalR Service for Real-time Messaging
 * 
 * Modern real-time communication service using SignalR for reliable WebSocket connections
 */

import * as signalR from '@microsoft/signalr';

export interface SignalREventHandlers {
  onNewMessage?: (message: any) => void;
  onConversationUpdate?: (conversation: any) => void;
  onUserTyping?: (data: { userId: string; userName: string; conversationId: number }) => void;
  onUserStoppedTyping?: (data: { userId: string; conversationId: number }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnecting?: () => void;
  onReconnected?: () => void;
  onError?: (error: Error) => void;
}

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private url: string;
  private accessTokenFactory: (() => string | null) | null = null;
  private handlers: SignalREventHandlers = {};
  private isConnected = false;
  private isConnecting = false;
  private joinedConversations = new Set<number>();

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Set the access token factory for authentication
   */
  setAccessTokenFactory(factory: () => string | null): void {
    this.accessTokenFactory = factory;
  }

  /**
   * Set event handlers
   */
  setHandlers(handlers: SignalREventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Connect to SignalR hub
   */
  async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      console.warn('[SignalR] Already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      // Build connection
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.url, {
          accessTokenFactory: () => {
            const token = this.accessTokenFactory?.();
            return token || '';
          },
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      this.isConnecting = false;

      console.log('[SignalR] Connected successfully');
      this.handlers.onConnect?.();

      // Rejoin conversations
      await this.rejoinConversations();

    } catch (error) {
      this.isConnecting = false;
      this.isConnected = false;
      console.error('[SignalR] Connection failed:', error);
      this.handlers.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.stop();
    } catch (error) {
      console.error('[SignalR] Disconnect error:', error);
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.connection = null;
    this.joinedConversations.clear();

    console.log('[SignalR] Disconnected');
    this.handlers.onDisconnect?.();
  }

  /**
   * Check if connected
   */
  isConnectionConnected(): boolean {
    return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Join a conversation for real-time updates
   */
  async joinConversation(conversationId: number): Promise<void> {
    if (!this.isConnectionConnected()) {
      // Store for later when connected
      this.joinedConversations.add(conversationId);
      return;
    }

    try {
      await this.connection!.invoke('JoinConversation', conversationId.toString());
      this.joinedConversations.add(conversationId);
      console.log(`[SignalR] Joined conversation ${conversationId}`);
    } catch (error) {
      console.error(`[SignalR] Failed to join conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Leave a conversation
   */
  async leaveConversation(conversationId: number): Promise<void> {
    if (!this.isConnectionConnected()) {
      this.joinedConversations.delete(conversationId);
      return;
    }

    try {
      await this.connection!.invoke('LeaveConversation', conversationId.toString());
      this.joinedConversations.delete(conversationId);
      console.log(`[SignalR] Left conversation ${conversationId}`);
    } catch (error) {
      console.error(`[SignalR] Failed to leave conversation ${conversationId}:`, error);
      throw error;
    }
  }

  /**
   * Send heartbeat
   */
  async sendHeartbeat(): Promise<void> {
    if (!this.isConnectionConnected()) {
      return;
    }

    try {
      await this.connection!.invoke('Heartbeat');
    } catch (error) {
      console.error('[SignalR] Heartbeat failed:', error);
    }
  }

  /**
   * Set up SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Connection events
    this.connection.onreconnecting(() => {
      this.isConnected = false;
      console.log('[SignalR] Reconnecting...');
      this.handlers.onReconnecting?.();
    });

    this.connection.onreconnected(async () => {
      this.isConnected = true;
      console.log('[SignalR] Reconnected');
      this.handlers.onReconnected?.();
      await this.rejoinConversations();
    });

    this.connection.onclose(() => {
      this.isConnected = false;
      console.log('[SignalR] Connection closed');
      this.handlers.onDisconnect?.();
    });

    // Message events
    this.connection.on('NewMessage', (message) => {
      console.log('[SignalR] Received new message:', message);
      this.handlers.onNewMessage?.(message);
    });

    this.connection.on('ConversationUpdate', (conversation) => {
      console.log('[SignalR] Received conversation update:', conversation);
      this.handlers.onConversationUpdate?.(conversation);
    });

    this.connection.on('UserTyping', (data) => {
      console.log('[SignalR] User typing:', data);
      this.handlers.onUserTyping?.(data);
    });

    this.connection.on('UserStoppedTyping', (data) => {
      console.log('[SignalR] User stopped typing:', data);
      this.handlers.onUserStoppedTyping?.(data);
    });

    this.connection.on('HeartbeatResponse', (data) => {
      console.log('[SignalR] Heartbeat response:', data);
    });
  }

  /**
   * Rejoin all conversations after reconnection
   */
  private async rejoinConversations(): Promise<void> {
    for (const conversationId of this.joinedConversations) {
      try {
        await this.connection!.invoke('JoinConversation', conversationId.toString());
        console.log(`[SignalR] Rejoined conversation ${conversationId}`);
      } catch (error) {
        console.error(`[SignalR] Failed to rejoin conversation ${conversationId}:`, error);
      }
    }
  }
}