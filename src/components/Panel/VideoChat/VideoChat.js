import React, { useEffect, useState, useRef } from 'react';
import { store } from 'react-notifications-component';
import { Button, Input, Container, Message } from 'semantic-ui-react';
import Peer from "simple-peer";
import { sckt } from '../../Socket';
import './VideoChat.scss';
import styled from "styled-components";

const videoConstraints = {
    height: window.innerHeight / 8,
    width: window.innerWidth / 8
};


const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}


const VideoChat = ({currUser, updateCurrUser, room, history, users}) => {

    const [peers, setPeers] = useState(users);
    const [StartChat, setStartChat] = useState(false);
    console.log(`the users are ${JSON.stringify(users)} in room ${room}`)

    const userVideo = useRef();
    const peersRef = useRef([]);
    
    function chatRequest() {

            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
                setStartChat((chat) => !chat)
                userVideo.current.srcObject = stream;
                const peers = [];
                sckt.socket.emit('videocall', {room}, (exists) => {
                    if(exists) {
                        users.forEach(user => {
                            const peer = createPeer(user.id, user.room,stream)
                            peersRef.current.push({
                                peerID: user.id,
                                peer,
                            })
                            peers.push(peer);
                        });
                        setPeers(peers);

                        sckt.socket.on("user joined", payload => {
                            console.log("user has joined the video chat")
                            const peer = addPeer(payload.signal, payload.callerID, stream);
                            peersRef.current.push({
                                peerID: payload.callerID,
                                peer,
                            })
            
                            setPeers(users => [...users, peer]);
                        });

                        sckt.socket.on("receiving returned signal", payload => {
                            const item = peersRef.current.find(p => p.peerID === payload.id);
                            console.log("item is************")
                            console.log(item)
                            item.peer.signal(payload.signal);
                        });


                    } else {
                        console.log("dont proceed with call")
                    }
                })  
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
               !StartChat?   (<Message>
               <Message.Header>Video Call</Message.Header>
               <p>
                 We updated our privacy policy here to better service our customers. We
                 recommend reviewing the changes.
               </p>
               <Button fluid onClick={() => chatRequest()}>Start Chat</Button>
             </Message>) : (
                 <Container>
                    <video muted autoPlay playsInline ref={userVideo} className="myVideo"/>
                    {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
                    <Button fluid onClick={() => setStartChat(chat => !chat)}>End Chat</Button>
                </Container>)
           }
       </Container>
    )
};

export default VideoChat;
