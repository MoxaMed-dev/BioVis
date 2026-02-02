import { z } from "zod";
// import {
//   singleAnalysisRequestSchema,
//   comparisonRequestSchema,
// } from "./schema.ts";
import {
  singleAnalysisRequestSchema,
  comparisonRequestSchema,
} from "./schema.js";

export const api = {
  analyze: {
    single: {
      method: "POST" as const,
      path: "/api/analyze/single",
      input: singleAnalysisRequestSchema,
      responses: {
        200: z.any(),
        400: z.object({ message: z.string() }),
      },
    },
    compare: {
      method: "POST" as const,
      path: "/api/analyze/compare",
      input: comparisonRequestSchema,
      responses: {
        200: z.any(),
        400: z.object({ message: z.string() }),
      },
    },
  },
  history: {
    list: {
      method: "GET" as const,
      path: "/api/history",
      responses: {
        200: z.array(z.any()),
      },
    },
  },
  protein: {
    structure: {
      method: "GET" as const,
      path: "/api/protein/structure/:id",
      responses: {
        200: z.any(),
        404: z.object({ message: z.string() }),
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>,
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
