import { NextRequest, NextResponse } from 'next/server';

// Esta URL é resolvida pelo servidor Node.js dentro do container Docker,
// não pelo browser do usuário. Por isso usamos host.docker.internal.
const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8003';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const res = await fetch(`${BACKEND_URL}/catalog/${encodeURIComponent(params.slug)}`, {
      next: { revalidate: 60 },
    });
    const data = await res.arrayBuffer();
    const headers = new Headers(res.headers);
    headers.delete('content-encoding');
    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  } catch {
    return NextResponse.json({ error: 'Backend unavailable' }, { status: 503 });
  }
}
