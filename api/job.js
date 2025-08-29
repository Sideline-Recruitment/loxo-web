export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // ✅ Define allowed origins
  const allowedOrigins = [
    'https://www.sidelinerecruit.com',
    'https://sideline-recruitment.webflow.io'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') return res.status(200).end();
  if (method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!id) return res.status(400).json({ error: 'Job ID is required' });

  try {
    console.log(`📦 Fetching job details for ID: ${id}`);

    const response = await fetch(`https://app.loxo.co/api/sideline-sports-recruitment/jobs/${id}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: 'Basic 044752b79d7f9adeb61bd673556e13b65236cd536ca4246c370fa9b0efe3394393276f86db8e371fd97575c4c7e466dbd2bc88081419cb24a3845a73d1dcc1866447b6db18f1f4cdfb65f4e81cbbfb662bdff0c33521cccf13b4ee03149b642dc265ccb6c177381812b39d52fa99e35db17a34caa2b94d171d7b610fa793fc27',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(`❌ Loxo fetch error: ${response.status} ${text}`);
      return res.status(response.status).json({ error: `Loxo error: ${text}` });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error('❌ Failed to parse Loxo response as JSON:', parseErr.message);
      return res.status(500).json({ error: 'Invalid JSON from Loxo API' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Unhandled server error in /api/job:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}