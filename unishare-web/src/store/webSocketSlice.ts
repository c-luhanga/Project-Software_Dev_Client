/**
 * WebSocket Redux Middleware - SignalR Version
 * 
 * Integrates SignalR service with Redux store for real-time messaging
 * Following Redux middleware patterns and SOLID principles
 */

import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../store/store';
import { SignalRService } from '../infrastructure/websocket/SignalRService';
import { 
  fetchInboxThunk,
  fetchConversationThunk
} from './messagingSlice';

/**
 * WebSocket Redux Actions
 */
export const webSocketActions = {
  connect: () => ({ type: 'websocket/connect' } as const),
  disconnect: () => ({ type: 'websocket/disconnect' } as const),
  joinConversation: (conversationId: number) => ({ type: 'websocket/joinConversation', payload: conversationId } as const),
  leaveConversation: (conversationId: number) => ({ type: 'websocket/leaveConversation', payload: conversationId } as const),
  connected: () => ({ type: 'websocket/connected' } as const),
  disconnected: () => ({ type: 'websocket/disconnected' } as const),
  reconnecting: () => ({ type: 'websocket/reconnecting' } as const),
  reconnected: () => ({ type: 'websocket/reconnected' } as const),
  error: (error: string) => ({ type: 'websocket/error', payload: error } as const)
};

export type WebSocketAction = ReturnType<typeof webSocketActions[keyof typeof webSocketActions]>;

/**
 * WebSocket State
 */
export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error?: string;
}

const initialWebSocketState: WebSocketState = {
  connected: false,
  connecting: false
};

/**
 * WebSocket Reducer
 */
export function webSocketReducer(state = initialWebSocketState, action: any): WebSocketState {
  switch (action.type) {
    case 'websocket/connected':
      return {
        ...state,
        connected: true,
        connecting: false,
        error: undefined
      };
    
    case 'websocket/disconnected':
      return {
        ...state,
        connected: false,
        connecting: false
      };

    case 'websocket/reconnecting':
      return {
        ...state,
        connected: false,
        connecting: true
      };

    case 'websocket/reconnected':
      return {
        ...state,
        connected: true,
        connecting: false,
        error: undefined
      };
    
    case 'websocket/error':
      return {
        ...state,
        connected: false,
        connecting: false,
        error: action.payload
      };
    
    default:
      return state;
  }
}

/**
 * WebSocket Middleware
 * 
 * Handles SignalR connection lifecycle and message routing
 */
export const webSocketMiddleware: Middleware = (store: any) => {
  let signalRService: SignalRService | null = null;
  
  // Initialize SignalR service
  const initializeSignalR = () => {
    if (!signalRService) {
      // Determine SignalR hub URL based on environment
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const host = window.location.hostname;
      const port = import.meta.env.DEV ? '5100' : window.location.port;
      const hubUrl = `${protocol}//${host}:${port}/hubs/messaging`;
      
      signalRService = new SignalRService(hubUrl);
      
      // Set up access token factory
      signalRService.setAccessTokenFactory(() => {
        const state = store.getState();
        return state.auth.token;
      });
      
      // Set up event handlers
      signalRService.setHandlers({
        onConnect: () => {
          console.log('🔌 SignalR connected via middleware');
          store.dispatch(webSocketActions.connected());
        },
        
        onDisconnect: () => {
          console.log('🔌 SignalR disconnected via middleware');
          store.dispatch(webSocketActions.disconnected());
        },

        onReconnecting: () => {
          console.log('🔄 SignalR reconnecting via middleware');
          store.dispatch(webSocketActions.reconnecting());
        },

        onReconnected: () => {
          console.log('✅ SignalR reconnected via middleware');
          store.dispatch(webSocketActions.reconnected());
          // Refresh inbox when reconnected
          store.dispatch(fetchInboxThunk({ page: 1, pageSize: 20 }) as any);
        },
        
        onError: (error: Error) => {
          console.error('❌ SignalR error via middleware:', error);
          store.dispatch(webSocketActions.error('SignalR connection error'));
        },
        
        onNewMessage: (message: any) => {
          console.log('📨 New message received via SignalR:', message);
          // Refresh the inbox to get updated conversation list
          store.dispatch(fetchInboxThunk({ page: 1, pageSize: 20 }) as any);
          
          // If we're viewing this conversation, refresh it
          if (message.conversationId) {
            store.dispatch(fetchConversationThunk({ 
              conversationId: message.conversationId, 
              page: 1, 
              pageSize: 50 
            }) as any);
          }
        },
        
        onConversationUpdate: (conversation: any) => {
          console.log('💬 Conversation update received via SignalR:', conversation);
          // Refresh inbox to update conversation list
          store.dispatch(fetchInboxThunk({ page: 1, pageSize: 20 }) as any);
        },

        onUserTyping: (data: { userId: string; userName: string; conversationId: number }) => {
          console.log('⌨️ User typing:', data);
          // Could dispatch typing indicator actions here
        },

        onUserStoppedTyping: (data: { userId: string; conversationId: number }) => {
          console.log('⌨️ User stopped typing:', data);
          // Could dispatch stop typing indicator actions here
        }
      });
    }
    
    return signalRService;
  };
  
  return (next) => (action: any) => {
    const state = store.getState();
    
    // Handle WebSocket-specific actions
    switch (action.type) {
      case 'websocket/connect': {
        const signalR = initializeSignalR();
        const authToken = state.auth.token;
        
        if (authToken) {
          signalR.connect().catch((error: any) => {
            console.error('❌ Failed to connect SignalR:', error);
            store.dispatch(webSocketActions.error('Failed to connect'));
          });
        } else {
          console.warn('⚠️ No auth token available for SignalR connection');
        }
        break;
      }
      
      case 'websocket/disconnect': {
        if (signalRService) {
          signalRService.disconnect();
        }
        break;
      }

      case 'websocket/joinConversation': {
        if (signalRService && signalRService.isConnectionConnected()) {
          signalRService.joinConversation(action.payload).catch((error: any) => {
            console.error('❌ Failed to join conversation:', error);
          });
        }
        break;
      }

      case 'websocket/leaveConversation': {
        if (signalRService && signalRService.isConnectionConnected()) {
          signalRService.leaveConversation(action.payload).catch((error: any) => {
            console.error('❌ Failed to leave conversation:', error);
          });
        }
        break;
      }
      
      // Auto-connect when user logs in
      case 'auth/login/fulfilled': {
        if (!signalRService || !signalRService.isConnectionConnected()) {
          setTimeout(() => {
            store.dispatch(webSocketActions.connect());
          }, 1000);
        }
        break;
      }
      
      // Auto-disconnect when user logs out
      case 'auth/logout': {
        if (signalRService) {
          signalRService.disconnect();
        }
        break;
      }
    }
    
    return next(action);
  };
};

/**
 * Selectors for WebSocket state
 */
export const selectWebSocketConnected = (state: RootState): boolean => state.webSocket.connected;
export const selectWebSocketConnecting = (state: RootState): boolean => state.webSocket.connecting;
export const selectWebSocketError = (state: RootState): string | undefined => state.webSocket.error;

/**
 * Get the current SignalR service instance
 */
export const getSignalRService = (): SignalRService | null => {
  // This would need to be implemented based on your app structure
  // For now, we'll just return null and let the middleware handle creation
  return null;
};