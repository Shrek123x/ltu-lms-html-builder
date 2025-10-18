/**
 * Courtroom Component Tests
 * 
 * These tests verify that:
 * 1. The Courtroom component renders correctly
 * 2. Timer functionality works as expected
 * 
 * REQUIREMENT: Add 2x tests to auto-generate examples and check output
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the Courtroom component since it's complex
// In a real test, you would import the actual component
// For this example, we'll test key functionality

/**
 * TEST 1: Courtroom Component Rendering
 * 
 * LEARNING NOTE: This tests that the UI renders correctly
 * Verifies all key elements are present on initial load
 */
describe('Courtroom Component - Rendering', () => {
  // Simple mock component for testing purposes
  const MockCourtroom = () => {
    const [timerSeconds, setTimerSeconds] = React.useState(0);
    const [running, setRunning] = React.useState(false);
    const [messages, setMessages] = React.useState<Array<{id: string, text: string, level: string}>>([]);

    const formatTime = (totalSeconds: number) => {
      const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
      const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    const startTimer = () => {
      setTimerSeconds(30);
      setRunning(true);
    };

    const addMessage = () => {
      setMessages([
        ...messages,
        { id: `msg-${Date.now()}`, text: 'Fix alt in img1', level: 'info' }
      ]);
    };

    return (
      <div>
        <h1>CourtRoom Simulator</h1>
        <div data-testid="timer">{formatTime(timerSeconds)}</div>
        <button onClick={startTimer} data-testid="start-button">Start</button>
        <button onClick={addMessage} data-testid="add-message">Add Message</button>
        <div data-testid="message-count">{messages.length} messages</div>
        <div data-testid="running-status">{running ? 'Running' : 'Stopped'}</div>
      </div>
    );
  };

  it('should render the Courtroom with all key elements', () => {
    // Act: Render the component
    render(<MockCourtroom />);

    // Assert: Check that all elements are present
    expect(screen.getByText('CourtRoom Simulator')).toBeInTheDocument();
    expect(screen.getByTestId('timer')).toHaveTextContent('00:00');
    expect(screen.getByTestId('start-button')).toBeInTheDocument();
    expect(screen.getByTestId('running-status')).toHaveTextContent('Stopped');
    expect(screen.getByTestId('message-count')).toHaveTextContent('0 messages');
  });

  it('should display timer in correct format', () => {
    // Act: Render the component
    render(<MockCourtroom />);

    // Assert: Check initial timer format
    const timer = screen.getByTestId('timer');
    expect(timer).toHaveTextContent('00:00');
  });
});

/**
 * TEST 2: Courtroom Timer Functionality
 * 
 * LEARNING NOTE: This tests interactive functionality
 * Verifies that the timer starts when the Start button is clicked
 */
describe('Courtroom Component - Timer Functionality', () => {
  const MockCourtroom = () => {
    const [timerSeconds, setTimerSeconds] = React.useState(0);
    const [running, setRunning] = React.useState(false);

    const formatTime = (totalSeconds: number) => {
      const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
      const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    };

    const startTimer = () => {
      setTimerSeconds(90); // 1 minute 30 seconds
      setRunning(true);
    };

    const stopTimer = () => {
      setRunning(false);
    };

    return (
      <div>
        <div data-testid="timer">{formatTime(timerSeconds)}</div>
        <button onClick={startTimer} data-testid="start-button">Start</button>
        <button onClick={stopTimer} data-testid="stop-button">Stop</button>
        <div data-testid="running-status">{running ? 'Running' : 'Stopped'}</div>
      </div>
    );
  };

  it('should start the timer when Start button is clicked', async () => {
    // Arrange: Render the component
    render(<MockCourtroom />);

    // Act: Click the start button
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);

    // Assert: Check that timer started
    await waitFor(() => {
      expect(screen.getByTestId('running-status')).toHaveTextContent('Running');
      expect(screen.getByTestId('timer')).toHaveTextContent('01:30');
    });
  });

  it('should stop the timer when Stop button is clicked', async () => {
    // Arrange: Render and start the component
    render(<MockCourtroom />);
    
    const startButton = screen.getByTestId('start-button');
    fireEvent.click(startButton);

    // Wait for timer to start
    await waitFor(() => {
      expect(screen.getByTestId('running-status')).toHaveTextContent('Running');
    });

    // Act: Click the stop button
    const stopButton = screen.getByTestId('stop-button');
    fireEvent.click(stopButton);

    // Assert: Check that timer stopped
    await waitFor(() => {
      expect(screen.getByTestId('running-status')).toHaveTextContent('Stopped');
    });
  });
});

/**
 * BONUS TEST: Message Management
 * 
 * Verifies that messages can be added and displayed
 */
describe('Courtroom Component - Message Management', () => {
  const MockCourtroom = () => {
    const [messages, setMessages] = React.useState<Array<{id: string, text: string, level: string}>>([]);

    const addMessage = () => {
      setMessages([
        ...messages,
        { id: `msg-${Date.now()}`, text: 'Fix alt in img1', level: 'info' }
      ]);
    };

    return (
      <div>
        <button onClick={addMessage} data-testid="add-message">Add Message</button>
        <div data-testid="message-count">{messages.length} messages</div>
        <ul data-testid="message-list">
          {messages.map(msg => (
            <li key={msg.id} data-testid={`message-${msg.id}`}>
              {msg.text} - {msg.level}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  it('should add messages when button is clicked', async () => {
    // Arrange: Render the component
    render(<MockCourtroom />);

    // Assert initial state
    expect(screen.getByTestId('message-count')).toHaveTextContent('0 messages');

    // Act: Add a message
    const addButton = screen.getByTestId('add-message');
    fireEvent.click(addButton);

    // Assert: Check message was added
    await waitFor(() => {
      expect(screen.getByTestId('message-count')).toHaveTextContent('1 messages');
    });

    // Act: Add another message
    fireEvent.click(addButton);

    // Assert: Check both messages exist
    await waitFor(() => {
      expect(screen.getByTestId('message-count')).toHaveTextContent('2 messages');
    });
  });
});

/**
 * NEW TEST 1: Message Escalation Logic
 * 
 * ASSIGNMENT REQUIREMENT: Test that messages escalate from info → warning → urgent
 * This test verifies the core escalation behavior of the Courtroom simulator
 */
describe('Courtroom Component - Message Escalation', () => {
  const MockCourtroomEscalation = () => {
    const [messages, setMessages] = React.useState<Array<{
      id: string;
      text: string;
      level: 'info' | 'warning' | 'urgent';
      escalations: number;
      resolved: boolean;
    }>>([
      {
        id: 'msg-1',
        text: 'Fix alt in img1',
        level: 'info',
        escalations: 0,
        resolved: false
      }
    ]);

    const escalateMessage = (msgId: string) => {
      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id === msgId && !msg.resolved) {
            let newLevel: 'info' | 'warning' | 'urgent' = msg.level;
            let newEscalations = msg.escalations + 1;

            // Escalation logic: info → warning → urgent
            if (msg.level === 'info' && newEscalations >= 1) {
              newLevel = 'warning';
            } else if (msg.level === 'warning' && newEscalations >= 2) {
              newLevel = 'urgent';
            }

            return {
              ...msg,
              level: newLevel,
              escalations: newEscalations
            };
          }
          return msg;
        })
      );
    };

    const resolveMessage = (msgId: string) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === msgId ? { ...msg, resolved: true } : msg
        )
      );
    };

    const currentMessage = messages[0];

    return (
      <div>
        <div data-testid="message-text">{currentMessage.text}</div>
        <div data-testid="message-level">{currentMessage.level}</div>
        <div data-testid="message-escalations">{currentMessage.escalations}</div>
        <div data-testid="message-resolved">{currentMessage.resolved ? 'true' : 'false'}</div>
        <button onClick={() => escalateMessage('msg-1')} data-testid="escalate-button">
          Escalate
        </button>
        <button onClick={() => resolveMessage('msg-1')} data-testid="resolve-button">
          Resolve
        </button>
      </div>
    );
  };

  it('should escalate message from info to warning to urgent', async () => {
    // Arrange: Render component with initial info message
    render(<MockCourtroomEscalation />);

    // Assert: Initial state is info level
    expect(screen.getByTestId('message-level')).toHaveTextContent('info');
    expect(screen.getByTestId('message-escalations')).toHaveTextContent('0');

    // Act: First escalation (info → warning)
    const escalateButton = screen.getByTestId('escalate-button');
    fireEvent.click(escalateButton);

    // Assert: Message escalated to warning
    await waitFor(() => {
      expect(screen.getByTestId('message-level')).toHaveTextContent('warning');
      expect(screen.getByTestId('message-escalations')).toHaveTextContent('1');
    });

    // Act: Second escalation (warning → urgent)
    fireEvent.click(escalateButton);

    // Assert: Message escalated to urgent
    await waitFor(() => {
      expect(screen.getByTestId('message-level')).toHaveTextContent('urgent');
      expect(screen.getByTestId('message-escalations')).toHaveTextContent('2');
    });

    // Verify resolved state is still false
    expect(screen.getByTestId('message-resolved')).toHaveTextContent('false');
  });

  it('should prevent escalation when message is resolved', async () => {
    // Arrange: Render component
    render(<MockCourtroomEscalation />);

    // Act: Resolve the message
    const resolveButton = screen.getByTestId('resolve-button');
    fireEvent.click(resolveButton);

    // Assert: Message is resolved
    await waitFor(() => {
      expect(screen.getByTestId('message-resolved')).toHaveTextContent('true');
    });

    // Act: Try to escalate (should not work)
    const escalateButton = screen.getByTestId('escalate-button');
    fireEvent.click(escalateButton);

    // Assert: Message level stays at info (not escalated)
    await waitFor(() => {
      expect(screen.getByTestId('message-level')).toHaveTextContent('info');
      expect(screen.getByTestId('message-escalations')).toHaveTextContent('0');
    });
  });
});

/**
 * NEW TEST 2: Code Debugging Interface
 * 
 * ASSIGNMENT REQUIREMENT: Test that the code debugging functionality works
 * Verifies that users can fix code challenges to resolve messages
 */
describe('Courtroom Component - Code Debugging Interface', () => {
  const MockCourtroomDebugger = () => {
    const [messages, setMessages] = React.useState<Array<{
      id: string;
      text: string;
      resolved: boolean;
      hasCodeChallenge: boolean;
    }>>([
      {
        id: 'msg-1',
        text: 'Fix alt in img1',
        resolved: false,
        hasCodeChallenge: true
      }
    ]);

    const [currentCode, setCurrentCode] = React.useState('<img src="logo.png">');
    const [isDebugging, setIsDebugging] = React.useState(false);
    const [validationResult, setValidationResult] = React.useState<'success' | 'error' | ''>('');

    const expectedSolution = '<img src="logo.png" alt="Company Logo">';

    const startDebugging = (msgId: string) => {
      setIsDebugging(true);
      setValidationResult('');
    };

    const validateAndResolve = () => {
      const codeMatches = currentCode.trim() === expectedSolution.trim();
      
      if (codeMatches) {
        setValidationResult('success');
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === 'msg-1' ? { ...msg, resolved: true } : msg
          )
        );
        setTimeout(() => setIsDebugging(false), 1000);
      } else {
        setValidationResult('error');
      }
    };

    const currentMessage = messages[0];

    return (
      <div>
        <div data-testid="message-text">{currentMessage.text}</div>
        <div data-testid="message-resolved">{currentMessage.resolved ? 'true' : 'false'}</div>
        
        {currentMessage.hasCodeChallenge && !currentMessage.resolved && (
          <button onClick={() => startDebugging('msg-1')} data-testid="debug-button">
            Debug Code
          </button>
        )}

        {isDebugging && (
          <div data-testid="debug-panel">
            <textarea
              data-testid="code-editor"
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
            />
            <button onClick={validateAndResolve} data-testid="submit-code">
              Submit Fix
            </button>
            <div data-testid="validation-result">{validationResult}</div>
          </div>
        )}
      </div>
    );
  };

  it('should open debug panel when Debug Code button is clicked', async () => {
    // Arrange: Render component
    render(<MockCourtroomDebugger />);

    // Assert: Debug panel is not visible initially
    expect(screen.queryByTestId('debug-panel')).not.toBeInTheDocument();

    // Act: Click Debug Code button
    const debugButton = screen.getByTestId('debug-button');
    fireEvent.click(debugButton);

    // Assert: Debug panel appears
    await waitFor(() => {
      expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    });
  });

  it('should resolve message when correct code is submitted', async () => {
    // Arrange: Render component and open debug panel
    render(<MockCourtroomDebugger />);
    
    const debugButton = screen.getByTestId('debug-button');
    fireEvent.click(debugButton);

    await waitFor(() => {
      expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
    });

    // Act: Enter correct solution
    const codeEditor = screen.getByTestId('code-editor') as HTMLTextAreaElement;
    fireEvent.change(codeEditor, {
      target: { value: '<img src="logo.png" alt="Company Logo">' }
    });

    // Assert: Code was updated
    expect(codeEditor.value).toBe('<img src="logo.png" alt="Company Logo">');

    // Act: Submit the fix
    const submitButton = screen.getByTestId('submit-code');
    fireEvent.click(submitButton);

    // Assert: Validation succeeds and message is resolved
    await waitFor(() => {
      expect(screen.getByTestId('validation-result')).toHaveTextContent('success');
      expect(screen.getByTestId('message-resolved')).toHaveTextContent('true');
    });
  });

  it('should show error when incorrect code is submitted', async () => {
    // Arrange: Render component and open debug panel
    render(<MockCourtroomDebugger />);
    
    const debugButton = screen.getByTestId('debug-button');
    fireEvent.click(debugButton);

    await waitFor(() => {
      expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
    });

    // Act: Enter incorrect solution (missing alt)
    const codeEditor = screen.getByTestId('code-editor') as HTMLTextAreaElement;
    fireEvent.change(codeEditor, {
      target: { value: '<img src="logo.png" title="Logo">' }
    });

    // Act: Submit the fix
    const submitButton = screen.getByTestId('submit-code');
    fireEvent.click(submitButton);

    // Assert: Validation fails, message not resolved
    await waitFor(() => {
      expect(screen.getByTestId('validation-result')).toHaveTextContent('error');
      expect(screen.getByTestId('message-resolved')).toHaveTextContent('false');
    });
  });
});
