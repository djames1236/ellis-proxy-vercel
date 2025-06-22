export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  let rawBody = '';
  for await (const chunk of req) {
    rawBody += chunk;
  }

  let body;
  try {
    body = JSON.parse(rawBody.trim());  // <<< THIS IS THE FIX 🔑
  } catch (err) {
    console.error('Invalid JSON:', err);
    res.status(400).send('Invalid JSON');
    return;
  }

  const { summary, description = '', year, month, day, hour, minute, duration } = body;

  if (!summary || !year || !month || !day || !hour || !minute || !duration) {
    res.status(400).send('Missing required parameters.');
    return;
  }

  const startDate = new Date(Date.UTC(year, month - 1, day, hour + 7, minute));
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const payload = {
    summary,
    description,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };

  console.log('Forwarding payload to scheduler:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://v0-new-project-iirjbfvrvmv.vercel.app/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log('Scheduler Response:', text);
    res.status(response.status).send(text);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Failed to forward request');
  }
}
