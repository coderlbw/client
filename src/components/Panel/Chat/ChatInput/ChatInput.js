import React from 'react';
import { Icon, Input } from 'semantic-ui-react';
import { sckt } from '../../../Socket';
import './ChatInput.scss';

const ChatInput = React.memo(({ message, setMessage, sendMessage }) => {

   


    const handleInputChange = event => {
        let msg = event.target.value;
        setMessage(msg);
        let send = document.getElementById('sendIcon');
        if (msg.trim().length > 0) {
            send.classList.add('readyToPress');
        } else {
            send.classList.remove('readyToPress');
        }
    }

    const handleInputSend = (event) => {
        sendMessage(event);
        let send = document.getElementById('sendIcon');
        send.classList.remove('readyToPress');
    }

    const handleVideo = (event) => {
        console.log("starting video call....")
        sckt.socket.emit("videochat");
    }

    return (
        <div>
            <Icon id='videoIcon' size={"large"}  color="blue" bordered={true} circular={true} name='video' onClick={e => handleVideo(e)} />
            <Input
                fluid
                size='large'
                className='chatInput'
                icon
                placeholder='Type a message...'
                value={message}
                onChange={e => handleInputChange(e)}
                onKeyPress={e => e.key === 'Enter' ? handleInputSend(e) : null}
            >
                <input />
                <Icon id='sendIcon' name='send' onClick={e => handleInputSend(e)} />
            </Input>
        </div>
    )
});

export default ChatInput;