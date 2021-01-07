import io from 'socket.io-client';


const ENDPOINT = "http://localhost:8080"


function Socket() {
  this.socket = io(ENDPOINT);
};

const sckt = new Socket();

export { sckt };
