import React, { useEffect, useState, useRef } from 'react';
// import { store } from 'react-notifications-component';
import { Button, Container, Grid } from 'semantic-ui-react';
import Peer from "simple-peer";
import { sckt } from '../../Socket';
import Video from './ChatVideo/ChatVideo';
import './VideoChat.scss';


const videoConstraints = {
    height: window.innerHeight / 8,
    width: window.innerWidth / 8
};

const VideoChat = ({currUser, updateCurrUser, room, history, users}) => {

    const [peers, setPeers] = useState(users);
    const userVideo = useRef();
    const peersRef = useRef([]);

    useEffect(()=> {
        sckt.socket.on("startvideochat", chatRequest);
        return () => {
            sckt.socket.off('startvideochat', chatRequest);
        };
    })


    
    function chatRequest() {
            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
                userVideo.current.srcObject = stream;
                const peers = [];
                console.log(`inside videochat component, the roomname is ${room}`)
                    if(users !== null) {
                        users.forEach(user => {
                            const peer = createPeer(user.id, user.room,stream)
                            peersRef.current.push({
                                peerID: user.id,
                                peer,
                            })
                            peers.push({
                                peerID: user.id,
                                peer
                            });
                        });

                        setPeers(peers);

                        sckt.socket.on("user joined", payload => {
                            console.log("user has joined the video chat")
                            const peer = addPeer(payload.signal, payload.callerID, stream);
                            peersRef.current.push({
                                peerID: payload.callerID,
                                peer,
                            })

                            const peerObj = {
                                peer,
                                peerID: payload.callerID,
                            }
            
                            setPeers(users => [...users, peerObj]);
                        });

                        sckt.socket.on("receiving returned signal", payload => {
                            const item = peersRef.current.find(p => p.peerID === payload.id);
                            item.peer.signal(payload.signal);
                        });

                        sckt.socket.on("user left", id => {
                            const peerObj = peersRef.current.find(p => p.peerID === id);
                            if(peerObj){
                                peerObj.peer.destroy()
                            }

                            const peers = peersRef.current.filter(p => p.peerID !== id);
                            peersRef.current = peers;
                            setPeers(peers)
                        })


                    } else {
                        console.log("dont proceed with call")
                    } 
            });
    }


    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            sckt.socket.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function stopBothVideoAndAudio() {
        userVideo.current.srcObject.getTracks().forEach(function(track) {
            if (track.readyState === 'live') {
                track.stop();
            }
        });
    }


    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            console.log("inside add peer")
            sckt.socket.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
       <Container>
           {
               <Container>
                        <video muted autoPlay playsInline ref={userVideo} />
                    <Grid>
                    {peers.map((peer) => {
                return (
                    <Grid.Column key={peer.peerID}>
                        <Video peer={peer.peer} />
                    </Grid.Column>
                )
                
            })}
            </Grid>
                    <Button fluid onClick={() => stopBothVideoAndAudio()}>End Chat</Button>
                </Container>
            }
       </Container>
    )
};

export default VideoChat;
