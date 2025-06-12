const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

app.post('/scrape-sku', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('dafiti.com.br')) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let sku = '';
    $('section').each((i, elem) => {
      const text = $(elem).text();
      if (text.includes('SKU')) {
        const m = text.match(/SKU:\s*([A-Z0-9]+)/i);
        if (m) {
          sku = m[1];
          return false;
        }
      }
    });
    if (!sku) return res.status(404).json({ error: 'SKU no encontrado' });
    res.json({ sku });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error scraping' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));

