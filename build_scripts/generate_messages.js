const path = require('path');
const pbjs = require('protobufjs/cli/pbjs');
const pbts = require('protobufjs/cli/pbts');

const rootDir = path.resolve(__dirname, '..');

const messagesSourceDir = path.join(rootDir, 'src/shared/proto');
const messagesOutputDir = path.join(rootDir, 'src/shared');

const messagesFileJs = path.join(messagesOutputDir, 'messages.js');
const messagesFileTs = path.join(messagesOutputDir, 'messages.d.ts');

const argsJs = [
  '--target',
  'static-module',
  '--wrap',
  'commonjs',
  '--out',
  messagesFileJs,
  '--path',
  messagesSourceDir,
  `${messagesSourceDir}/**/*.proto`,
];

const argsTs = [messagesFileJs, '--out', messagesFileTs, '--name'];

pbjs.main(argsJs, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Generated JS: ${messagesFileJs}`);

    pbts.main(argsTs, err => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Generated TS: ${messagesFileTs}`);
      }
    });
  }
});
