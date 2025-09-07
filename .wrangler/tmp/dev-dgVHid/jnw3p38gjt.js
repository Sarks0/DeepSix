var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-j3OEIP/bundledWorker-0.7558582911325473.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
import("node:buffer").then(({ Buffer: Buffer2 }) => {
  globalThis.Buffer = Buffer2;
}).catch(() => null);
var __ALSes_PROMISE__ = import("node:async_hooks").then(({ AsyncLocalStorage }) => {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
  const envAsyncLocalStorage = new AsyncLocalStorage();
  const requestContextAsyncLocalStorage = new AsyncLocalStorage();
  globalThis.process = {
    env: new Proxy(
      {},
      {
        ownKeys: /* @__PURE__ */ __name2(() => Reflect.ownKeys(envAsyncLocalStorage.getStore()), "ownKeys"),
        getOwnPropertyDescriptor: /* @__PURE__ */ __name2((_, ...args) => Reflect.getOwnPropertyDescriptor(envAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
        get: /* @__PURE__ */ __name2((_, property) => Reflect.get(envAsyncLocalStorage.getStore(), property), "get"),
        set: /* @__PURE__ */ __name2((_, property, value) => Reflect.set(envAsyncLocalStorage.getStore(), property, value), "set")
      }
    )
  };
  globalThis[Symbol.for("__cloudflare-request-context__")] = new Proxy(
    {},
    {
      ownKeys: /* @__PURE__ */ __name2(() => Reflect.ownKeys(requestContextAsyncLocalStorage.getStore()), "ownKeys"),
      getOwnPropertyDescriptor: /* @__PURE__ */ __name2((_, ...args) => Reflect.getOwnPropertyDescriptor(requestContextAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
      get: /* @__PURE__ */ __name2((_, property) => Reflect.get(requestContextAsyncLocalStorage.getStore(), property), "get"),
      set: /* @__PURE__ */ __name2((_, property, value) => Reflect.set(requestContextAsyncLocalStorage.getStore(), property, value), "set")
    }
  );
  return { envAsyncLocalStorage, requestContextAsyncLocalStorage };
}).catch(() => null);
var ne = Object.create;
var A = Object.defineProperty;
var ie = Object.getOwnPropertyDescriptor;
var oe = Object.getOwnPropertyNames;
var ce = Object.getPrototypeOf;
var ue = Object.prototype.hasOwnProperty;
var C = /* @__PURE__ */ __name2((t, e) => () => (t && (e = t(t = 0)), e), "C");
var L = /* @__PURE__ */ __name2((t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports), "L");
var pe = /* @__PURE__ */ __name2((t, e, s, r) => {
  if (e && typeof e == "object" || typeof e == "function") for (let i of oe(e)) !ue.call(t, i) && i !== s && A(t, i, { get: /* @__PURE__ */ __name2(() => e[i], "get"), enumerable: !(r = ie(e, i)) || r.enumerable });
  return t;
}, "pe");
var D = /* @__PURE__ */ __name2((t, e, s) => (s = t != null ? ne(ce(t)) : {}, pe(e || !t || !t.__esModule ? A(s, "default", { value: t, enumerable: true }) : s, t)), "D");
var x;
var u = C(() => {
  x = { collectedLocales: [] };
});
var f;
var p = C(() => {
  f = { version: 3, routes: { none: [{ src: "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$", headers: { Location: "/$1" }, status: 308, continue: true }, { src: "^/_next/__private/trace$", dest: "/404", status: 404, continue: true }, { src: "^(?:/(.*))(?:/)?$", headers: { "X-DNS-Prefetch-Control": "on", "X-Frame-Options": "DENY" }, continue: true }, { src: "^/404/?$", status: 404, continue: true, missing: [{ type: "header", key: "x-prerender-revalidate" }] }, { src: "^/500$", status: 500, continue: true }, { src: "^/_next/data/JMKD2PhTMpgXiN7HOoH1R/(.*).json$", dest: "/$1", override: true, continue: true, has: [{ type: "header", key: "x-nextjs-data" }] }, { src: "^/index(?:/)?$", has: [{ type: "header", key: "x-nextjs-data" }], dest: "/", override: true, continue: true }, { continue: true, src: "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/api(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json)?[\\/#\\?]?$", missing: [{ type: "header", key: "x-prerender-revalidate", value: "8a6435ad0fab08fe45178fc0c4139dba" }], middlewarePath: "middleware", middlewareRawSrc: ["/api/:path*"], override: true }, { src: "^/$", has: [{ type: "header", key: "x-nextjs-data" }], dest: "/_next/data/JMKD2PhTMpgXiN7HOoH1R/index.json", continue: true, override: true }, { src: "^/((?!_next/)(?:.*[^/]|.*))/?$", has: [{ type: "header", key: "x-nextjs-data" }], dest: "/_next/data/JMKD2PhTMpgXiN7HOoH1R/$1.json", continue: true, override: true }, { src: "^/?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/index.rsc", headers: { vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" }, continue: true, override: true }, { src: "^/((?!.+\\.rsc).+?)(?:/)?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/$1.rsc", headers: { vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" }, continue: true, override: true }], filesystem: [{ src: "^/_next/data/JMKD2PhTMpgXiN7HOoH1R/(.*).json$", dest: "/$1", continue: true, has: [{ type: "header", key: "x-nextjs-data" }] }, { src: "^/index(?:/)?$", has: [{ type: "header", key: "x-nextjs-data" }], dest: "/", continue: true }, { src: "^/index(\\.action|\\.rsc)$", dest: "/", continue: true }, { src: "^/\\.prefetch\\.rsc$", dest: "/__index.prefetch.rsc", check: true }, { src: "^/(.+)/\\.prefetch\\.rsc$", dest: "/$1.prefetch.rsc", check: true }, { src: "^/\\.rsc$", dest: "/index.rsc", check: true }, { src: "^/(.+)/\\.rsc$", dest: "/$1.rsc", check: true }], miss: [{ src: "^/_next/static/.+$", status: 404, check: true, dest: "/_next/static/not-found.txt", headers: { "content-type": "text/plain; charset=utf-8" } }], rewrite: [{ src: "^/$", has: [{ type: "header", key: "x-nextjs-data" }], dest: "/_next/data/JMKD2PhTMpgXiN7HOoH1R/index.json", continue: true }, { src: "^/((?!_next/)(?:.*[^/]|.*))/?$", has: [{ type: "header", key: "x-nextjs-data" }], dest: "/_next/data/JMKD2PhTMpgXiN7HOoH1R/$1.json", continue: true }, { src: "^/_next/data/JMKD2PhTMpgXiN7HOoH1R/api/mars\\-photos/(?<nxtProver>[^/]+?)(?:/)?.json$", dest: "/api/mars-photos/[rover]?nxtProver=$nxtProver" }, { src: "^/_next/data/JMKD2PhTMpgXiN7HOoH1R/api/spacecraft/(?<nxtPid>[^/]+?)(?:/)?.json$", dest: "/api/spacecraft/[id]?nxtPid=$nxtPid" }, { src: "^/_next/data/JMKD2PhTMpgXiN7HOoH1R/missions/(?<nxtPid>[^/]+?)(?:/)?.json$", dest: "/missions/[id]?nxtPid=$nxtPid" }, { src: "^/api/mars\\-photos/(?<nxtProver>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/api/mars-photos/[rover].rsc?nxtProver=$nxtProver" }, { src: "^/api/mars\\-photos/(?<nxtProver>[^/]+?)(?:/)?$", dest: "/api/mars-photos/[rover]?nxtProver=$nxtProver" }, { src: "^/api/spacecraft/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/api/spacecraft/[id].rsc?nxtPid=$nxtPid" }, { src: "^/api/spacecraft/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/api/spacecraft/[id]?nxtPid=$nxtPid" }, { src: "^/missions/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/missions/[id].rsc?nxtPid=$nxtPid" }, { src: "^/missions/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/missions/[id]?nxtPid=$nxtPid" }, { src: "^/_next/data/JMKD2PhTMpgXiN7HOoH1R/(.*).json$", headers: { "x-nextjs-matched-path": "/$1" }, continue: true, override: true }, { src: "^/_next/data/JMKD2PhTMpgXiN7HOoH1R/(.*).json$", dest: "__next_data_catchall" }], resource: [{ src: "^/.*$", status: 404 }], hit: [{ src: "^/_next/static/(?:[^/]+/pages|pages|chunks|runtime|css|image|media|JMKD2PhTMpgXiN7HOoH1R)/.+$", headers: { "cache-control": "public,max-age=31536000,immutable" }, continue: true, important: true }, { src: "^/index(?:/)?$", headers: { "x-matched-path": "/" }, continue: true, important: true }, { src: "^/((?!index$).*?)(?:/)?$", headers: { "x-matched-path": "/$1" }, continue: true, important: true }], error: [{ src: "^/.*$", dest: "/404", status: 404 }, { src: "^/.*$", dest: "/500", status: 500 }] }, images: { domains: [], sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 16, 32, 48, 64, 96, 128, 256, 384], remotePatterns: [{ protocol: "https", hostname: "^(?:^(?:mars\\.nasa\\.gov)$)$", pathname: "^(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$))(?:(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$)).)*?)\\/?)$" }, { protocol: "https", hostname: "^(?:^(?:mars\\.jpl\\.nasa\\.gov)$)$", pathname: "^(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$))(?:(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$)).)*?)\\/?)$" }, { protocol: "https", hostname: "^(?:^(?:images\\-api\\.nasa\\.gov)$)$", pathname: "^(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$))(?:(?:(?!(?:^|\\/)\\.{1,2}(?:\\/|$)).)*?)\\/?)$" }], minimumCacheTTL: 60, formats: ["image/webp"], dangerouslyAllowSVG: false, contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;", contentDispositionType: "attachment" }, overrides: { "404.html": { path: "404", contentType: "text/html; charset=utf-8" }, "500.html": { path: "500", contentType: "text/html; charset=utf-8" }, "_app.rsc.json": { path: "_app.rsc", contentType: "application/json" }, "_error.rsc.json": { path: "_error.rsc", contentType: "application/json" }, "_document.rsc.json": { path: "_document.rsc", contentType: "application/json" }, "404.rsc.json": { path: "404.rsc", contentType: "application/json" }, "favicon.ico": { contentType: "image/x-icon" }, "__next_data_catchall.json": { path: "__next_data_catchall", contentType: "application/json" }, "_next/static/not-found.txt": { contentType: "text/plain" } }, framework: { version: "15.5.2" }, crons: [] };
});
var m;
var d = C(() => {
  m = { "/404.html": { type: "override", path: "/404.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/404.rsc.json": { type: "override", path: "/404.rsc.json", headers: { "content-type": "application/json" } }, "/500.html": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/__next_data_catchall.json": { type: "override", path: "/__next_data_catchall.json", headers: { "content-type": "application/json" } }, "/_app.rsc.json": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc.json": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc.json": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_next/static/JMKD2PhTMpgXiN7HOoH1R/_buildManifest.js": { type: "static" }, "/_next/static/JMKD2PhTMpgXiN7HOoH1R/_ssgManifest.js": { type: "static" }, "/_next/static/chunks/0f8af13e.227c8609e846a132.js": { type: "static" }, "/_next/static/chunks/369.87b3718ea5a1e5ce.js": { type: "static" }, "/_next/static/chunks/450.c4fd6d827b1cda3e.js": { type: "static" }, "/_next/static/chunks/4bd1b696-c023c6e3521b1417.js": { type: "static" }, "/_next/static/chunks/app/_not-found/page-7caeddd82b96f1cc.js": { type: "static" }, "/_next/static/chunks/app/about/page-171522039c08ba81.js": { type: "static" }, "/_next/static/chunks/app/api/dsn-now/route-d70c0a5347b481f8.js": { type: "static" }, "/_next/static/chunks/app/api/insight-photos/route-d70c0a5347b481f8.js": { type: "static" }, "/_next/static/chunks/app/api/mars-photos/[rover]/route-d70c0a5347b481f8.js": { type: "static" }, "/_next/static/chunks/app/api/spacecraft/[id]/route-d70c0a5347b481f8.js": { type: "static" }, "/_next/static/chunks/app/api/spacecraft/route-d70c0a5347b481f8.js": { type: "static" }, "/_next/static/chunks/app/api-test/page-a7b65955eaaf3d76.js": { type: "static" }, "/_next/static/chunks/app/layout-065eec07c372cc23.js": { type: "static" }, "/_next/static/chunks/app/live/page-8526df97d98285bf.js": { type: "static" }, "/_next/static/chunks/app/missions/[id]/page-8ba72ebdfed2282e.js": { type: "static" }, "/_next/static/chunks/app/missions/page-59df880c309f6ec0.js": { type: "static" }, "/_next/static/chunks/app/page-84c30f82921132c8.js": { type: "static" }, "/_next/static/chunks/app/solar-system/page-6ef9d641f33dbccb.js": { type: "static" }, "/_next/static/chunks/b536a0f1.05ee2c75df4a3b9d.js": { type: "static" }, "/_next/static/chunks/bd904a5c.3aea2adebde6f067.js": { type: "static" }, "/_next/static/chunks/framer-motion-521ac8771fdaf757.js": { type: "static" }, "/_next/static/chunks/framework-9b376f5636d779c2.js": { type: "static" }, "/_next/static/chunks/main-67892b1fabeedebb.js": { type: "static" }, "/_next/static/chunks/main-app-bc8095f0e1680db1.js": { type: "static" }, "/_next/static/chunks/pages/_app-9cf911c712abe69c.js": { type: "static" }, "/_next/static/chunks/pages/_error-c2ac0dc50b89f9c9.js": { type: "static" }, "/_next/static/chunks/polyfills-42372ed130431b0a.js": { type: "static" }, "/_next/static/chunks/three.6e4c9a94729bd825.js": { type: "static" }, "/_next/static/chunks/vendors-b8d44b8c46679849.js": { type: "static" }, "/_next/static/chunks/webpack-e9ee61963aa8291e.js": { type: "static" }, "/_next/static/css/2aea1448ceb53fa9.css": { type: "static" }, "/_next/static/media/0aa834ed78bf6d07-s.woff2": { type: "static" }, "/_next/static/media/26a46d62cd723877-s.woff2": { type: "static" }, "/_next/static/media/55c55f0601d81cf3-s.woff2": { type: "static" }, "/_next/static/media/581909926a08bbc8-s.woff2": { type: "static" }, "/_next/static/media/67957d42bae0796d-s.woff2": { type: "static" }, "/_next/static/media/886030b0b59bc5a7-s.woff2": { type: "static" }, "/_next/static/media/8e9860b6e62d6359-s.woff2": { type: "static" }, "/_next/static/media/939c4f875ee75fbb-s.woff2": { type: "static" }, "/_next/static/media/97e0cb1ae144a2a9-s.woff2": { type: "static" }, "/_next/static/media/bb3ef058b751a6ad-s.p.woff2": { type: "static" }, "/_next/static/media/df0a9ae256c0569c-s.woff2": { type: "static" }, "/_next/static/media/e4af272ccee01ff0-s.p.woff2": { type: "static" }, "/_next/static/media/f911b923c6adde36-s.woff2": { type: "static" }, "/_next/static/not-found.txt": { type: "static" }, "/favicon.ico": { type: "override", path: "/favicon.ico", headers: { "content-type": "image/x-icon" } }, "/api/dsn-now": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/dsn-now.func.js" }, "/api/dsn-now.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/dsn-now.func.js" }, "/api/insight-photos": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/insight-photos.func.js" }, "/api/insight-photos.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/insight-photos.func.js" }, "/api/mars-photos/[rover]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/mars-photos/[rover].func.js" }, "/api/mars-photos/[rover].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/mars-photos/[rover].func.js" }, "/api/spacecraft/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/spacecraft/[id].func.js" }, "/api/spacecraft/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/spacecraft/[id].func.js" }, "/api/spacecraft": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/spacecraft.func.js" }, "/api/spacecraft.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/spacecraft.func.js" }, "/missions/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/missions/[id].func.js" }, "/missions/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/missions/[id].func.js" }, "/404": { type: "override", path: "/404.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/500": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/404.rsc": { type: "override", path: "/404.rsc.json", headers: { "content-type": "application/json" } }, "/": { type: "override", path: "/index.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/__next_data_catchall": { type: "override", path: "/__next_data_catchall.json", headers: { "content-type": "application/json" } }, "/_not-found.html": { type: "override", path: "/_not-found.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/_not-found": { type: "override", path: "/_not-found.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/_not-found.rsc": { type: "override", path: "/_not-found.rsc", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/_not-found/layout,_N_T_/_not-found/page,_N_T_/_not-found", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch", "content-type": "text/x-component" } }, "/about.html": { type: "override", path: "/about.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/about/layout,_N_T_/about/page,_N_T_/about", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/about": { type: "override", path: "/about.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/about/layout,_N_T_/about/page,_N_T_/about", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/about.rsc": { type: "override", path: "/about.rsc", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/about/layout,_N_T_/about/page,_N_T_/about", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch", "content-type": "text/x-component" } }, "/api-test.html": { type: "override", path: "/api-test.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/api-test/layout,_N_T_/api-test/page,_N_T_/api-test", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/api-test": { type: "override", path: "/api-test.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/api-test/layout,_N_T_/api-test/page,_N_T_/api-test", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/api-test.rsc": { type: "override", path: "/api-test.rsc", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/api-test/layout,_N_T_/api-test/page,_N_T_/api-test", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch", "content-type": "text/x-component" } }, "/index.html": { type: "override", path: "/index.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/index": { type: "override", path: "/index.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/index.rsc": { type: "override", path: "/index.rsc", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/page,_N_T_/", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch", "content-type": "text/x-component" } }, "/live.html": { type: "override", path: "/live.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/live/layout,_N_T_/live/page,_N_T_/live", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/live": { type: "override", path: "/live.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/live/layout,_N_T_/live/page,_N_T_/live", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/live.rsc": { type: "override", path: "/live.rsc", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/live/layout,_N_T_/live/page,_N_T_/live", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch", "content-type": "text/x-component" } }, "/missions.html": { type: "override", path: "/missions.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/missions/layout,_N_T_/missions/page,_N_T_/missions", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/missions": { type: "override", path: "/missions.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/missions/layout,_N_T_/missions/page,_N_T_/missions", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/missions.rsc": { type: "override", path: "/missions.rsc", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/missions/layout,_N_T_/missions/page,_N_T_/missions", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch", "content-type": "text/x-component" } }, "/solar-system.html": { type: "override", path: "/solar-system.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/solar-system/layout,_N_T_/solar-system/page,_N_T_/solar-system", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/solar-system": { type: "override", path: "/solar-system.html", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/solar-system/layout,_N_T_/solar-system/page,_N_T_/solar-system", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch" } }, "/solar-system.rsc": { type: "override", path: "/solar-system.rsc", headers: { "x-nextjs-stale-time": "300", "x-nextjs-prerender": "1", "x-next-cache-tags": "_N_T_/layout,_N_T_/solar-system/layout,_N_T_/solar-system/page,_N_T_/solar-system", vary: "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch", "content-type": "text/x-component" } }, middleware: { type: "middleware", entrypoint: "__next-on-pages-dist__/functions/middleware.func.js" } };
});
var U = L((et, V) => {
  "use strict";
  u();
  p();
  d();
  function w(t, e) {
    t = String(t || "").trim();
    let s = t, r, i = "";
    if (/^[^a-zA-Z\\\s]/.test(t)) {
      r = t[0];
      let o = t.lastIndexOf(r);
      i += t.substring(o + 1), t = t.substring(1, o);
    }
    let n = 0;
    return t = he(t, (o) => {
      if (/^\(\?[P<']/.test(o)) {
        let c = /^\(\?P?[<']([^>']+)[>']/.exec(o);
        if (!c) throw new Error(`Failed to extract named captures from ${JSON.stringify(o)}`);
        let l = o.substring(c[0].length, o.length - 1);
        return e && (e[n] = c[1]), n++, `(${l})`;
      }
      return o.substring(0, 3) === "(?:" || n++, o;
    }), t = t.replace(/\[:([^:]+):\]/g, (o, c) => w.characterClasses[c] || o), new w.PCRE(t, i, s, i, r);
  }
  __name(w, "w");
  __name2(w, "w");
  function he(t, e) {
    let s = 0, r = 0, i = false;
    for (let a = 0; a < t.length; a++) {
      let n = t[a];
      if (i) {
        i = false;
        continue;
      }
      switch (n) {
        case "(":
          r === 0 && (s = a), r++;
          break;
        case ")":
          if (r > 0 && (r--, r === 0)) {
            let o = a + 1, c = s === 0 ? "" : t.substring(0, s), l = t.substring(o), h = String(e(t.substring(s, o)));
            t = c + h + l, a = s;
          }
          break;
        case "\\":
          i = true;
          break;
        default:
          break;
      }
    }
    return t;
  }
  __name(he, "he");
  __name2(he, "he");
  (function(t) {
    class e extends RegExp {
      static {
        __name(this, "e");
      }
      static {
        __name2(this, "e");
      }
      constructor(r, i, a, n, o) {
        super(r, i), this.pcrePattern = a, this.pcreFlags = n, this.delimiter = o;
      }
    }
    t.PCRE = e, t.characterClasses = { alnum: "[A-Za-z0-9]", word: "[A-Za-z0-9_]", alpha: "[A-Za-z]", blank: "[ \\t]", cntrl: "[\\x00-\\x1F\\x7F]", digit: "\\d", graph: "[\\x21-\\x7E]", lower: "[a-z]", print: "[\\x20-\\x7E]", punct: "[\\]\\[!\"#$%&'()*+,./:;<=>?@\\\\^_`{|}~-]", space: "\\s", upper: "[A-Z]", xdigit: "[A-Fa-f0-9]" };
  })(w || (w = {}));
  w.prototype = w.PCRE.prototype;
  V.exports = w;
});
var Q = L((O) => {
  "use strict";
  u();
  p();
  d();
  O.parse = Ce;
  O.serialize = $e;
  var Pe = Object.prototype.toString, Te = Object.prototype.hasOwnProperty, je = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, Ne = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, ke = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, Se = /^[\u0020-\u003A\u003D-\u007E]*$/;
  function Ce(t, e) {
    if (typeof t != "string") throw new TypeError("argument str must be a string");
    var s = {}, r = t.length;
    if (r < 2) return s;
    var i = e && e.decode || Me, a = 0, n = 0, o = 0;
    do {
      if (n = t.indexOf("=", a), n === -1) break;
      if (o = t.indexOf(";", a), o === -1) o = r;
      else if (n > o) {
        a = t.lastIndexOf(";", n - 1) + 1;
        continue;
      }
      var c = Z(t, a, n), l = Y(t, n, c), h = t.slice(c, l);
      if (!Te.call(s, h)) {
        var _ = Z(t, n + 1, o), g = Y(t, o, _);
        t.charCodeAt(_) === 34 && t.charCodeAt(g - 1) === 34 && (_++, g--);
        var ae = t.slice(_, g);
        s[h] = He(ae, i);
      }
      a = o + 1;
    } while (a < r);
    return s;
  }
  __name(Ce, "Ce");
  __name2(Ce, "Ce");
  function Z(t, e, s) {
    do {
      var r = t.charCodeAt(e);
      if (r !== 32 && r !== 9) return e;
    } while (++e < s);
    return s;
  }
  __name(Z, "Z");
  __name2(Z, "Z");
  function Y(t, e, s) {
    for (; e > s; ) {
      var r = t.charCodeAt(--e);
      if (r !== 32 && r !== 9) return e + 1;
    }
    return s;
  }
  __name(Y, "Y");
  __name2(Y, "Y");
  function $e(t, e, s) {
    var r = s && s.encode || encodeURIComponent;
    if (typeof r != "function") throw new TypeError("option encode is invalid");
    if (!je.test(t)) throw new TypeError("argument name is invalid");
    var i = r(e);
    if (!Ne.test(i)) throw new TypeError("argument val is invalid");
    var a = t + "=" + i;
    if (!s) return a;
    if (s.maxAge != null) {
      var n = Math.floor(s.maxAge);
      if (!isFinite(n)) throw new TypeError("option maxAge is invalid");
      a += "; Max-Age=" + n;
    }
    if (s.domain) {
      if (!ke.test(s.domain)) throw new TypeError("option domain is invalid");
      a += "; Domain=" + s.domain;
    }
    if (s.path) {
      if (!Se.test(s.path)) throw new TypeError("option path is invalid");
      a += "; Path=" + s.path;
    }
    if (s.expires) {
      var o = s.expires;
      if (!Ee(o) || isNaN(o.valueOf())) throw new TypeError("option expires is invalid");
      a += "; Expires=" + o.toUTCString();
    }
    if (s.httpOnly && (a += "; HttpOnly"), s.secure && (a += "; Secure"), s.partitioned && (a += "; Partitioned"), s.priority) {
      var c = typeof s.priority == "string" ? s.priority.toLowerCase() : s.priority;
      switch (c) {
        case "low":
          a += "; Priority=Low";
          break;
        case "medium":
          a += "; Priority=Medium";
          break;
        case "high":
          a += "; Priority=High";
          break;
        default:
          throw new TypeError("option priority is invalid");
      }
    }
    if (s.sameSite) {
      var l = typeof s.sameSite == "string" ? s.sameSite.toLowerCase() : s.sameSite;
      switch (l) {
        case true:
          a += "; SameSite=Strict";
          break;
        case "lax":
          a += "; SameSite=Lax";
          break;
        case "strict":
          a += "; SameSite=Strict";
          break;
        case "none":
          a += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return a;
  }
  __name($e, "$e");
  __name2($e, "$e");
  function Me(t) {
    return t.indexOf("%") !== -1 ? decodeURIComponent(t) : t;
  }
  __name(Me, "Me");
  __name2(Me, "Me");
  function Ee(t) {
    return Pe.call(t) === "[object Date]";
  }
  __name(Ee, "Ee");
  __name2(Ee, "Ee");
  function He(t, e) {
    try {
      return e(t);
    } catch {
      return t;
    }
  }
  __name(He, "He");
  __name2(He, "He");
});
u();
p();
d();
u();
p();
d();
u();
p();
d();
var R = "INTERNAL_SUSPENSE_CACHE_HOSTNAME.local";
u();
p();
d();
u();
p();
d();
u();
p();
d();
u();
p();
d();
var q = D(U());
function j(t, e, s) {
  if (e == null) return { match: null, captureGroupKeys: [] };
  let r = s ? "" : "i", i = [];
  return { match: (0, q.default)(`%${t}%${r}`, i).exec(e), captureGroupKeys: i };
}
__name(j, "j");
__name2(j, "j");
function b(t, e, s, { namedOnly: r } = {}) {
  return t.replace(/\$([a-zA-Z0-9_]+)/g, (i, a) => {
    let n = s.indexOf(a);
    return r && n === -1 ? i : (n === -1 ? e[parseInt(a, 10)] : e[n + 1]) || "";
  });
}
__name(b, "b");
__name2(b, "b");
function M(t, { url: e, cookies: s, headers: r, routeDest: i }) {
  switch (t.type) {
    case "host":
      return { valid: e.hostname === t.value };
    case "header":
      return t.value !== void 0 ? $(t.value, r.get(t.key), i) : { valid: r.has(t.key) };
    case "cookie": {
      let a = s[t.key];
      return a && t.value !== void 0 ? $(t.value, a, i) : { valid: a !== void 0 };
    }
    case "query":
      return t.value !== void 0 ? $(t.value, e.searchParams.get(t.key), i) : { valid: e.searchParams.has(t.key) };
  }
}
__name(M, "M");
__name2(M, "M");
function $(t, e, s) {
  let { match: r, captureGroupKeys: i } = j(t, e);
  return s && r && i.length ? { valid: !!r, newRouteDest: b(s, r, i, { namedOnly: true }) } : { valid: !!r };
}
__name($, "$");
__name2($, "$");
u();
p();
d();
function F(t) {
  let e = new Headers(t.headers);
  return t.cf && (e.set("x-vercel-ip-city", encodeURIComponent(t.cf.city)), e.set("x-vercel-ip-country", t.cf.country), e.set("x-vercel-ip-country-region", t.cf.regionCode), e.set("x-vercel-ip-latitude", t.cf.latitude), e.set("x-vercel-ip-longitude", t.cf.longitude)), e.set("x-vercel-sc-host", R), new Request(t, { headers: e });
}
__name(F, "F");
__name2(F, "F");
u();
p();
d();
function y(t, e, s) {
  let r = e instanceof Headers ? e.entries() : Object.entries(e);
  for (let [i, a] of r) {
    let n = i.toLowerCase(), o = s?.match ? b(a, s.match, s.captureGroupKeys) : a;
    n === "set-cookie" ? t.append(n, o) : t.set(n, o);
  }
}
__name(y, "y");
__name2(y, "y");
function P(t) {
  return /^https?:\/\//.test(t);
}
__name(P, "P");
__name2(P, "P");
function v(t, e) {
  for (let [s, r] of e.entries()) {
    let i = /^nxtP(.+)$/.exec(s), a = /^nxtI(.+)$/.exec(s);
    i?.[1] ? (t.set(s, r), t.set(i[1], r)) : a?.[1] ? t.set(a[1], r.replace(/(\(\.+\))+/, "")) : (!t.has(s) || r && !t.getAll(s).includes(r)) && t.append(s, r);
  }
}
__name(v, "v");
__name2(v, "v");
function E(t, e) {
  let s = new URL(e, t.url);
  return v(s.searchParams, new URL(t.url).searchParams), s.pathname = s.pathname.replace(/\/index.html$/, "/").replace(/\.html$/, ""), new Request(s, t);
}
__name(E, "E");
__name2(E, "E");
function T(t) {
  return new Response(t.body, t);
}
__name(T, "T");
__name2(T, "T");
function H(t) {
  return t.split(",").map((e) => {
    let [s, r] = e.split(";"), i = parseFloat((r ?? "q=1").replace(/q *= */gi, ""));
    return [s.trim(), isNaN(i) ? 1 : i];
  }).sort((e, s) => s[1] - e[1]).map(([e]) => e === "*" || e === "" ? [] : e).flat();
}
__name(H, "H");
__name2(H, "H");
u();
p();
d();
function I(t) {
  switch (t) {
    case "none":
      return "filesystem";
    case "filesystem":
      return "rewrite";
    case "rewrite":
      return "resource";
    case "resource":
      return "miss";
    default:
      return "miss";
  }
}
__name(I, "I");
__name2(I, "I");
async function N(t, { request: e, assetsFetcher: s, ctx: r }, { path: i, searchParams: a }) {
  let n, o = new URL(e.url);
  v(o.searchParams, a);
  let c = new Request(o, e);
  try {
    switch (t?.type) {
      case "function":
      case "middleware": {
        let l = await import(t.entrypoint);
        try {
          n = await l.default(c, r);
        } catch (h) {
          let _ = h;
          throw _.name === "TypeError" && _.message.endsWith("default is not a function") ? new Error(`An error occurred while evaluating the target edge function (${t.entrypoint})`) : h;
        }
        break;
      }
      case "override": {
        n = T(await s.fetch(E(c, t.path ?? i))), t.headers && y(n.headers, t.headers);
        break;
      }
      case "static": {
        n = await s.fetch(E(c, i));
        break;
      }
      default:
        n = new Response("Not Found", { status: 404 });
    }
  } catch (l) {
    return console.error(l), new Response("Internal Server Error", { status: 500 });
  }
  return T(n);
}
__name(N, "N");
__name2(N, "N");
function K(t, e) {
  let s = "^//?(?:", r = ")/(.*)$";
  return !t.startsWith(s) || !t.endsWith(r) ? false : t.slice(s.length, -r.length).split("|").every((a) => e.has(a));
}
__name(K, "K");
__name2(K, "K");
u();
p();
d();
function fe(t, { protocol: e, hostname: s, port: r, pathname: i }) {
  return !(e && t.protocol.replace(/:$/, "") !== e || !new RegExp(s).test(t.hostname) || r && !new RegExp(r).test(t.port) || i && !new RegExp(i).test(t.pathname));
}
__name(fe, "fe");
__name2(fe, "fe");
function me(t, e) {
  if (t.method !== "GET") return;
  let { origin: s, searchParams: r } = new URL(t.url), i = r.get("url"), a = Number.parseInt(r.get("w") ?? "", 10), n = Number.parseInt(r.get("q") ?? "75", 10);
  if (!i || Number.isNaN(a) || Number.isNaN(n) || !e?.sizes?.includes(a) || n < 0 || n > 100) return;
  let o = new URL(i, s);
  if (o.pathname.endsWith(".svg") && !e?.dangerouslyAllowSVG) return;
  let c = i.startsWith("//"), l = i.startsWith("/") && !c;
  if (!l && !e?.domains?.includes(o.hostname) && !e?.remotePatterns?.find((g) => fe(o, g))) return;
  let h = t.headers.get("Accept") ?? "", _ = e?.formats?.find((g) => h.includes(g))?.replace("image/", "");
  return { isRelative: l, imageUrl: o, options: { width: a, quality: n, format: _ } };
}
__name(me, "me");
__name2(me, "me");
function _e(t, e, s) {
  let r = new Headers();
  if (s?.contentSecurityPolicy && r.set("Content-Security-Policy", s.contentSecurityPolicy), s?.contentDispositionType) {
    let a = e.pathname.split("/").pop(), n = a ? `${s.contentDispositionType}; filename="${a}"` : s.contentDispositionType;
    r.set("Content-Disposition", n);
  }
  t.headers.has("Cache-Control") || r.set("Cache-Control", `public, max-age=${s?.minimumCacheTTL ?? 60}`);
  let i = T(t);
  return y(i.headers, r), i;
}
__name(_e, "_e");
__name2(_e, "_e");
async function B(t, { buildOutput: e, assetsFetcher: s, imagesConfig: r }) {
  let i = me(t, r);
  if (!i) return new Response("Invalid image resizing request", { status: 400 });
  let { isRelative: a, imageUrl: n } = i, c = await (a && n.pathname in e ? s.fetch.bind(s) : fetch)(n);
  return _e(c, n, r);
}
__name(B, "B");
__name2(B, "B");
u();
p();
d();
u();
p();
d();
u();
p();
d();
async function k(t) {
  return import(t);
}
__name(k, "k");
__name2(k, "k");
var xe = "x-vercel-cache-tags";
var ye = "x-next-cache-soft-tags";
var ge = Symbol.for("__cloudflare-request-context__");
async function J(t) {
  let e = `https://${R}/v1/suspense-cache/`;
  if (!t.url.startsWith(e)) return null;
  try {
    let s = new URL(t.url), r = await ve();
    if (s.pathname === "/v1/suspense-cache/revalidate") {
      let a = s.searchParams.get("tags")?.split(",") ?? [];
      for (let n of a) await r.revalidateTag(n);
      return new Response(null, { status: 200 });
    }
    let i = s.pathname.replace("/v1/suspense-cache/", "");
    if (!i.length) return new Response("Invalid cache key", { status: 400 });
    switch (t.method) {
      case "GET": {
        let a = G(t, ye), n = await r.get(i, { softTags: a });
        return n ? new Response(JSON.stringify(n.value), { status: 200, headers: { "Content-Type": "application/json", "x-vercel-cache-state": "fresh", age: `${(Date.now() - (n.lastModified ?? Date.now())) / 1e3}` } }) : new Response(null, { status: 404 });
      }
      case "POST": {
        let a = globalThis[ge], n = /* @__PURE__ */ __name2(async () => {
          let o = await t.json();
          o.data.tags === void 0 && (o.tags ??= G(t, xe) ?? []), await r.set(i, o);
        }, "n");
        return a ? a.ctx.waitUntil(n()) : await n(), new Response(null, { status: 200 });
      }
      default:
        return new Response(null, { status: 405 });
    }
  } catch (s) {
    return console.error(s), new Response("Error handling cache request", { status: 500 });
  }
}
__name(J, "J");
__name2(J, "J");
async function ve() {
  return process.env.__NEXT_ON_PAGES__KV_SUSPENSE_CACHE ? z("kv") : z("cache-api");
}
__name(ve, "ve");
__name2(ve, "ve");
async function z(t) {
  let e = `./__next-on-pages-dist__/cache/${t}.js`, s = await k(e);
  return new s.default();
}
__name(z, "z");
__name2(z, "z");
function G(t, e) {
  return t.headers.get(e)?.split(",")?.filter(Boolean);
}
__name(G, "G");
__name2(G, "G");
function W() {
  globalThis[X] || (we(), globalThis[X] = true);
}
__name(W, "W");
__name2(W, "W");
function we() {
  let t = globalThis.fetch;
  globalThis.fetch = async (...e) => {
    let s = new Request(...e), r = await Re(s);
    return r || (r = await J(s), r) ? r : (be(s), t(s));
  };
}
__name(we, "we");
__name2(we, "we");
async function Re(t) {
  if (t.url.startsWith("blob:")) try {
    let s = `./__next-on-pages-dist__/assets/${new URL(t.url).pathname}.bin`, r = (await k(s)).default, i = { async arrayBuffer() {
      return r;
    }, get body() {
      return new ReadableStream({ start(a) {
        let n = Buffer.from(r);
        a.enqueue(n), a.close();
      } });
    }, async text() {
      return Buffer.from(r).toString();
    }, async json() {
      let a = Buffer.from(r);
      return JSON.stringify(a.toString());
    }, async blob() {
      return new Blob(r);
    } };
    return i.clone = () => ({ ...i }), i;
  } catch {
  }
  return null;
}
__name(Re, "Re");
__name2(Re, "Re");
function be(t) {
  t.headers.has("user-agent") || t.headers.set("user-agent", "Next.js Middleware");
}
__name(be, "be");
__name2(be, "be");
var X = Symbol.for("next-on-pages fetch patch");
u();
p();
d();
var ee = D(Q());
var S = class {
  static {
    __name(this, "S");
  }
  static {
    __name2(this, "S");
  }
  constructor(e, s, r, i, a) {
    this.routes = e;
    this.output = s;
    this.reqCtx = r;
    this.url = new URL(r.request.url), this.cookies = (0, ee.parse)(r.request.headers.get("cookie") || ""), this.path = this.url.pathname || "/", this.headers = { normal: new Headers(), important: new Headers() }, this.searchParams = new URLSearchParams(), v(this.searchParams, this.url.searchParams), this.checkPhaseCounter = 0, this.middlewareInvoked = [], this.wildcardMatch = a?.find((n) => n.domain === this.url.hostname), this.locales = new Set(i.collectedLocales);
  }
  url;
  cookies;
  wildcardMatch;
  path;
  status;
  headers;
  searchParams;
  body;
  checkPhaseCounter;
  middlewareInvoked;
  locales;
  checkRouteMatch(e, { checkStatus: s, checkIntercept: r }) {
    let i = j(e.src, this.path, e.caseSensitive);
    if (!i.match || e.methods && !e.methods.map((n) => n.toUpperCase()).includes(this.reqCtx.request.method.toUpperCase())) return;
    let a = { url: this.url, cookies: this.cookies, headers: this.reqCtx.request.headers, routeDest: e.dest };
    if (!e.has?.find((n) => {
      let o = M(n, a);
      return o.newRouteDest && (a.routeDest = o.newRouteDest), !o.valid;
    }) && !e.missing?.find((n) => M(n, a).valid) && !(s && e.status !== this.status)) {
      if (r && e.dest) {
        let n = /\/(\(\.+\))+/, o = n.test(e.dest), c = n.test(this.path);
        if (o && !c) return;
      }
      return { routeMatch: i, routeDest: a.routeDest };
    }
  }
  processMiddlewareResp(e) {
    let s = "x-middleware-override-headers", r = e.headers.get(s);
    if (r) {
      let c = new Set(r.split(",").map((l) => l.trim()));
      for (let l of c.keys()) {
        let h = `x-middleware-request-${l}`, _ = e.headers.get(h);
        this.reqCtx.request.headers.get(l) !== _ && (_ ? this.reqCtx.request.headers.set(l, _) : this.reqCtx.request.headers.delete(l)), e.headers.delete(h);
      }
      e.headers.delete(s);
    }
    let i = "x-middleware-rewrite", a = e.headers.get(i);
    if (a) {
      let c = new URL(a, this.url), l = this.url.hostname !== c.hostname;
      this.path = l ? `${c}` : c.pathname, v(this.searchParams, c.searchParams), e.headers.delete(i);
    }
    let n = "x-middleware-next";
    e.headers.get(n) ? e.headers.delete(n) : !a && !e.headers.has("location") ? (this.body = e.body, this.status = e.status) : e.headers.has("location") && e.status >= 300 && e.status < 400 && (this.status = e.status), y(this.reqCtx.request.headers, e.headers), y(this.headers.normal, e.headers), this.headers.middlewareLocation = e.headers.get("location");
  }
  async runRouteMiddleware(e) {
    if (!e) return true;
    let s = e && this.output[e];
    if (!s || s.type !== "middleware") return this.status = 500, false;
    let r = await N(s, this.reqCtx, { path: this.path, searchParams: this.searchParams, headers: this.headers, status: this.status });
    return this.middlewareInvoked.push(e), r.status === 500 ? (this.status = r.status, false) : (this.processMiddlewareResp(r), true);
  }
  applyRouteOverrides(e) {
    e.override && (this.status = void 0, this.headers.normal = new Headers(), this.headers.important = new Headers());
  }
  applyRouteHeaders(e, s, r) {
    e.headers && (y(this.headers.normal, e.headers, { match: s, captureGroupKeys: r }), e.important && y(this.headers.important, e.headers, { match: s, captureGroupKeys: r }));
  }
  applyRouteStatus(e) {
    e.status && (this.status = e.status);
  }
  applyRouteDest(e, s, r) {
    if (!e.dest) return this.path;
    let i = this.path, a = e.dest;
    this.wildcardMatch && /\$wildcard/.test(a) && (a = a.replace(/\$wildcard/g, this.wildcardMatch.value)), this.path = b(a, s, r);
    let n = /\/index\.rsc$/i.test(this.path), o = /^\/(?:index)?$/i.test(i), c = /^\/__index\.prefetch\.rsc$/i.test(i);
    n && !o && !c && (this.path = i);
    let l = /\.rsc$/i.test(this.path), h = /\.prefetch\.rsc$/i.test(this.path), _ = this.path in this.output;
    l && !h && !_ && (this.path = this.path.replace(/\.rsc/i, ""));
    let g = new URL(this.path, this.url);
    return v(this.searchParams, g.searchParams), P(this.path) || (this.path = g.pathname), i;
  }
  applyLocaleRedirects(e) {
    if (!e.locale?.redirect || !/^\^(.)*$/.test(e.src) && e.src !== this.path || this.headers.normal.has("location")) return;
    let { locale: { redirect: r, cookie: i } } = e, a = i && this.cookies[i], n = H(a ?? ""), o = H(this.reqCtx.request.headers.get("accept-language") ?? ""), h = [...n, ...o].map((_) => r[_]).filter(Boolean)[0];
    if (h) {
      !this.path.startsWith(h) && (this.headers.normal.set("location", h), this.status = 307);
      return;
    }
  }
  getLocaleFriendlyRoute(e, s) {
    return !this.locales || s !== "miss" ? e : K(e.src, this.locales) ? { ...e, src: e.src.replace(/\/\(\.\*\)\$$/, "(?:/(.*))?$") } : e;
  }
  async checkRoute(e, s) {
    let r = this.getLocaleFriendlyRoute(s, e), { routeMatch: i, routeDest: a } = this.checkRouteMatch(r, { checkStatus: e === "error", checkIntercept: e === "rewrite" }) ?? {}, n = { ...r, dest: a };
    if (!i?.match || n.middlewarePath && this.middlewareInvoked.includes(n.middlewarePath)) return "skip";
    let { match: o, captureGroupKeys: c } = i;
    if (this.applyRouteOverrides(n), this.applyLocaleRedirects(n), !await this.runRouteMiddleware(n.middlewarePath)) return "error";
    if (this.body !== void 0 || this.headers.middlewareLocation) return "done";
    this.applyRouteHeaders(n, o, c), this.applyRouteStatus(n);
    let h = this.applyRouteDest(n, o, c);
    if (n.check && !P(this.path)) if (h === this.path) {
      if (e !== "miss") return this.checkPhase(I(e));
      this.status = 404;
    } else if (e === "miss") {
      if (!(this.path in this.output) && !(this.path.replace(/\/$/, "") in this.output)) return this.checkPhase("filesystem");
      this.status === 404 && (this.status = void 0);
    } else return this.checkPhase("none");
    return !n.continue || n.status && n.status >= 300 && n.status <= 399 ? "done" : "next";
  }
  async checkPhase(e) {
    if (this.checkPhaseCounter++ >= 50) return console.error(`Routing encountered an infinite loop while checking ${this.url.pathname}`), this.status = 500, "error";
    this.middlewareInvoked = [];
    let s = true;
    for (let a of this.routes[e]) {
      let n = await this.checkRoute(e, a);
      if (n === "error") return "error";
      if (n === "done") {
        s = false;
        break;
      }
    }
    if (e === "hit" || P(this.path) || this.headers.normal.has("location") || this.body) return "done";
    if (e === "none") for (let a of this.locales) {
      let n = new RegExp(`/${a}(/.*)`), c = this.path.match(n)?.[1];
      if (c && c in this.output) {
        this.path = c;
        break;
      }
    }
    let r = this.path in this.output;
    if (!r && this.path.endsWith("/")) {
      let a = this.path.replace(/\/$/, "");
      r = a in this.output, r && (this.path = a);
    }
    if (e === "miss" && !r) {
      let a = !this.status || this.status < 400;
      this.status = a ? 404 : this.status;
    }
    let i = "miss";
    return r || e === "miss" || e === "error" ? i = "hit" : s && (i = I(e)), this.checkPhase(i);
  }
  async run(e = "none") {
    this.checkPhaseCounter = 0;
    let s = await this.checkPhase(e);
    return this.headers.normal.has("location") && (!this.status || this.status < 300 || this.status >= 400) && (this.status = 307), s;
  }
};
async function te(t, e, s, r) {
  let i = new S(e.routes, s, t, r, e.wildcard), a = await se(i);
  return Ie(t, a, s);
}
__name(te, "te");
__name2(te, "te");
async function se(t, e = "none", s = false) {
  return await t.run(e) === "error" || !s && t.status && t.status >= 400 ? se(t, "error", true) : { path: t.path, status: t.status, headers: t.headers, searchParams: t.searchParams, body: t.body };
}
__name(se, "se");
__name2(se, "se");
async function Ie(t, { path: e = "/404", status: s, headers: r, searchParams: i, body: a }, n) {
  let o = r.normal.get("location");
  if (o) {
    if (o !== r.middlewareLocation) {
      let h = [...i.keys()].length ? `?${i.toString()}` : "";
      r.normal.set("location", `${o ?? "/"}${h}`);
    }
    return new Response(null, { status: s, headers: r.normal });
  }
  let c;
  if (a !== void 0) c = new Response(a, { status: s });
  else if (P(e)) {
    let h = new URL(e);
    v(h.searchParams, i), c = await fetch(h, t.request);
  } else c = await N(n[e], t, { path: e, status: s, headers: r, searchParams: i });
  let l = r.normal;
  return y(l, c.headers), y(l, r.important), c = new Response(c.body, { ...c, status: s || c.status, headers: l }), c;
}
__name(Ie, "Ie");
__name2(Ie, "Ie");
u();
p();
d();
function re() {
  globalThis.__nextOnPagesRoutesIsolation ??= { _map: /* @__PURE__ */ new Map(), getProxyFor: Oe };
}
__name(re, "re");
__name2(re, "re");
function Oe(t) {
  let e = globalThis.__nextOnPagesRoutesIsolation._map.get(t);
  if (e) return e;
  let s = Ae();
  return globalThis.__nextOnPagesRoutesIsolation._map.set(t, s), s;
}
__name(Oe, "Oe");
__name2(Oe, "Oe");
function Ae() {
  let t = /* @__PURE__ */ new Map();
  return new Proxy(globalThis, { get: /* @__PURE__ */ __name2((e, s) => t.has(s) ? t.get(s) : Reflect.get(globalThis, s), "get"), set: /* @__PURE__ */ __name2((e, s, r) => Le.has(s) ? Reflect.set(globalThis, s, r) : (t.set(s, r), true), "set") });
}
__name(Ae, "Ae");
__name2(Ae, "Ae");
var Le = /* @__PURE__ */ new Set(["_nextOriginalFetch", "fetch", "__incrementalCache"]);
var De = Object.defineProperty;
var Ve = /* @__PURE__ */ __name2((...t) => {
  let e = t[0], s = t[1], r = "__import_unsupported";
  if (!(s === r && typeof e == "object" && e !== null && r in e)) return De(...t);
}, "Ve");
globalThis.Object.defineProperty = Ve;
globalThis.AbortController = class extends AbortController {
  constructor() {
    try {
      super();
    } catch (e) {
      if (e instanceof Error && e.message.includes("Disallowed operation called within global scope")) return { signal: { aborted: false, reason: null, onabort: /* @__PURE__ */ __name2(() => {
      }, "onabort"), throwIfAborted: /* @__PURE__ */ __name2(() => {
      }, "throwIfAborted") }, abort() {
      } };
      throw e;
    }
  }
};
var $s = { async fetch(t, e, s) {
  re(), W();
  let r = await __ALSes_PROMISE__;
  if (!r) {
    let n = new URL(t.url), o = await e.ASSETS.fetch(`${n.protocol}//${n.host}/cdn-cgi/errors/no-nodejs_compat.html`), c = o.ok ? o.body : "Error: Could not access built-in Node.js modules. Please make sure that your Cloudflare Pages project has the 'nodejs_compat' compatibility flag set.";
    return new Response(c, { status: 503 });
  }
  let { envAsyncLocalStorage: i, requestContextAsyncLocalStorage: a } = r;
  return i.run({ ...e, NODE_ENV: "production", SUSPENSE_CACHE_URL: R }, async () => a.run({ env: e, ctx: s, cf: t.cf }, async () => {
    if (new URL(t.url).pathname.startsWith("/_next/image")) return B(t, { buildOutput: m, assetsFetcher: e.ASSETS, imagesConfig: f.images });
    let o = F(t);
    return te({ request: o, ctx: s, assetsFetcher: e.ASSETS }, f, m, x);
  }));
} };

// node_modules/wrangler/templates/pages-dev-util.ts
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-j3OEIP/jnw3p38gjt.js
var define_ROUTES_default = { version: 1, description: "Built with @cloudflare/next-on-pages@1.13.16.", include: ["/*"], exclude: ["/_next/static/*"] };
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = $s;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-8yZqyP/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_dev_pipeline_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-8yZqyP/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=jnw3p38gjt.js.map
