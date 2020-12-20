import React, { useEffect, useState, useRef } from "react";
import { store } from 'react-notifications-component';
import invert from 'invert-color';
import { getRandomColor } from '../../utils/userInfo';
import { Dimmer, Loader, Transition } from 'semantic-ui-react';
import { generateWords } from '../../utils/generateWords';
import Panel from "../Panel/Panel";
import Video from '../Video/Video';
import { sckt } from '../Socket';
import './Room.scss';
import { getVideoType } from '../../utils/video';

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
    const updateCurrUser = (paramsToChange) => {
        setCurrUser((prev) => ({ ...prev, ...paramsToChange }));
    }
    const updateVideoProps = (paramsToChange) => {
        setVideoProps((prev) => ({ ...prev, ...paramsToChange }));
    }
    const sendVideoState = ({ eventName, eventParams }) => {
        let params = {
            name: currUser.name,
            room: room,
            eventName: eventName,
            eventParams: eventParams
        };
        sckt.socket.emit('sendVideoState', params, (error) => { });
    };

    // Video.js
    const loadVideo = (searchItem, sync) => {
        const { playing, seekTime, initVideo } = videoProps;
        if ((playerRef.current !== null || !initVideo) && searchItem) {
            if (!initVideo) updateVideoProps({ initVideo: true });
            let videoUrl = searchItem.video.url;
            if (sync) {
                updateVideoProps({ url: videoUrl });
                updateVideoProps({ playing });
                updateVideoProps({ receiving: false });
                playerRef.current.seekTo(seekTime, 'seconds');
            } else {
                updateVideoProps({ url: videoUrl });
                updateVideoProps({ playing: true });
                updateVideoProps({ receiving: false });
            }
            // sckt.socket.emit('updateRoomData', { video: searchItem }, (error) => { });
        }
    }
    const playVideoFromSearch = (searchItem) => {
        const url = searchItem.video.url;
        const videoType = getVideoType(url);
        if (videoType !== null) {
            updateVideoProps({ videoType });
        }
        // Handle playing video immediately
        const { history } = videoProps;
        loadVideo(searchItem, false);
        sendVideoState({
            eventName: "syncLoad",
            eventParams: { searchItem, history: [searchItem, ...history] }
        });
        updateVideoProps({ history: [searchItem, ...history] });
    }
    const log = (msg, type) => {
        let baseStyles = [
            "color: #fff",
            "background-color: #444",
            "padding: 2px 4px",
            "border-radius: 2px"
        ].join(';');
        let serverStyles = [
            "background-color: gray"
        ].join(';');
        let otherStyles = [
            "color: #eee",
            "background-color: red"
        ].join(';');
        let meStyles = [
            "background-color: green"
        ].join(';');
        // Set style based on input type
        let style = baseStyles + ';';
        switch (type) {
            case "server": style += serverStyles; break;
            case "other": style += otherStyles; break;
            case "me": style += meStyles; break;
            case "none": style = ''; break;
            default: break;
        }
        console.log(`%c${msg}`, style);
    }
    // From JoinRoom.js 
    useEffect(() => {
        const room = match.params.roomName.trim();
        if (room.length > 0) {
            sckt.socket.emit('checkRoomExists', { room }, (exists) => {
                // We set location.state in JoinRoom.js
                if (exists || location.state) {
                    setRoom(room);
                    let name = currUser.name;
                    if (!name) { // If no name in localStorage
                        name = generateWords({ delimiter: ' ', shouldCap: true })
                        updateCurrUser({ name });
                    }
                    let colors = currUser.colors;
                    // if (!colors) { // If no colors in localStorage
                    //     const bg = getRandomColor();
                    //     const txt = invertColor(bg);
                    //     colors = { bg, txt };
                    //     updateCurrUser({ colors });
                    // }
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
        // sckt.socket.emit('createRoom', { room }, () => {});
        // sckt.socket.on("roomData", ({ users }) => {
        //     setUsers(users);
        // });
    }, [location.pathname, history]);

    // useEffect(() => {
    //     console.log(videoProps.playing);
    // }, [videoProps.playing])

    return (
        <div className="outerContainer">
            <Transition visible={!isJoined} animation='fade' duration={500}>
                <Dimmer active={!isJoined}>
                    <Loader>Joining Room...</Loader>
                </Dimmer>
            </Transition>
            <Video
                log={log}
                currUser={currUser}
                room={room}
                videoProps={videoProps}
                updateVideoProps={updateVideoProps}
                playerRef={playerRef}
                sendVideoState={sendVideoState}
                loadVideo={loadVideo}
                playVideoFromSearch={playVideoFromSearch}
            />
            <Panel
                currUser={currUser}
                updateCurrUser={updateCurrUser}
                room={room}
                history={history}
                videoProps={videoProps}
                updateVideoProps={updateVideoProps}
                playerRef={playerRef}
                sendVideoState={sendVideoState}
                playVideoFromSearch={playVideoFromSearch}
                users={users}
                setUsers={setUsers}
            />
        </div>
    );
}

export default Room;