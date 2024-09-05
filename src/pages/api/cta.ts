import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({request})=>{
  const data = await request.formData();
  const csrfToken = data.get('csrfToken');
  const userName = data.get('username');
  console.log('React form to astro page data: ', csrfToken, userName);

  return new Response(
    JSON.stringify({
      message: "Success!"
    }),
    { status: 200 }
  );
}
