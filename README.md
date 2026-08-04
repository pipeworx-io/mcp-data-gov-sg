# @pipeworx/data-gov-sg

Singapore data.gov.sg MCP — open government data (~2000 datasets covering population, economy, transport, environment) + real-time feeds. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

### Tabular
- `search_datasets(query?, page?, page_size?)` — browse datasets
- `get_dataset(dataset_id)` — dataset metadata + schema
- `query_dataset(dataset_id, limit?, offset?, filters?)` — fetch rows

### Real-time environment
- `weather_now()` — current temperature, humidity, wind, rain across 50+ weather stations
- `air_quality_psi()` — PSI air quality readings (5 regions)
- `air_quality_pm25()` — PM2.5 readings
- `uv_index()` — current UV index

### Real-time transport
- `taxi_availability()` — live taxi positions
- `traffic_incidents()` — current incidents on expressways

## Data source

`https://api-open.data.gov.sg/v2/` — public, keyless.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
