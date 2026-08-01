import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

export type QueuedIntelligenceMessage = {
  readonly id: string;
  readonly event: IntelligenceEvent;
  readonly context: ServiceContext;
  readonly attempts: number;
  readonly enqueuedAt: string;
};

export type MessageProcessor = (message: QueuedIntelligenceMessage) => Promise<void>;

/** In-memory asynchronous message queue for intelligence events (Mission P-006). */
export class MessageQueue {
  private readonly queue: QueuedIntelligenceMessage[] = [];
  private processing = false;

  constructor(private processor: MessageProcessor) {}

  setProcessor(processor: MessageProcessor): void {
    this.processor = processor;
  }

  enqueue(message: QueuedIntelligenceMessage): void {
    this.queue.push(message);
    void this.processQueue();
  }

  getDepth(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue.length = 0;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const message = this.queue.shift();

      if (!message) {
        break;
      }

      await this.processor(message);
    }

    this.processing = false;
  }
}
