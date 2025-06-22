import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ellis 3.8.0 Proxy is alive ✅');
});

app.post('/proxy', async (req, res) => {
  const { summary, description = '', year, month, day, hour, minute, duration } = req.body;

  if (!summary || !year || !month || !day || !hour || !minute || !duration) {
    return res.status(400).send('Missing required parameters.');
  }

  const startDate = new Date(Date.UTC(year, month - 1, day, hour + 7, minute));
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const payload = {
    summary,
    description,
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };

  console.log('Forwarding payload to Vercel:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://v0-new-project-iirjbfvrvmv.vercel.app/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log('Vercel Response:', text);
    res.send({ status: response.status, response: text });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Failed to forward request');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ellis 3.8.0 Proxy running on port ${PORT}`);
});
