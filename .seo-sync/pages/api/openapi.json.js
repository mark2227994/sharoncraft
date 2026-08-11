const OPENAPI_DOCUMENT = {
  openapi: "3.1.0",
  info: {
    title: "SharonCraft Public Discovery API",
    version: "1.0.0",
    description:
      "Machine-readable public discovery endpoints for SharonCraft products and indexing workflows.",
  },
  servers: [
    {
      url: "https://www.sharoncraft.co.ke",
    },
  ],
  paths: {
    "/api/search": {
      get: {
        summary: "Search visible SharonCraft products",
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "subcategory",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50 },
          },
        ],
        responses: {
          200: {
            description: "Structured product search response",
          },
        },
      },
    },
    "/api/indexnow": {
      post: {
        summary: "Submit one or more public URLs to IndexNow",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  urlList: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "IndexNow submission accepted",
          },
        },
      },
    },
  },
};

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(OPENAPI_DOCUMENT);
}
