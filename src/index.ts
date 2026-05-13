interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * data.gov.sg MCP — Singapore open data + real-time environment/transport feeds
 *
 * Two namespaces:
 *  - `/v1/...` for real-time feeds (weather, PSI, taxis, traffic) — legacy URL
 *  - `/v2/...` for the data catalog (datasets, query)
 *
 * Auth: none.
 * Docs: https://data.gov.sg/developer
 */


const BASE_V2 = 'https://api-open.data.gov.sg/v2';
const BASE_V1_RT = 'https://api.data.gov.sg/v1';

const tools: McpToolExport['tools'] = [
  // ── Tabular catalog ──
  {
    name: 'search_datasets',
    description: 'Browse / search the data.gov.sg dataset catalog.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text filter' },
        page: { type: 'number', description: '1-based page (default 1)' },
        page_size: { type: 'number', description: '1-100 (default 20)' },
      },
    },
  },
  {
    name: 'get_dataset',
    description: 'Dataset metadata + column schema.',
    inputSchema: {
      type: 'object',
      properties: { dataset_id: { type: 'string', description: 'Dataset ID (e.g. "d_8b84c4ee58e3cfc0ece0d773c8ca6abc")' } },
      required: ['dataset_id'],
    },
  },
  {
    name: 'query_dataset',
    description: 'Fetch rows from a dataset. Supports limit, offset, and filter map (column → value).',
    inputSchema: {
      type: 'object',
      properties: {
        dataset_id: { type: 'string', description: 'Dataset ID' },
        limit: { type: 'number', description: '1-10000 (default 100)' },
        offset: { type: 'number', description: '0-based row offset' },
        filters: {
          type: 'object',
          description: 'Column-value filter map',
          additionalProperties: { type: 'string' },
        },
      },
      required: ['dataset_id'],
    },
  },
  // ── Real-time environment ──
  {
    name: 'weather_now',
    description: 'Current temperature, humidity, wind, rain across Singapore weather stations.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'air_quality_psi',
    description: 'Current Pollutant Standards Index (PSI) by region (north, south, east, west, central).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'air_quality_pm25',
    description: 'Current PM2.5 µg/m³ readings by region.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'uv_index',
    description: 'Current UV index.',
    inputSchema: { type: 'object', properties: {} },
  },
  // ── Real-time transport ──
  {
    name: 'taxi_availability',
    description: 'Live taxi positions across Singapore.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'traffic_incidents',
    description: 'Current incidents on expressways and major roads.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_datasets':
      return searchDatasets(args);
    case 'get_dataset':
      return getDataset(reqStr(args, 'dataset_id', '"d_xxx"'));
    case 'query_dataset':
      return queryDataset(args);
    case 'weather_now':
      return v1Realtime('/environment/air-temperature').then(async (t) => {
        const [humidity, wind, rain] = await Promise.all([
          v1Realtime('/environment/relative-humidity').catch(() => null),
          v1Realtime('/environment/wind-speed').catch(() => null),
          v1Realtime('/environment/rainfall').catch(() => null),
        ]);
        return { temperature: t, humidity, wind, rainfall: rain };
      });
    case 'air_quality_psi':
      return v1Realtime('/environment/psi');
    case 'air_quality_pm25':
      return v1Realtime('/environment/pm25');
    case 'uv_index':
      return v1Realtime('/environment/uv-index');
    case 'taxi_availability':
      return v1Realtime('/transport/taxi-availability');
    case 'traffic_incidents':
      return v1Realtime('/transport/traffic-incidents');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function searchDatasets(args: Record<string, unknown>) {
  const params = new URLSearchParams({
    page: String(Math.max(1, (args.page as number) ?? 1)),
  });
  if (args.query) params.set('search', String(args.query));
  if (args.page_size) params.set('pageSize', String(Math.min(100, Math.max(1, args.page_size as number))));
  return sgGet(`${BASE_V2}/public/api/datasets?${params}`);
}

async function getDataset(datasetId: string) {
  return sgGet(`${BASE_V2}/public/api/datasets/${encodeURIComponent(datasetId)}/metadata`);
}

async function queryDataset(args: Record<string, unknown>) {
  const id = reqStr(args, 'dataset_id', '"d_xxx"');
  const params = new URLSearchParams({
    limit: String(Math.min(10000, Math.max(1, (args.limit as number) ?? 100))),
    offset: String(Math.max(0, (args.offset as number) ?? 0)),
  });
  if (args.filters && typeof args.filters === 'object') {
    params.set('filters', JSON.stringify(args.filters));
  }
  return sgGet(`${BASE_V2}/public/api/datasets/${encodeURIComponent(id)}/poll-download?${params}`);
}

async function v1Realtime(path: string) {
  return sgGet(`${BASE_V1_RT}${path}`);
}

async function sgGet(url: string) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (res.status === 404) throw new Error(`data.gov.sg: not found`);
  if (res.status === 429) throw new Error('data.gov.sg: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`data.gov.sg error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
