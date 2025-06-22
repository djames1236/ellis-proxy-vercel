import fetch from 'node-fetch';

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
    body = JSON.parse(rawBody);
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
