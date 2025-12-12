// src/docs/swagger.js
export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "BidHouse API",
    description: "API Documentation for BidHouse Online Auction Platform",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://bidhouse-chi.vercel.app", // Ganti URL Vercel lo biar bisa 'Try it out' langsung
      description: "Production Server",
    },
    {
      url: "http://localhost:3000",
      description: "Local Development",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    // --- AUTH ---
    "/api/auth/register": {
      post: {
        summary: "Register new user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Eed Ganteng" },
                  email: { type: "string", example: "eed@example.com" },
                  password: { type: "string", example: "rahasia123" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "eed@example.com" },
                  password: { type: "string", example: "rahasia123" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful (Returns Token)" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/verify-email": {
      get: {
        summary: "Verify Email (Clicked from Inbox)",
        tags: ["Auth"],
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Email verified HTML page" },
        },
      },
    },

    // --- ITEMS ---
    "/api/items": {
      get: {
        summary: "Get All Items (Filterable)",
        tags: ["Items"],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["OPEN", "CLOSED"] },
            description: "Filter by status",
          },
        ],
        responses: {
          200: { description: "List of items" },
        },
      },
      post: {
        summary: "Create Item (Admin Only)",
        tags: ["Items"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: [
                  "name",
                  "startPrice",
                  "startTime",
                  "endTime",
                  "image",
                ],
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  startPrice: { type: "number" },
                  startTime: { type: "string", format: "date-time" },
                  endTime: { type: "string", format: "date-time" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Item created" },
          403: { description: "Forbidden (Not Admin)" },
        },
      },
    },
    "/api/items/{id}": {
      get: {
        summary: "Get Item Detail & History",
        tags: ["Items"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Item details" },
          404: { description: "Not found" },
        },
      },
      delete: {
        summary: "Delete Item (Admin Only)",
        tags: ["Items"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Item deleted" },
        },
      },
    },

    // --- BIDDING ---
    "/api/items/{id}/bid": {
      post: {
        summary: "Place a Bid",
        tags: ["Bidding"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount"],
                properties: {
                  amount: { type: "number", example: 15000000 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Bid placed successfully" },
          400: { description: "Bid too low or auction closed" },
        },
      },
    },
    "/api/items/{id}/close": {
      post: {
        summary: "Close Auction Manually (Admin Only)",
        tags: ["Bidding"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Auction closed & winner determined" },
        },
      },
    },
  },
};
