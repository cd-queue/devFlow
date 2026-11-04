import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createAuthServer,
  extractNeonAuthCookies,
  handleAuthProxyRequest,
  processAuthMiddleware,
  DEFAULT_AUTH_SKIP_ROUTES,
  validateCookieConfig,
  resolveNeonAuthLogging,
  type CookieOptions,
} from "@neondatabase/auth/server";

/**
 * Creates a Next.js-compatible RequestContext for Neon Auth.
 * 
 * Crucially catches errors when `cookieStore.set` is invoked inside a Server Component
 * (where Next.js prevents modifying cookies and throws "Cookies can only be modified in a Server Action or Route Handler").
 */
async function createSafeNextRequestContext() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return {
    getCookies() {
      return extractNeonAuthCookies(headerStore);
    },
    setCookie(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set(name, value, options);
      } catch {
        // Silently ignore in React Server Components where cookies are read-only.
        // In Server Actions and Route Handlers, cookieStore.set executes successfully.
      }
    },
    getHeader(name: string) {
      return headerStore.get(name) ?? null;
    },
    getOrigin() {
      return (
        headerStore.get("origin") ||
        headerStore.get("referer")?.split("/").slice(0, 3).join("/") ||
        ""
      );
    },
    getFramework() {
      return "nextjs";
    },
  };
}

const config = {
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
};

validateCookieConfig(config.cookies);
const log = resolveNeonAuthLogging();

const server = createAuthServer({
  baseUrl: config.baseUrl,
  context: createSafeNextRequestContext,
  cookieSecret: config.cookies.secret,
  log,
});

const handler = () => {
  const routeHandler = async (
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
  ) => {
    return handleAuthProxyRequest({
      request,
      path: (await params).path.join("/"),
      baseUrl: config.baseUrl,
      cookieSecret: config.cookies.secret,
      log,
    });
  };

  return {
    GET: routeHandler,
    POST: routeHandler,
    PUT: routeHandler,
    DELETE: routeHandler,
    PATCH: routeHandler,
  };
};

const middleware = (middlewareConfig?: { loginUrl?: string }) => {
  const loginUrl = middlewareConfig?.loginUrl ?? "/auth/sign-in";
  return async (request: NextRequest) => {
    const pathname = request.nextUrl.pathname;
    const result = await processAuthMiddleware({
      request,
      pathname,
      skipRoutes: DEFAULT_AUTH_SKIP_ROUTES,
      loginUrl,
      baseUrl: config.baseUrl,
      cookieSecret: config.cookies.secret,
      log,
    });

    switch (result.action) {
      case "allow": {
        const reqHeaders = new Headers(request.headers);
        if (result.headers) {
          for (const [key, value] of Object.entries(result.headers)) {
            reqHeaders.set(key, value);
          }
        }
        const response = NextResponse.next({
          request: { headers: reqHeaders },
        });
        if (result.cookies) {
          for (const cookie of result.cookies) {
            response.headers.append("Set-Cookie", cookie);
          }
        }
        return response;
      }
      case "redirect_oauth": {
        const oauthHeaders = new Headers();
        for (const cookie of result.cookies) {
          oauthHeaders.append("Set-Cookie", cookie);
        }
        return NextResponse.redirect(result.redirectUrl, {
          headers: oauthHeaders,
        });
      }
      case "redirect_login":
        if (result.cookies && result.cookies.length > 0) {
          const loginHeaders = new Headers();
          for (const cookie of result.cookies) {
            loginHeaders.append("Set-Cookie", cookie);
          }
          return NextResponse.redirect(result.redirectUrl, {
            headers: loginHeaders,
          });
        }
        return NextResponse.redirect(result.redirectUrl);
    }
  };
};

export const auth = Object.assign(server, {
  handler,
  middleware,
});
