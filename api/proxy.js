import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { summary, description = '', year, month, day, hour, minute, duration } = req.body;

  // Validation with explicit type checking
  if (
    typeof summary !== 'string' || !summary.trim() ||
    Number.isNaN(Number(year)) ||
    Number.isNaN(Number(month)) ||
    Number.isNaN(Number(day)) ||
    Number.isNaN(Number(hour)) ||
    Number.isNaN(Number(minute)) ||
    Number.isNaN(Number(duration))
  ) {
    res.status(400).send('Missing or invalid parameters.');
    return;
  }

  // Convert all fields to numbers safely
  const startDate = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) + 7,  // timezone offset adjustment
    Number(minute)
  ));

  const endDate = new Date(startDate.getTime() + Number(duration) * 60000);

  const payload = {
    summary: summary.trim(),
    description: description.trim(),
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
