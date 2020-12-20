import io from 'socket.io-client';


const ENDPOINT = "http://192.168.1.100:8080"

function Socket() {
  this.socket = io(ENDPOINT);
};

const sckt = new Socket();

export { sckt };
