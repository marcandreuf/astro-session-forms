import type { APIContext, MiddlewareNext } from "astro";
import { defineMiddleware } from "astro:middleware";
import Tokens from "csrf";
import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

export type SessionSettings = {
  csrf: {
    token: string;
    secret: string;
  };
  session: {
    cookieName: string;
    cookieOptions: {
      httpOnly: boolean;
      sameSite: boolean | "lax" | "strict" | "none";
      maxAge: number;
      path: string;
    };
  };
  signSecret: string;
};

const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  csrf: {
    token: "csrf-token",
    secret: "csrf-secret",
  },
  session: {
    cookieName: "session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 1,
      path: "/",
    },
  },
  signSecret: uuid(),
};

function loadSettings(userSettings: any) {
  return {
    ...DEFAULT_SESSION_SETTINGS,
    ...userSettings,
  };
}

export const onRequest = defineMiddleware(
  async ({ locals, request, cookies }: APIContext, next: MiddlewareNext) => {
    const tokens = new Tokens();
    const createSecret = () => promisify(tokens.secret.bind(tokens))();

    console.log("Middleware ran");

    const settings: SessionSettings = loadSettings({
      signSecret: "safe key to sign the session token",
    });

    const sessionCookie = cookies.get(settings.session.cookieName)?.value;
    console.log("Session cookie: ", sessionCookie);

    if (sessionCookie) {
      console.log("Session cookie exists");

      // Verify JWT
      try {
        // If JWT is valid
        const sessionData: any = jwt.verify(sessionCookie, settings.signSecret);
        console.log("Session data: ", sessionData);

        // If request has formData, check if the csrf token is valid
        if (request.method === "POST") {
          let formData = null;
          try {
            formData = await request.clone().formData();
            //formData = await request.formData();
            console.log("Request has formData");
          } catch (error) {
            console.log("Request does not have formData");
          }
          if (formData != null) {
            if (formData.has("csrfToken")) {
              console.log("Request has csrfToken");
              const csrfToken = formData.get("csrfToken")?.toString() || "";
              const requestValid = tokens.verify(
                sessionData.csrfSecret,
                csrfToken
              );
              console.log("CSRF token is valid: ", requestValid);
              
              if (!requestValid) {
                console.log("CSRF token is invalid");
                cookies.delete(
                  settings.session.cookieName,
                  settings.session.cookieOptions
                );
                return new Response("CSRF token is invalid", {
                  status: 403,
                });
              }
            }
          }
        }

        // Add csrf SECRET to locals. This way the form component can check if the csrf of the form is valid.
        const csrfToken = tokens.create(sessionData.csrfSecret);
        console.log("CSRF new token: ", csrfToken);

        locals.astroSession = {
          csrfToken: csrfToken,
          csrfSecret: sessionData.csrfSecret,
        };
      } catch (error: any) {
        // Else, JWT is invalid
        console.log("Error verifying JWT: ", error);

        cookies.delete(
          settings.session.cookieName,
          settings.session.cookieOptions
        );
        // Reject the request
        const errResponse = new Response(
          `Invalid session cookie: ${error?.message}`,
          { status: 500 }
        );
        if (!(errResponse instanceof Response)) {
          throw new Error(
            "ThrowOverrideResponse.response must be a Response instance"
          );
        }
        return errResponse;
      }
    } else {
      console.log("Session cookie does not exists");
      // Create csrf token from csrf lib
      const csrfSecret = await createSecret();
      console.log("CSRF secret: ", csrfSecret);

      const csrfToken = tokens.create(csrfSecret);
      console.log("CSRF token: ", csrfToken);

      // // Add csrf token to locals, so that the form components can render with the csrf token.
      locals.astroSession = {
        csrfToken: csrfToken,
        csrfSecret: csrfSecret,
      };

      // Create a signed JWT with the csrf secret and expiration date.
      // Add csrfSecret to the JWT, so that the secret can be recovered in the next request.
      const jwtToken = jwt.sign(
        { csrfSecret: csrfSecret },
        settings.signSecret,
        { expiresIn: settings.session.cookieOptions.maxAge }
      );

      // Store cookies to the response
      cookies.set(
        settings.session.cookieName,
        jwtToken,
        settings.session.cookieOptions
      );

      // const stringifyCookie = cookie.serialize(
      //   settings.session.cookieName,
      //   jwtToken,
      //   settings.session.cookieOptions
      // );
      // const response = await next();
      // if (stringifyCookie) {
      //   console.log('Set response serialised session cookie.')
      //   response.headers.set("Set-Cookie", stringifyCookie);
      // }
      // return response;
    }

    // const token = Math.random().toString(36).substring(2, 15);
    // locals.astro_session = {
    //   csrfToken: token,
    // };

    return next();
  }
);
