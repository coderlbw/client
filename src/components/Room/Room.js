import React, { useEffect, useState } from "react";
import { store } from 'react-notifications-component';
import invert from 'invert-color';
import { getRandomColor } from '../../utils/userInfo';
import { Dimmer, Loader, Transition } from 'semantic-ui-react';
import { generateWords } from '../../utils/generateWords';
import Panel from "../Panel/Panel";
import { sckt } from '../Socket';
import './Room.scss';

const Room = ({ location, history, match }) => {

    const [currUser, setCurrUser] = useState({
        id: '',
        name: JSON.parse(localStorage.getItem('name')),
        colors: JSON.parse(localStorage.getItem('colors'))
    });
    const [room, setRoom] = useState('');
    
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

    const updateCurrUser = (paramsToChange) => {
        setCurrUser((prev) => ({ ...prev, ...paramsToChange }));
    }
  


    useEffect(() => {
        const room = match.params.roomName.trim();
        if (room.length > 0) {
            sckt.socket.emit('checkRoomExists', { room }, (exists) => {
                if (exists || location.state) {
                    setRoom(room);
                    let name = currUser.name;
                    if (!name) { // If no name in localStorage
                        name = generateWords({ delimiter: ' ', shouldCap: true })
                        updateCurrUser({ name });
                    }
                    let colors = currUser.colors;
                    const bg = getRandomColor();
                    const txt = invert(bg);
                    colors = { bg, txt };
                    updateCurrUser({ colors });

                    sckt.socket.emit('join', { name, room, colors }, ({ id }) => {
                        updateCurrUser({ id });
                        setTimeout(() => {
                            setIsJoined(true);
                        }, 750);
                    });
                } else {
                    history.push('/');
                    store.addNotification({
                        title: "Oops!",
                        message: `It seems like the room "${room}" doesn't exist. Go ahead and create a new room!`,
                        type: "danger",
                        insert: "top",
                        container: "bottom-right",
                        animationIn: ["animated", "fadeInUp"],
                        animationOut: ["animated", "fadeOut"],
                        dismiss: {
                            duration: 5000,
                            onScreen: false
                        }
                    });
                }
            });
        }
    }, [location.pathname, history]);

    

    return (
        <div className="outerContainer">
             <Transition visible={!isJoined} animation='fade' duration={500}>
                <Dimmer active={!isJoined}>
                    <Loader>Joining Room...</Loader>
                </Dimmer>
            </Transition>
            <Panel
                currUser={currUser}
                updateCurrUser={updateCurrUser}
                room={room}
                history={history}
                users={users}
                setUsers={setUsers}
            />
        </div>
    )
}

export default Room;