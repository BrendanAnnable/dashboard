import sio from 'socket.io-client';

export class WebSocketProxyUDPClient {
  constructor(private socket: any) {
    this.socket.on('connect', this.onConnect);
    this.socket.on('reconnect_attempt', this.onReconnect);
    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('udp_packet', this.onPacket);
  }

  static of() {
    const uri = `${document.location!.origin}/dashboard`;
    return new WebSocketProxyUDPClient(
      sio(uri, {
        upgrade: false,
        transports: ['websocket'],
      } as any),
    );
  }

  connect() {
    this.socket.connect();
  }

  // Allow event handlers to be overridden (used for testing)
  setHandler(event: string, cb: (msg: string) => void) {
    this.socket.on(event, cb);
  }

  private onConnect = () => {};
  private onReconnect = () => {
    this.socket.io.opts.transports = ['polling', 'websocket'];
  };
  private onDisconnect = () => {};
  private onPacket = (msg: string) => {
    const parsed = JSON.parse(msg);
    console.log(
      `Client received message from ${parsed.rinfo.family}:${parsed.rinfo.address}:${parsed.rinfo.port}`,
    );
  };
}
