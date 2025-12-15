export async function fetchBalances(address: string) {
  const res = await fetch("http://localhost:9000", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "gorr_getAllBalances",
      params: [{ address }],
      id: 1,
    }),
  })

  const json = await res.json()
  return {
    gorr: Number(json.result.GORR) / 1e18,
    usdcc: Number(json.result.USDCc) / 1e18,
  }
}
