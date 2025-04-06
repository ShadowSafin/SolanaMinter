
import { Buffer } from 'buffer';

// Fix for Buffer not being available in browser
window.Buffer = window.Buffer || Buffer;

// Fix for process not being available in browser
// Use a proper typing to avoid TypeScript errors
if (!(window as any).process) {
  (window as any).process = {
    env: { NODE_ENV: 'production' },
    version: '',
    argv: [],
    stdout: { write: () => {} },
    stderr: { write: () => {} },
    stdin: null,
    nextTick: (cb: Function) => setTimeout(cb, 0),
    on: () => {},
    once: () => {},
    off: () => {},
    emit: () => {},
    browser: true
  };
}

// Add stream polyfill if needed
if (!(window as any).stream) {
  (window as any).stream = {
    Readable: class {
      pipe() { return this; }
      on() { return this; }
      once() { return this; }
    },
    Writable: class {
      write() { return true; }
      end() {}
      on() { return this; }
    },
    PassThrough: class {
      pipe() { return this; }
      write() { return true; }
      end() {}
      on() { return this; }
    },
    Duplex: class {
      pipe() { return this; }
      write() { return true; }
      end() {}
      on() { return this; }
    }
  };
}

// Add crypto polyfill for older browsers
if (!(window as any).crypto) {
  (window as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
}

// Add url polyfill
if (!(window as any).url) {
  (window as any).url = {
    URL: window.URL,
    parse: () => ({}),
    format: () => ''
  };
}

// Add fs polyfill (empty implementation)
if (!(window as any).fs) {
  (window as any).fs = {
    readFileSync: () => '',
    writeFileSync: () => {},
    promises: {
      readFile: async () => '',
      writeFile: async () => {}
    }
  };
}

// Add path polyfill
if (!(window as any).path) {
  (window as any).path = {
    join: (...args: string[]) => args.join('/'),
    resolve: (...args: string[]) => args.join('/'),
    dirname: (path: string) => path.split('/').slice(0, -1).join('/'),
    basename: (path: string) => path.split('/').pop() || '',
    extname: (path: string) => {
      const parts = path.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    }
  };
}

// Add os polyfill
if (!(window as any).os) {
  (window as any).os = {
    platform: () => 'browser',
    arch: () => 'browser',
    cpus: () => []
  };
}
