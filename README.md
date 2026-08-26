# @pipeworx/data-gov-sg

Singapore data.gov.sg MCP — open government data (~2000 datasets covering population, economy, transport, environment) + real-time feeds. No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/data-gov-sg/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Data Gov Sg data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
