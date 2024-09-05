import type { APIContext, MiddlewareNext } from "astro";
import { defineMiddleware } from "astro:middleware";
import Tokens from 'csrf';
import {promisify} from 'node:util';

export const onRequest = defineMiddleware(async (context: APIContext, next: MiddlewareNext) => {

    const sessionCookie = context.cookies.get('SESSION')?.value;
    console.log("Session cookie: ", sessionCookie);
    if(sessionCookie){
        console.log("Session cookie exists");
        
            // Verify JWT
    
            // If JWT is valid
    
                // Add csrf SECRET to locals. This way the form component can check if the csrf
                // of the form is valid.
    
            // Else, JWT is invalid
    
            // Reject the request
    }else{
        console.log("Session cookie does not exists");    
            // Create csrf token from csrf lib
            const tokens = new Tokens();
            const createSecret = () => promisify(tokens.secret.bind(tokens))();
            const csrfSecret = await createSecret();            
            const csrfToken = tokens.create(csrfSecret);
    
            // Add csrfSecret to the JWT, so that the secret can be recovered in the next request.
            // Add csrf token to locals, so that the form components can render with the csrf token.
    
            // Create a signed JWT with the csrf token and expiration date.
    
            // Store cookies to the response  
        
    }

    console.log("Middleware ran");
    const token = Math.random().toString(36).substring(2, 15);
    context.locals.astro_session_session = {
        csrfToken: token
    };
    
    return next();

});