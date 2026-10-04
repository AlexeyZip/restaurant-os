import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthStore } from './auth.store';

export interface SocketConnection {
  socket: Socket;
  close: () => void;
}

@Injectable({ providedIn: 'root' })
export class SocketConnectionService {
  private readonly authStore = inject(AuthStore);

  connect(namespace: string): SocketConnection {
    const socket = io(namespace, {
      // Function form: socket.io calls it for every connection attempt, so
      // a reconnect always sends the *current* access token, not the one
      // captured when the page opened.
      auth: (send) => send({ token: this.authStore.accessToken() }),
    });

    let closed = false;
    let refreshedAfterDenial = false;

    socket.on('connect', () => {
      refreshedAfterDenial = false;
    });

    // When the server middleware rejects the handshake, socket.io does not
    // retry on its own. The usual cause is an expired 15-minute access
    // token, so refresh it once and try again; if that fails too, stop
    // instead of looping.
    socket.on('connect_error', async (error) => {
      if (error.message !== 'unauthorized' || refreshedAfterDenial) {
        return;
      }
      refreshedAfterDenial = true;
      await this.authStore.refreshToken();
      if (!closed) {
        socket.connect();
      }
    });

    return {
      socket,
      close: () => {
        closed = true;
        socket.disconnect();
      },
    };
  }
}
