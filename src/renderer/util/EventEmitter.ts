export const EventEmitter = {
    events: {} as Record<string, Function[]>,
  
    on(event: string, callback: Function) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(callback);
    },
  
    off(event: string, callback: Function) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    },
  
    emit(event: string, payload?: any) {
      if (this.events[event]) {
        this.events[event].forEach((callback) => callback(payload));
      }
    },
  };
  