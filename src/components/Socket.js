import io from 'socket.io-client';


const ENDPOINT = "https://movipartyapi.herokuapp.com"


function Socket() {
  this.socket = io(ENDPOINT);
};

const sckt = new Socket();

export { sckt };
