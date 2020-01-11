import compression from 'compression';
import history from 'connect-history-api-fallback';
import express from 'express';
import http from 'http';
import favicon from 'serve-favicon';

const app = express();
const server = http.createServer(app);

const root = `${__dirname}/../../dist`;
app.use(
  history({
    rewrites: [
      // Allows user to navigate to /storybook/ without needing to type /index.html
      { from: /\/storybook\/$/, to: 'storybook/index.html' },
    ],
  }),
);
app.use(compression());
app.use(express.static(root));
app.use(favicon(`${__dirname}/../assets/favicon.ico`));

const port = process.env.PORT || 9090;
server.listen(port, () => {
  // tslint:disable-next-line no-console
  console.log(`Server started at http://localhost:${port}`);
});
