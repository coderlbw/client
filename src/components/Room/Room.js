import React, { useEffect, useRef, useState } from "react";
import { Dimmer, Loader, Transition } from 'semantic-ui-react';
import { generateWords } from '../../utils/generateWords';
import { sckt } from '../Socket';
import './Room.scss';

const Room = ({ location, history, match }) => {

    const playerRef = useRef(null);
    const [currUser, setCurrUser] = useState({
        id: '',
        name: JSON.parse(localStorage.getItem('name')),
        colors: JSON.parse(localStorage.getItem('colors'))
    });
    const [room, setRoom] = useState('');
    const [videoProps, setVideoProps] = useState({
        queue: [],
        history: [],
        playing: true,
        seekTime: 0,
        receiving: false,
        initVideo: false,
        videoType: 'yt' // 'vimeo', 'twitch', 'soundcloud'
    });
    const [users, setUsers] = useState([]);
    const [isJoined, setIsJoined] = useState(false);

    useEffect(() => {
        localStorage.setItem('name', JSON.stringify(currUser.name));
    }, [currUser.name])
    useEffect(() => {
        localStorage.setItem('colors', JSON.stringify(currUser.colors));
    }, [currUser.colors])

    useEffect(() => {
        const handler = ({ users }) => setUsers(users);
        sckt.socket.on("roomData", handler);
        return () => sckt.socket.off('roomData', handler);
    }, []);

    return (
        <div className="outerContainer">
            <h1>player should be placed here</h1>
        </div>
    )
}

export default Room;