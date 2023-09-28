const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');
const cors = require('cors');
const job = require('./cron.js');

const PORT = process.env.PORT || 5000;

const app = jsonServer.create();
app.use(cors());
const router = jsonServer.router(path.join(__dirname, 'db.json'));

app.db = router.db;

// app.use((req, res, next) => {
//   setTimeout(next, 1000);
// });

app.use(jsonServer.bodyParser);

const rules = auth.rewriter({
  // Permission rules
  users: 660,
});

app.use(rules);

app.use((req, _, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now();
    req.body.updatedAt = Date.now();
  }

  next();
});

app.use((req, _, next) => {
  if (req.method === 'PATCH' || req.method === 'PUT') {
    req.body.updatedAt = Date.now();
  }

  next();
});

app.use(auth);

app.use(router);

function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();

job.job.start();
