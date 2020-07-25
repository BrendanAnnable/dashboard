import dgram = require('dgram');

import { WebSocketProxyUDPClient } from '../network';

describe('WebSocketProxyUDPClient', () => {
  describe('#onPacket', () => {
    it('Receives messages from address A', done => {
      function packetHandler(msg: string) {
        const parsed = JSON.parse(msg);
        expect(parsed.payload).toBe('test data a');
        done();
      }

      function errorHandler(error: Error | null) {
        done(error);
      }

      // Create UDP client so we can send messages to the UDP server
      const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      // Create the UDP client to ensure we have a connection between the browser and the server
      const network = WebSocketProxyUDPClient.of();

      // Overwrite the udp_packet handler
      network.setHandler('udp_packet', packetHandler);

      // Connect to the network
      network.connect();

      // Create a message to send
      const message = Buffer.from('test data a');

      client.send(message, 41234, '239.226.152.162', errorHandler);
    });

    it('Receives messages from address B', done => {
      function packetHandler(msg: string) {
        const parsed = JSON.parse(msg);
        expect(parsed.payload).toBe('test data b');
        done();
      }

      function errorHandler(error: Error | null) {
        done(error);
      }

      // Create UDP client so we can send messages to the UDP server
      const client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

      // Create the UDP client to ensure we have a connection between the browser and the server
      const network = WebSocketProxyUDPClient.of();

      // Overwrite the udp_packet handler
      network.setHandler('udp_packet', packetHandler);

      // Connect to the network
      network.connect();

      // Create a message to send
      const message = Buffer.from('test data b');

      client.send(message, 41234, '239.226.152.163', errorHandler);
    });
  });
});
