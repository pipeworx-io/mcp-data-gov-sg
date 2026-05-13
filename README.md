# mcp-data-gov-sg

data.gov.sg MCP — Singapore open data + real-time environment/transport feeds

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Browse / search the data.gov.sg dataset catalog. |
| `get_dataset` | Dataset metadata + column schema. |
| `query_dataset` | Fetch rows from a dataset. Supports limit, offset, and filter map (column → value). |
| `weather_now` | Current temperature, humidity, wind, rain across Singapore weather stations. |
| `air_quality_psi` | Current Pollutant Standards Index (PSI) by region (north, south, east, west, central). |
| `air_quality_pm25` | Current PM2.5 µg/m³ readings by region. |
| `uv_index` | Current UV index. |
| `taxi_availability` | Live taxi positions across Singapore. |
| `traffic_incidents` | Current incidents on expressways and major roads. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "data-gov-sg": {
      "url": "https://gateway.pipeworx.io/data-gov-sg/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Data Gov Sg data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
