/**
 * Convert an IPFS URI (ipfs://...) to an HTTP gateway URL.
 *
 * Prefer the Pinata gateway if configured, otherwise fall back to the provided base.
 */
export function ipfsToGatewayUrl(
  uri: string,
  // We force ipfs.io here even if PINATA_GATEWAY_URL is present, as gateway.pinata.cloud rate limits very aggressively
  gatewayBase = "https://ipfs.io"
): string {
  if (!uri) return uri;

  if (uri.startsWith("ipfs://")) {
    const cidAndPath = uri.replace(/^ipfs:\/\//, "");

    // Developer convenience: if the repo still contains the placeholder genesis CID,
    // show the bundled local preview in development so the UI works without IPFS.
    if (process.env.NODE_ENV !== 'production' && (cidAndPath.startsWith('QmEIPsInsightPioneer1') || cidAndPath.startsWith('QmEthEdPioneer1'))) {
      // Use OG image fallback in dev instead of animated GIFs
      return '/og-image.png';
    }

    return `${gatewayBase.replace(/\/$/, "")}/ipfs/${cidAndPath}`;
  }

  return uri;
}
