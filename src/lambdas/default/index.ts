export const handler = async (event: any) => {

  // Extract the URL from the event
  const host = event.requestContext.domainName;
  const path = event.rawPath;
  const queryString = event.rawQueryString ? `?${event.rawQueryString}` : '';

  const url = `https://${host}${path}${queryString}`;

  // Log the URL
  console.log('Serving the default lambda because of an invalid request URL:', url);

  return {
    statusCode: 404,
    body: 'Not found',
  };
};
