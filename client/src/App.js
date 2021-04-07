import { useEffect, useRef, useState } from 'react';
import './App.css';
import socketIOClient from 'socket.io-client'
import parser from 'html-react-parser'


const ServerEndPoint = "http://localhost:5001";

function App() {
	const [socketId , setSocketId] = useState(parseInt(Math.random() * 100000));
	const [mesgState , setMesgState] = useState(0);
	const [curMesg , setCurMesg] = useState("");
	const [socketObj , setSocketObj] = useState({});
	const [mesgList , setMesgList] = useState([]);
	const [connection , setConnection] = useState(false);
	const bottomRef = useRef()
	const scrollToBottom = () => {
        bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        });
    };

	const forceUpdate = useState()[1].bind(null, {})
	const configureSocket = async() => {
		var socket = await socketIOClient(ServerEndPoint);
		
		socket.on('response' , data => {
			var mesg = data.mesg;
			var mesgObj = {
				mesg : mesg,
				sender : 'BOT',
				time : Date.now() + 1
			}
			var mesgList1 = mesgList;
			mesgList1.push(mesgObj)
			setMesgList(mesgList1);
			scrollToBottom();	
			setTimeout(() => {
				forceUpdate();
			},1000);
		});

		socket.on("joined" , () => {			
			console.log("Connected!!");
			setConnection(true);
		})

		socket.emit('join');

		setSocketObj(socket)
	}

	const connect = async() => {
		await socketObj.emit('join' , {
			socketId : socketId
		})
	}

	useEffect(async() => {
		await configureSocket();
		
	} , [socketId]);
	

	const handleSendMesg = async() => {
		var mesgObj = {
			mesg : curMesg,
			sender : "USER",
			time : Date.now()
		}
		var mesgList1 = mesgList;
		mesgList1.push(mesgObj)

		setMesgList(mesgList1);
		setCurMesg("")
		forceUpdate()		
		scrollToBottom()

		if(isNaN(mesgObj.mesg) == true){
			await socketObj.emit('wrongmesg' , {
				mesg : mesgObj.mesg
			})
			return;
		}

		await socketObj.emit('mesg' , {
			socketId : socketId,
			mesg : curMesg , 
			mesgState : mesgState
		});
	}

	const mesgBoxJsx = mesgList.map(mesg => {
			if(mesg.sender == "BOT"){
				return (
					<div class="msg left-msg" key={mesg.time}>
						<div
						class="msg-img"
						style={{backgroundImage : "https://image.flaticon.com/icons/svg/327/327779.svg"}}
						></div>

						<div class="msg-bubble">
							<div class="msg-info">
								<div class="msg-info-name">{mesg.sender}</div>
								<div class="msg-info-time">12.11</div>
							</div>

						<div class="msg-text">
							{parser(mesg.mesg)}
						</div>
						</div>
					</div>
				)
			}else{
				return (
					<div class="msg right-msg" key={mesg.time}>
						<div
							class="msg-img"
							style={{backgroundImage : "https://image.flaticon.com/icons/svg/327/327779.svg"}}
						></div>

						<div class="msg-bubble">
							<div class="msg-info">
								<div class="msg-info-name">{mesg.sender}</div>
								<div class="msg-info-time">12.22</div>
							</div>

							<div class="msg-text">
								{mesg.mesg}
							</div>
						</div>
					</div>
				)
			}
		})
	
		
	return (
		<div className="chat-app">
			<section class="msger">
				<header class="msger-header">
					<div class="msger-header-title">
					<i class="fas fa-comment-alt"></i> SimpleChat
					</div>
					<div class="msger-header-options">
					<span><i class="fas fa-cog"></i></span>
					<span>Status : {connection == true ? <span>Connected</span> : <span>Disconnected</span>}</span>
					</div>
				</header>

				<main class="msger-chat">
					{mesgBoxJsx}
					<div ref={bottomRef} className="list-bottom"></div>
				</main>

				<div class="msger-inputarea">
					<input 
						type="text" 
						class="msger-input" 
						placeholder="Enter Your Response..." 
						value={curMesg} 
						onChange = {e => setCurMesg(e.target.value)} 
					></input>

					<button class="msger-send-btn" onClick = {handleSendMesg}>Send</button>
				</div>
			</section>
		</div>
	);
}

export default App;
