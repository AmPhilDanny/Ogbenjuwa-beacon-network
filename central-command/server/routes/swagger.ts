import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

let specCache: Record<string, unknown> | null = null;

function loadSwaggerSpec(): Record<string, unknown> {
  if (specCache) return specCache;
  const __dirname = dirname(fileURLToPath(import.meta.url));
  specCache = JSON.parse(readFileSync(resolve(__dirname, '../swagger.json'), 'utf-8')) as Record<string, unknown>;
  return specCache;
}

const router = Router();

// Serve the swagger.json spec
router.get('/openapi.json', (_req: Request, res: Response) => {
  try {
    res.json(loadSwaggerSpec());
  } catch {
    res.status(500).json({ error: { code: 'SWAGGER_NOT_FOUND', message: 'API spec not available' } });
  }
});

// Serve Swagger UI as a simple HTML page (no npm deps needed)
router.get('/', (_req: Request, res: Response) => {
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Ogbenjuwa API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: '/api/v1/docs/openapi.json', dom_id: '#swagger-ui', presets: [SwaggerUIBundle.presets.apis] });
  </script>
</body>
</html>`);
});

export { router as swaggerRouter };
