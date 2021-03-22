export type NetworkSend = (packet: Buffer) => void;

export abstract class Simulator {
  constructor(protected readonly send: NetworkSend) {}

  abstract start(): () => void;
}
