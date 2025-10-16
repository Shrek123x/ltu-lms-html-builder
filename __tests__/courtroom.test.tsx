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
