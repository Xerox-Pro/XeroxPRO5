// Fix for line 136: Cannot find name 'Buffer'.
import { Buffer } from 'buffer';

// Helper function to pipe a Web Stream (like one from fetch) to a Node.js stream (like the Vercel response object)
async function pipeWebStreamToNode(readable, writable) {
  const reader = readable.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        writable.end();
        break;
      }
      if (!writable.write(value)) {
        await new Promise(resolve => writable.once('drain', resolve));
      }
    }
  } catch (error) {
    console.error('Stream piping error:', error);
    writable.destroy();
  } finally {
    reader.releaseLock();
  }
}

const AD_DOMAIN_LIST = [
  'doubleclick.net', 'googlesyndication.com', 'google-analytics.com',
  'googletagservices.com', 'adservice.google.com', 'adnxs.com',
  'scorecardresearch.com', 'crwdcntrl.net', 'ad.gt', 'adform.net',
  'taboola.com', 'outbrain.com', 'adsrvr.org', 'criteo.com',
  'pubmatic.com', 'rubiconproject.com', 'openx.net', 'yieldmo.com'
];

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'];


export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
        const requestedHeaders = req.headers['access-control-request-headers'];
        if (requestedHeaders) {
            res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
        }
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.status(204).end();
    }
    
    const { url: targetUrl, ...queryParams } = req.query;

    if (!targetUrl || typeof targetUrl !== 'string') {
        return res.status(400).send('URL parameter is required');
    }

    let urlObject: URL;
    try {
        urlObject = new URL(targetUrl as string);
    } catch (e) {
        return res.status(400).send('Invalid URL provided');
    }
    
    const adBlock = queryParams.adBlock === 'true';
    const blockImages = queryParams.blockImages === 'true';
    const stealthMode = queryParams.stealthMode === 'true';
    const openLinksInNewTab = queryParams.openLinksInNewTab === 'true';

    if (adBlock) {
        const hostname = urlObject.hostname;
        if (AD_DOMAIN_LIST.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
            return res.status(204).send();
        }
    }
    if (blockImages) {
        if (IMAGE_EXTENSIONS.some(ext => urlObject.pathname.toLowerCase().endsWith(ext))) {
            return res.status(204).send();
        }
    }

    try {
        let referer = urlObject.origin;
        const clientRefererHeader = req.headers['referer'] as string;
        if (clientRefererHeader) {
            try {
                const clientRefererUrl = new URL(clientRefererHeader);
                if (clientRefererUrl.pathname.startsWith('/api/proxy')) {
                    const originalReferer = clientRefererUrl.searchParams.get('url');
                    if (originalReferer) {
                        referer = originalReferer;
                    }
                }
            } catch (e) {
                console.warn("Could not parse client referer:", clientRefererHeader);
            }
        }

        const baseHeaders = {
            'Accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9,ja;q=0.8',
            'Referer': referer,
            'Cookie': req.headers.cookie || '',
        };

        const stealthHeaders = {
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
             'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
             'Sec-Ch-Ua-Mobile': '?0',
             'Sec-Ch-Ua-Platform': '"Windows"',
             'Sec-Fetch-Dest': 'document',
             'Sec-Fetch-Mode': 'navigate',
             'Sec-Fetch-Site': 'none',
             'Sec-Fetch-User': '?1',
             'Upgrade-Insecure-Requests': '1',
        };
        
        const requestHeaders = {
            ...baseHeaders,
            ...(stealthMode ? stealthHeaders : { 'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy/1.0' }),
        };
        delete requestHeaders['host'];

        const response = await fetch(urlObject.toString(), {
            headers: requestHeaders,
            redirect: 'follow'
        });

        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.startsWith('image/') || contentType.startsWith('font/') || contentType.startsWith('video/') || contentType.startsWith('audio/')) {
            res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable');
        } else {
            res.setHeader('Cache-Control', 'no-store');
        }

        const excludedHeaders = ['content-encoding', 'transfer-encoding', 'connection', 'content-length', 'strict-transport-security', 'content-security-policy', 'content-security-policy-report-only', 'x-frame-options', 'cross-origin-embedder-policy', 'cross-origin-opener-policy', 'cache-control', 'referrer-policy'];

        const cookies = [];
        response.headers.forEach((value, name) => {
            if (name.toLowerCase() === 'set-cookie') {
                const modifiedCookie = value.replace(/; domain=([^;]+)/gi, '');
                cookies.push(modifiedCookie);
            } else if (!excludedHeaders.includes(name.toLowerCase())) {
                res.setHeader(name, value);
            }
        });
        
        if (cookies.length > 0) {
            res.setHeader('Set-Cookie', cookies);
        }
        
        res.status(response.status);

        const isHtml = contentType.includes('text/html');
        const isCss = contentType.includes('text/css');

        if (!isHtml && !isCss) {
            if (response.body) {
                await pipeWebStreamToNode(response.body, res);
            } else {
                res.end();
            }
            return;
        }
        
        const originalBody = await response.text();
        const base = new URL(targetUrl as string);
        let rewrittenBody = originalBody;

        const baseProxyParams = new URLSearchParams(queryParams as Record<string, string>);
        baseProxyParams.delete('url');
        const baseProxyParamsString = baseProxyParams.toString();

        const rewriteUrl = (url: string): string => {
            if (!url || typeof url !== 'string' || url.trim().startsWith('data:') || url.trim().startsWith('blob:') || url.trim().startsWith('#') || url.trim().startsWith('javascript:')) return url;
            try {
                const absoluteUrl = new URL(url, base.href).toString();
                return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}&${baseProxyParamsString}`;
            } catch (e) {
                return url;
            }
        };


        if (isHtml) {
            rewrittenBody = rewrittenBody.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/gi, '<!-- CSP meta tag removed by proxy -->');

            if (queryParams.blockScripts === 'true') {
                 rewrittenBody = rewrittenBody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<!-- Script blocked by proxy -->');
            }
            
            rewrittenBody = rewrittenBody
                .replace(/\s+integrity="[^"]*"/gi, ' ')
                .replace(/\s+crossorigin="[^"]*"/gi, ' ');

            if (queryParams.blockScripts !== 'true') {
                const injectionScript = `<script>
                (function() {
                  if (window.__proxy_injected__) return;
                  window.__proxy_injected__ = true;
                  
                  const baseProxyParamsString = '${baseProxyParamsString}';
                  const ORIGINAL_URL_BASE = '${base.href}';

                  const rewriteUrl = (url) => {
                    if (typeof url !== 'string' || !url.trim() || url.trim().startsWith('data:') || url.trim().startsWith('blob:') || url.trim().startsWith('about:') || url.trim().startsWith('javascript:')) return url;
                    try {
                      const absoluteUrl = new URL(url, ORIGINAL_URL_BASE).toString();
                      if (absoluteUrl.startsWith(window.location.origin) && absoluteUrl.includes('/api/proxy')) return url;
                      return \`/api/proxy?url=\${encodeURIComponent(absoluteUrl)}&\${baseProxyParamsString}\`;
                    } catch (e) { return url; }
                  };
                  
                  const notifyParentOfUrlChange = () => {
                    try {
                        let currentUrl = ORIGINAL_URL_BASE;
                        // For SPAs, location might change.
                        try {
                            currentUrl = new URL(location.href, ORIGINAL_URL_BASE).toString();
                        } catch(e) {}

                        // Post the "real" URL and title back to the parent frame.
                        window.parent.postMessage({ type: 'proxy-nav', url: currentUrl, title: document.title }, '*');
                    } catch(e) { console.error('Proxy notify error:', e); }
                  };

                  const originalFetch = window.fetch;
                  window.fetch = function(input, init) {
                    if (input instanceof Request) {
                       input = new Request(rewriteUrl(input.url), input);
                    } else {
                       input = rewriteUrl(input);
                    }
                    return originalFetch.call(this, input, init);
                  };

                  const originalXhrOpen = XMLHttpRequest.prototype.open;
                  XMLHttpRequest.prototype.open = function(method, url, ...args) {
                    return originalXhrOpen.call(this, method, rewriteUrl(url), ...args);
                  };

                  // --- Start of navigation interception ---
                  const originalAssign = Location.prototype.assign;
                  Location.prototype.assign = function(url) {
                    return originalAssign.call(this, rewriteUrl(url));
                  };
                  const originalReplace = Location.prototype.replace;
                  Location.prototype.replace = function(url) {
                    return originalReplace.call(this, rewriteUrl(url));
                  };
                  try {
                      const locationHrefDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
                      if (locationHrefDescriptor && locationHrefDescriptor.set) {
                          Object.defineProperty(Location.prototype, 'href', {
                              set: function(url) {
                                  return locationHrefDescriptor.set.call(this, rewriteUrl(url));
                              },
                              get: locationHrefDescriptor.get,
                              enumerable: locationHrefDescriptor.enumerable,
                              configurable: true,
                          });
                      }
                  } catch (e) {
                      console.error('Proxy script: Failed to wrap location.href setter.', e);
                  }
                  // --- End of navigation interception ---

                  const originalWindowOpen = window.open;
                  window.open = function(url, target, features) {
                    return originalWindowOpen.call(this, rewriteUrl(url), target, features);
                  };
                  
                  const rewriteElement = (el) => {
                      const attributes = ['src', 'href', 'action', 'formaction', 'poster', 'data-src'];
                      attributes.forEach(attr => {
                          if(el.hasAttribute(attr)) el.setAttribute(attr, rewriteUrl(el.getAttribute(attr)));
                      });
                      if(el.hasAttribute('srcset')) {
                          el.setAttribute('srcset', el.getAttribute('srcset').split(',').map(part => {
                            const [url, desc] = part.trim().split(/\s+/);
                            return \`\${rewriteUrl(url)} \${desc || ''}\`.trim();
                          }).join(', '));
                      }
                      if(el.style.backgroundImage) {
                          el.style.backgroundImage = el.style.backgroundImage.replace(/url\\((['"]?)(.*?)\\1\\)/gi, (m, q, u) => \`url(\${q}\${rewriteUrl(u)}\${q})\`);
                      }
                  };

                  const observer = new MutationObserver((mutations) => {
                      mutations.forEach(mutation => {
                          if (mutation.type === 'childList') {
                              mutation.addedNodes.forEach(node => {
                                  if (node.nodeType === 1) { // ELEMENT_NODE
                                      rewriteElement(node);
                                      node.querySelectorAll('*').forEach(rewriteElement);
                                  }
                              });
                          } else if (mutation.type === 'attributes') {
                              rewriteElement(mutation.target);
                          }
                      });
                  });
                  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'href', 'action', 'formaction', 'poster', 'srcset', 'style', 'data-src'] });

                  const originalPushState = history.pushState;
                  history.pushState = function(...args) {
                      originalPushState.apply(this, args);
                      notifyParentOfUrlChange();
                  };
                  const originalReplaceState = history.replaceState;
                  history.replaceState = function(...args) {
                      originalReplaceState.apply(this, args);
                      notifyParentOfUrlChange();
                  };

                  window.addEventListener('popstate', notifyParentOfUrlChange);
                  document.addEventListener('DOMContentLoaded', notifyParentOfUrlChange);
                  
                  const titleEl = document.querySelector('title');
                  if (titleEl) {
                    const titleObserver = new MutationObserver(notifyParentOfUrlChange);
                    titleObserver.observe(titleEl, { childList: true });
                  }
                }());
                </script>`;
                if (rewrittenBody.includes('<head>')) {
                    rewrittenBody = rewrittenBody.replace(/(<head[^>]*>)/i, `$1${injectionScript}`);
                } else {
                    rewrittenBody = injectionScript + rewrittenBody;
                }
            }

            rewrittenBody = rewrittenBody
                .replace(/(href|src|data-src|action|formaction|poster)=(["'])(.*?)\2/gi, (match, attr, quote, url) => `${attr}=${quote}${rewriteUrl(url)}${quote}`)
                .replace(/(srcset)=(["'])(.*?)\2/gi, (match, attr, quote, srcset) => {
                    const newSrcset = srcset.split(',').map(part => {
                        const [url, descriptor] = part.trim().split(/\s+/);
                        return `${rewriteUrl(url)} ${descriptor || ''}`.trim();
                    }).join(', ');
                    return `${attr}=${quote}${newSrcset}${quote}`;
                })
                .replace(/url\((['"]?)(.*?)\1\)/gi, (match, quote, url) => `url(${quote}${rewriteUrl(url)}${quote})`);
            
            if (openLinksInNewTab) {
                rewrittenBody = rewrittenBody.replace(/<a\s+(?!.*\btarget\s*=)([^>]+)>/gi, `<a $1 target="_blank" rel="noopener noreferrer">`);
            }
        }

        if (isCss) {
             rewrittenBody = rewrittenBody
                .replace(/url\((['"]?)(.*?)\1\)/gi, (match, quote, url) => `url(${quote}${rewriteUrl(url)}${quote})`)
                .replace(/@import\s+(['"])(.*?)\1/gi, (match, quote, url) => `@import ${quote}${rewriteUrl(url)}${quote}`);
        }
        
        res.setHeader('Content-Length', Buffer.byteLength(rewrittenBody));
        res.send(rewrittenBody);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(502).send('Error fetching the requested URL.');
    }
}
