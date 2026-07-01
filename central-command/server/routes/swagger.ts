import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(resolve(__dirname, '../swagger.json'), 'utf-8'));

const router = Router();

// Serve the swagger.json spec
router.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(spec);
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
