export default async function handler(req, res) {
  // ✅ Allowed domains
  const allowedOrigins = [
    'https://www.sidelinerecruit.com',
    'https://sideline-recruitment.webflow.io'
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, JobId');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    const jobId = req.headers['jobid'];
    const contentType = req.headers['content-type'];

    if (!jobId) {
      return res.status(400).json({ error: 'Missing JobId in headers' });
    }

    const response = await fetch(
      `https://app.loxo.co/api/sideline-sports-recruitment/jobs/${jobId}/apply`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          authorization:
            'Basic 044752b79d7f9adeb61bd673556e13b65236cd536ca4246c370fa9b0efe3394393276f86db8e371fd97575c4c7e466dbd2bc88081419cb24a3845a73d1dcc1866447b6db18f1f4cdfb65f4e81cbbfb662bdff0c33521cccf13b4ee03149b642dc265ccb6c177381812b39d52fa99e35db17a34caa2b94d171d7b610fa793fc27',
          'Content-Type': contentType,
        },
        body: rawBody,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Loxo API Error:', errorText);
      throw new Error(`Failed to apply: ${errorText}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Call Failed:', error.message);
    return res.status(500).json({ error: error.message });
  }
}