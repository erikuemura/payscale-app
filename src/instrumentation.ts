import type {Instrumentation} from 'next';
/** Never log request bodies, URLs, headers, customer data or exception messages. */
export const onRequestError:Instrumentation.onRequestError=(_error,_request,context)=>{
 console.error(JSON.stringify({event:'unhandled_server_error',reference:crypto.randomUUID(),routeType:context.routeType}));
};
