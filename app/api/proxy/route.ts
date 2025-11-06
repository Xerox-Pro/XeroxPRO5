import { NextRequest } from 'next/server';
import { JSDOM } from 'jsdom';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('URL parameter is required', { status: 400 });
  }

  let urlObject: URL;
  try {
    urlObject = new URL(targetUrl);
  } catch (e) {
    return new Response('Invalid URL provided', { status: 400 });
  }

  try {
    const response = await fetch(urlObject.toString(), {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'PrivacyProxy/1.0',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'en-US,en;q=0.9,ja;q=0.8',
        'Referer': urlObject.origin,
      },
      redirect: 'follow',
    });
    
    const contentType = response.headers.get('content-type') || '';

    // HTMLコンテンツを処理
    if (contentType.includes('text/html')) {
      const originalBody = await response.text();
      const dom = new JSDOM(originalBody, { url: targetUrl });
      const { document } = dom.window;

      const rewriteUrl = (url: string | null): string => {
        if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) return url || '#';
        try {
          const absoluteUrl = new URL(url, targetUrl).toString();
          return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        } catch (e) {
          // 不正なURLはそのまま返す
          return url;
        }
      };

      // 主要な属性のURLを書き換え
      document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(el => el.href = rewriteUrl(el.getAttribute('href')));
      document.querySelectorAll<HTMLLinkElement>('link[href]').forEach(el => el.href = rewriteUrl(el.getAttribute('href')));
      document.querySelectorAll<HTMLScriptElement>('script[src]').forEach(el => el.src = rewriteUrl(el.getAttribute('src')));
      document.querySelectorAll<HTMLImageElement>('img[src]').forEach(el => el.src = rewriteUrl(el.getAttribute('src')));
      document.querySelectorAll<HTMLSourceElement>('source[src]').forEach(el => el.src = rewriteUrl(el.getAttribute('src')));
      document.querySelectorAll<HTMLFormElement>('form[action]').forEach(el => el.action = rewriteUrl(el.getAttribute('action')));
      
      // srcset属性を処理
      document.querySelectorAll<HTMLImageElement | HTMLSourceElement>('[srcset]').forEach(el => {
          const newSrcset = el.srcset.split(',').map(part => {
              const [url, descriptor] = part.trim().split(/\s+/);
              if (url) return `${rewriteUrl(url)} ${descriptor || ''}`.trim();
              return part;
          }).join(', ');
          el.srcset = newSrcset;
      });
      
      // セキュリティ上の理由からintegrity属性を削除
      document.querySelectorAll('[integrity]').forEach(el => el.removeAttribute('integrity'));
      
      // baseタグを挿入して、スクリプトによる相対パス解決を補助
      let base = document.querySelector('base');
      if (!base) {
          base = document.createElement('base');
          document.head.prepend(base);
      }
      base.href = targetUrl;

      const rewrittenBody = dom.serialize();
      
      const headers = new Headers(response.headers);
      // CSPやX-Frame-Optionsなどのヘッダーを削除して、プロキシ内での表示を許可
      headers.delete('Content-Security-Policy');
      headers.delete('X-Frame-Options');
      headers.set('Content-Type', 'text/html; charset=UTF-8');

      return new Response(rewrittenBody, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });

    } else {
      // HTML以外のコンテンツ（画像、CSS、JSなど）はそのままストリーミング
      if (!response.body) {
        return new Response(null, { status: response.status, statusText: response.statusText, headers: response.headers });
      }
      const { readable, writable } = new TransformStream();
      response.body.pipeTo(writable);

      const headers = new Headers(response.headers);
      
      return new Response(readable, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });
    }

  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response('Error fetching the requested URL.', { status: 502 });
  }
}
