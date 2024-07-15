export const handler = async (event: any) => {

  // Extract the URL from the event
  const host = event.requestContext.domainName;
  const path = event.rawPath;
  const queryString = event.rawQueryString ? `?${event.rawQueryString}` : '';

  const url = `https://${host}${path}${queryString}`;

  // Log the URL
  console.log('Serving the OPTIONS lambda:', url);

  return {
    statusCode: 200,
    body: '',
  };
};
