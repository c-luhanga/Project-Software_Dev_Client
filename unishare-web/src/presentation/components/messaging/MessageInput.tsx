/**
 * MessageInput Presentational Component
 * 
 * Input component with send functionality following SOLID principles:
 * - Single Responsibility Principle (SRP): Only handles message input UI
 * - Interface Segregation Principle (ISP): Minimal, focused props interface
 * 
 * Pure presentational component with no Redux or business logic dependencies
 */

import React, { useState, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';

/**
 * Component props following ISP - only what's needed for input handling
 */
interface MessageInputProps {
  /** Callback when user sends a message */
  onSend: (content: string) => void;
  /** Callback when user sends an image */
  onSendImage?: (file: File) => void;
  /** Whether message is currently being sent */
  sending: boolean;
  /** Maximum character length for message (optional) */
  maxLength?: number;
}

/**
 * Styled components for Facebook Messenger-style input layout
 */
const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  padding: theme.spacing(1.5, 2),
  gap: theme.spacing(1),
  backgroundColor: '#ffffff',
  borderTop: '1px solid #e4e6ea',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#f0f2f5',
    border: 'none',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        border: '1px solid #1877f2',
      },
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5, 2),
    fontSize: '15px',
  },
  '& .MuiInputLabel-outlined': {
    transform: 'translate(16px, 12px) scale(1)',
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(16px, -6px) scale(0.75)',
  },
}));

const ActionButton = styled(IconButton)(() => ({
  color: '#1877f2',
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: 'rgba(24, 119, 242, 0.1)',
  },
  '&:disabled': {
    color: '#bcc0c4',
  },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#1877f2',
  color: '#ffffff',
  width: 36,
  height: 36,
  '&:hover': {
    backgroundColor: '#166fe5',
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabled,
    color: theme.palette.action.disabled,
  },
}));

const CharacterCount = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
}));

/**
 * MessageInput Component
 * 
 * Single Responsibility: Only handles message input UI and keyboard interactions
 * Interface Segregation: Minimal props interface with only required functionality
 * 
 * Features:
 * - Enter to send (Shift+Enter for newline)
 * - Character count display
 * - Disabled state while sending
 * - Multiline text support
 * 
 * @param props Component props
 * @returns Rendered message input
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onSendImage,
  sending,
  maxLength = 4000
}) => {
  const [message, setMessage] = useState('');
  const textFieldRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle message sending
   */
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !sending) {
      onSend(trimmedMessage);
      setMessage('');
      
      // Focus back to input after sending
      setTimeout(() => {
        textFieldRef.current?.focus();
      }, 100);
    }
  };

  /**
   * Handle image file selection
   */
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onSendImage && !sending) {
      // Validate file type
      if (file.type.startsWith('image/')) {
        onSendImage(file);
      } else {
        alert('Please select an image file');
      }
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  /**
   * Trigger file input click
   */
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle keyboard events
   * Enter = send message
   * Shift+Enter = new line
   */
  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  /**
   * Handle message text change
   */
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    // Enforce max length if specified
    if (maxLength && newValue.length <= maxLength) {
      setMessage(newValue);
    } else if (!maxLength) {
      setMessage(newValue);
    }
  };

  // Check if send button should be disabled
  const isSendDisabled = sending || !message.trim();

  // Calculate remaining characters
  const remainingChars = maxLength ? maxLength - message.length : null;
  const showCharCount = maxLength && message.length > maxLength * 0.8;
  const isNearLimit = remainingChars !== null && remainingChars < maxLength * 0.1;

  return (
    <Box>
      <InputContainer>
        {/* Image Upload Button */}
        {onSendImage && (
          <Tooltip title="Send photo">
            <ActionButton
              onClick={handleImageClick}
              disabled={sending}
              aria-label="Upload image"
            >
              <ImageIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
        )}

        <StyledTextField
          ref={textFieldRef}
          multiline
          maxRows={4}
          placeholder={sending ? 'Sending...' : 'Type a message...'}
          value={message}
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          disabled={sending}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            'aria-label': 'Message input',
          }}
        />
        
        <SendButton
          onClick={handleSend}
          disabled={isSendDisabled}
          aria-label="Send message"
          title={isSendDisabled ? 'Enter a message to send' : 'Send message (Enter)'}
        >
          <SendIcon fontSize="small" />
        </SendButton>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </InputContainer>
      
      {showCharCount && (
        <CharacterCount
          color={isNearLimit ? 'error' : 'textSecondary'}
          variant="caption"
        >
          {remainingChars} characters remaining
        </CharacterCount>
      )}
      
      {/* Helper text for keyboard shortcuts */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ 
          display: 'block', 
          mt: 0.5, 
          fontSize: '0.7rem',
          textAlign: 'center'
        }}
      >
        Press Enter to send, Shift+Enter for new line
      </Typography>
    </Box>
  );
};

export default MessageInput;

/*
 * SOLID Principles Implementation:
 * 
 * Single Responsibility Principle (SRP):
 * - MessageInput: Only handles message input UI and keyboard interactions
 * - handleSend: Only handles sending logic
 * - handleKeyPress: Only handles keyboard event processing
 * - handleMessageChange: Only handles text input validation
 * 
 * Open/Closed Principle (OCP):
 * - Extensible styling through styled components
 * - New input features can be added without changing core functionality
 * - Keyboard shortcuts can be extended without breaking existing behavior
 * - Validation logic is isolated and can be customized
 * 
 * Interface Segregation Principle (ISP):
 * - Minimal props interface with only required functionality
 * - No Redux or business logic dependencies
 * - Clean separation between input handling and message processing
 * 
 * Benefits:
 * - Pure Presentational: No Redux, HTTP, or business logic dependencies
 * - Keyboard Shortcuts: Enter to send, Shift+Enter for newline
 * - Character Limiting: Enforces maximum message length with visual feedback
 * - Accessibility: Proper ARIA labels and keyboard navigation
 * - User Experience: Auto-focus after sending, visual feedback for states
 * - Responsive Design: Adapts to different screen sizes
 * - Performance: Optimized state updates and event handling
 * 
 * Usage Examples:
 * 
 * // Basic usage
 * <MessageInput
 *   onSend={(content) => dispatch(sendMessageThunk({ conversationId, content }))}
 *   sending={false}
 * />
 * 
 * // With custom max length
 * <MessageInput
 *   onSend={handleSendMessage}
 *   sending={sendingState}
 *   maxLength={1000}
 * />
 * 
 * // In container component
 * const MessageInputContainer: React.FC<{ conversationId: number }> = ({ conversationId }) => {
 *   const dispatch = useAppDispatch();
 *   const sending = useSelector(selectSending);
 * 
 *   const handleSend = (content: string) => {
 *     // Add optimistic update
 *     dispatch(addOptimisticMessage({
 *       messageId: Date.now(),
 *       conversationId,
 *       senderId: currentUserId,
 *       content,
 *       timestamp: new Date().toISOString()
 *     }));
 * 
 *     // Send message
 *     dispatch(sendMessageThunk({ conversationId, content }));
 *   };
 * 
 *   return (
 *     <MessageInput
 *       onSend={handleSend}
 *       sending={sending}
 *       maxLength={4000}
 *     />
 *   );
 * };
 * 
 * // Form validation integration
 * const handleSendWithValidation = (content: string) => {
 *   const validation = validateSendMessage({ conversationId, content });
 *   if (validation.success) {
 *     onSend(content);
 *   } else {
 *     // Handle validation errors
 *     showValidationErrors(validation.errors);
 *   }
 * };
 */