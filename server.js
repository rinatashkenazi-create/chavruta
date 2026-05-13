const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, '.data', 'db.json');

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { cases: [], enrichments: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch(e) { return { cases: [], enrichments: [] }; }
}

function writeData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/data', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(readData());
});

app.post('/api/add', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const data = readData();
  const item = { ...req.body, submitted: new Date().toISOString(), id: Date.now().toString() };
  if (item.type === 'enrichment') data.enrichments.push(item);
  else data.cases.push(item);
  writeData(data);
  res.json({ ok: true });
});

app.post('/api/update', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const data = readData();
  const { id, type, ...fields } = req.body;
  const arr = type === 'enrichment' ? data.enrichments : data.cases;
  const idx = arr.findIndex(i => i.id === id);
  if (idx >= 0) Object.assign(arr[idx], fields);
  writeData(data);
  res.json({ ok: true });
});

app.post('/api/delete', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const data = readData();
  const { id, type } = req.body;
  if (type === 'enrichment') data.enrichments = data.enrichments.filter(i => i.id !== id);
  else data.cases = data.cases.filter(i => i.id !== id);
  writeData(data);
  res.json({ ok: true });
});

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
