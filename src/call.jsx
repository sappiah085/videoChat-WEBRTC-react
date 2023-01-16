import { useNavigate, useParams } from "react-router";
import "./style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDMZt40bCmmbU0SB-4O_6RWQ00bwrnU8Yg",
  authDomain: "realvideo-b04c4.firebaseapp.com",
  projectId: "realvideo-b04c4",
  storageBucket: "realvideo-b04c4.appspot.com",
  messagingSenderId: "972752084115",
  appId: "1:972752084115:web:15562f43f13ce92e808166",
  measurementId: "G-KM0WZWDRM9",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default function Call() {
  const params = useParams();
  const friend = useRef(null);
  const you = useRef(null);
  const mute = useRef(null);
  const pause = useRef(null);
  const hangup = useRef(null);
  const share = useRef(null);
  const naviagte = useNavigate();
  let server = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
  };
  let peerConnection = new RTCPeerConnection(server);

  const init = useCallback(async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
      },
      audio: true,
    });
    const remoteStream = new MediaStream();
    friend.current.srcObject = remoteStream;
    you.current.srcObject = localStream;
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
    peerConnection.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };
    let roomID = params.roomID;
    if (params.roomID == "create") {
      const docRef = await addDoc(collection(db, "calls"), {});
      roomID = docRef.id;
      peerConnection.onicecandidate = async (e) => {
        if (e.candidate) {
          await setDoc(doc(db, "calls", roomID), {
            offer: JSON.stringify(peerConnection.localDescription),
          });
        }
      };
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
    } else {
      await peerConnection.setRemoteDescription(
        JSON.parse((await getDoc(doc(db, "calls", roomID))).data().offer)
      );
      peerConnection.onicecandidate = async (e) => {
        if (e.candidate) {
          await setDoc(doc(db, "calls", roomID), {
            answer: JSON.stringify(peerConnection.localDescription),
          });
        }
      };
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
    }
    onSnapshot(doc(db, "calls", roomID), async (doc) => {
      if (doc.data().answer && !peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(
          JSON.parse(doc.data().answer)
        );
      }
    });

    const localstream = localStream;
    hangup.current.addEventListener("click", async () => {
      localstream.getTracks().forEach((track) => {
        track.stop();
      });
      peerConnection.close();
      naviagte("/");
    });

    pause.current.addEventListener("click", async (e) => {
      const track = localstream
        .getTracks()
        .find((track) => track.kind == "video");
      if (track.enabled) {
        track.enabled = false;
        pause.current.style.backgroundColor = "rgba(232, 154, 232, 0.567)";
      } else {
        track.enabled = true;
        pause.current.style.backgroundColor = "rgba(232, 154, 232,1)";
      }
    });
    mute.current.addEventListener("click", async () => {
      const track = localstream
        .getTracks()
        .find((track) => track.kind == "audio");
      if (track.enabled) {
        track.enabled = false;

        mute.current.style.backgroundColor = "rgb(209, 206, 206)";
      } else {
        track.enabled = true;
        mute.current.style.backgroundColor = "rgba(209, 206, 206, 0.35";
      }
    });

    peerConnection.oniceconnectionstatechange = function () {
      if (peerConnection.iceConnectionState == "disconnected") {
        naviagte("/");
      }
    };
    share.current.addEventListener("click", async (e) => {
      await navigator.clipboard.writeText(roomID);
      console.log("Copied id to clipboard share with friend");
    });
  });

  useEffect(() => {
    init();
  }, []);
  return (
    <>
      <video className="large" playsInline autoPlay id="you" ref={you}></video>
      <video
        className="small"
        playsInline
        autoPlay
        ref={friend}
        id="friend"
      ></video>
      <div id="controls">
        <button ref={pause} id="pause">
          <img src="/pause.png" alt="pause" />
        </button>
        <button ref={mute} id="mute">
          <img src="/mute.png" alt="mute" />
        </button>
        <button ref={hangup} id="hangup">
          <img src="/hangup.png" alt="hangup" />
        </button>
        <button ref={share} id="share">
          <img src="/share.png" alt="share" />
        </button>
      </div>
    </>
  );
}
