import { useState } from 'react';

const CONTRACTS: Record<string, string> = {
  'user-service': `openapi: 3.0.3
info:
  title: User Service API
  description: Manages user registration and retrieval
  version: 1.0.0

paths:
  /users:
    post:
      operationId: createUser
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid request body
    get:
      operationId: listUsers
      summary: List all users
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
  /users/{id}:
    get:
      operationId: getUserById
      summary: Get a user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: User details
        '404':
          description: User not found

components:
  schemas:
    CreateUserRequest:
      type: object
      required: [name, email, phone]
      properties:
        name:
          type: string         # ← AI agents often rename to "username"
        email:
          type: string         # ← AI agents often rename to "mail"
          format: email
        phone:
          type: string         # ← AI agents often return as number
        role:
          type: string
          enum: [developer, designer, manager, tester]
    User:
      type: object
      required: [id, name, email, phone, role, createdAt]
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
        phone:
          type: string
        role:
          type: string
        createdAt:
          type: string
          format: date-time`,

  'task-service': `openapi: 3.0.3
info:
  title: Task Service API
  description: Manages task creation and tracking
  version: 1.0.0

paths:
  /tasks:
    post:
      operationId: createTask
      summary: Create a new task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Task created successfully
    get:
      operationId: listTasks
      summary: List all tasks
      responses:
        '200':
          description: List of tasks

components:
  schemas:
    CreateTaskRequest:
      type: object
      required: [title, description, assigneeId]
      properties:
        title:
          type: string
        description:
          type: string       # ← AI agents often shorten to "desc"
        assigneeId:
          type: integer      # ← AI agents often rename to "assignee"
        priority:
          type: string
          enum: [low, medium, high, critical]
    Task:
      type: object
      required: [id, title, description, assigneeId, status, priority, createdAt]
      properties:
        id:
          type: integer
        title:
          type: string
        description:
          type: string
        assigneeId:
          type: integer
        status:
          type: string
          enum: [pending, in_progress, completed, cancelled]
        priority:
          type: string
        createdAt:
          type: string`,

  'notification-service': `openapi: 3.0.3
info:
  title: Notification Service API
  description: Manages notifications
  version: 1.0.0

paths:
  /notifications:
    post:
      operationId: createNotification
      summary: Send a notification
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateNotificationRequest'
      responses:
        '201':
          description: Notification created
    get:
      operationId: listNotifications
      summary: List all notifications
      responses:
        '200':
          description: List of notifications

components:
  schemas:
    CreateNotificationRequest:
      type: object
      required: [userId, message, type]
      properties:
        userId:
          type: integer      # ← AI agents often use "user_id" (snake_case)
        message:
          type: string
        type:
          type: string
          enum: [info, success, warning, error]
    Notification:
      type: object
      required: [id, userId, message, type, read, createdAt]
      properties:
        id:
          type: integer
        userId:
          type: integer
        message:
          type: string
        type:
          type: string
        read:
          type: boolean      # ← AI agents often omit this field
        createdAt:
          type: string`,

  'analytics-service': `openapi: 3.0.3
info:
  title: Analytics Service API
  description: Aggregated analytics
  version: 1.0.0

paths:
  /analytics:
    get:
      operationId: getAnalytics
      summary: Get aggregated analytics
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Analytics'

components:
  schemas:
    Analytics:
      type: object
      required:
        - totalUsers
        - totalTasks
        - completedTasks
        - completionRate
        - activeNotifications
        - tasksByPriority
        - tasksByStatus
        - generatedAt
      properties:
        totalUsers:
          type: integer
        totalTasks:
          type: integer
        completedTasks:
          type: integer
        completionRate:
          type: number
          format: float
        activeNotifications:
          type: integer
        tasksByPriority:
          type: object
        tasksByStatus:
          type: object
        generatedAt:
          type: string
          format: date-time`,
};

const SERVICE_NAMES = Object.keys(CONTRACTS);

export default function ContractViewer() {
  const [activeService, setActiveService] = useState(SERVICE_NAMES[0]);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Contract Viewer</h1>
        <p className="page-description">
          Browse the OpenAPI 3.0 contracts that serve as the source of truth for all AI agent interactions. Comments highlight common AI hallucination points.
        </p>
      </div>

      <div className="contract-tabs">
        {SERVICE_NAMES.map(name => (
          <button
            key={name}
            className={`contract-tab${activeService === name ? ' active' : ''}`}
            onClick={() => setActiveService(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="contract-content">
        <pre className="contract-yaml">{CONTRACTS[activeService]}</pre>
      </div>
    </div>
  );
}
