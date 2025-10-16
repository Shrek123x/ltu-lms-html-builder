/**
 * API Tests for Messages CRUD endpoints
 * 
 * These tests verify that:
 * 1. GET /api/messages returns all messages
 * 2. POST /api/messages creates a new message
 * 
 * REQUIREMENT: Add 2x tests to auto-generate examples and check output
 */

// Mock Next.js modules before importing
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    method: init?.method || 'GET',
    json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: jest.fn().mockResolvedValue(data),
    })),
  },
}));

// Mock Prisma client
jest.mock('@/src/db/client', () => ({
  __esModule: true,
  default: {
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/messages/route';
import { GET as GETById, DELETE } from '@/app/api/messages/[id]/route';
import prisma from '@/src/db/client';

describe('Messages API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: GET /api/messages - Retrieve all messages
   * 
   * LEARNING NOTE: This tests the Read operation of CRUD
   * Verifies that the API returns a list of messages from the database
   */
  describe('GET /api/messages', () => {
    it('should return all messages with 200 status', async () => {
      // Arrange: Set up mock data
      const mockMessages = [
        {
          id: 1,
          text: 'Fix alt in img1',
          from: 'agile',
          level: 'info',
          timestamp: new Date('2025-10-15T10:00:00Z'),
          resolved: false,
        },
        {
          id: 2,
          text: 'Fix input validation',
          from: 'security',
          level: 'warning',
          timestamp: new Date('2025-10-15T10:05:00Z'),
          resolved: false,
        },
        {
          id: 3,
          text: 'Fix User login',
          from: 'payment',
          level: 'urgent',
          timestamp: new Date('2025-10-15T10:10:00Z'),
          resolved: true,
        },
      ];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      // Act: Call the API
      const response = await GET();
      const data = await response.json();

      // Assert: Check the response
      expect(response.status).toBe(200);
      expect(data).toHaveLength(3);
      expect(data[0].text).toBe('Fix alt in img1');
      expect(data[1].level).toBe('warning');
      expect(data[2].resolved).toBe(true);
      expect(prisma.message.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Simulate database error
      (prisma.message.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act: Call the API
      const response = await GET();
      const data = await response.json();

      // Assert: Check error handling
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch messages');
    });
  });

  /**
   * TEST 2: POST /api/messages - Create a new message
   * 
   * LEARNING NOTE: This tests the Create operation of CRUD
   * Verifies that the API can create new messages and validate input
   */
  describe('POST /api/messages', () => {
    it('should create a new message and return 201 status', async () => {
      // Arrange: Set up mock data
      const newMessage = {
        text: 'Fix Secure Database',
        from: 'ops',
        level: 'urgent',
        timestamp: '2025-10-15T10:15:00Z',
      };

      const createdMessage = {
        id: 4,
        ...newMessage,
        timestamp: new Date(newMessage.timestamp),
        resolved: false,
      };

      (prisma.message.create as jest.Mock).mockResolvedValue(createdMessage);

      // Act: Create a mock request
      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify(newMessage),
      });

      const response = await POST(request);
      const data = await response.json();

      // Assert: Check the response
      expect(response.status).toBe(201);
      expect(data.id).toBe(4);
      expect(data.text).toBe('Fix Secure Database');
      expect(data.from).toBe('ops');
      expect(data.level).toBe('urgent');
      expect(data.resolved).toBe(false);
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          text: newMessage.text,
          from: newMessage.from,
          level: newMessage.level,
          timestamp: expect.any(Date),
          resolved: false,
        },
      });
    });

    it('should return 400 if required fields are missing', async () => {
      // Arrange: Create a request with missing fields
      const invalidMessage = {
        text: 'Missing level and timestamp',
      };

      const request = new NextRequest('http://localhost:3000/api/messages', {
        method: 'POST',
        body: JSON.stringify(invalidMessage),
      });

      // Act: Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assert: Check validation
      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: text, level, timestamp');
      expect(prisma.message.create).not.toHaveBeenCalled();
    });
  });

  /**
   * BONUS TEST: DELETE /api/messages/[id] - Delete a message
   * 
   * This verifies the Delete operation of CRUD
   */
  describe('DELETE /api/messages/[id]', () => {
    it('should delete a message and return 200 status', async () => {
      // Arrange
      (prisma.message.delete as jest.Mock).mockResolvedValue({ id: 1 });

      // Act
      const response = await DELETE(
        new NextRequest('http://localhost:3000/api/messages/1'),
        { params: { id: '1' } }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe('Deleted successfully');
      expect(prisma.message.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
