const dgram = require('dgram');

const socket = dgram.createSocket({
  type: 'udp4',
  reuseAddr: true,
});

socket.bind(
  {
    address: '239.226.152.162',
    port: 9917,
  },
  () => {
    socket.send(
      Buffer.from(
        JSON.stringify({
          hello: 'world',
        }),
      ),
      9917,
      '239.226.152.162',
    );
  },
);
