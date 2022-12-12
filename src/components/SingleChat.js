import { FormControl } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast, Image } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "lottie-react";
import animationData from "../animations/typing.json";
import {
  AiFillAudio,
  AiOutlinePaperClip,
  AiOutlineSend,
  AiOutlinePauseCircle,
} from "react-icons/ai";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../context/chatProvider";
import vmsg from "vmsg";
import Timer from "./miscellaneous/Timer";

const ENDPOINT = "http://localhost:5000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;
const recorder = new vmsg.Recorder({
  wasmURL: "https://unpkg.com/vmsg@0.3.0/vmsg.wasm",
});

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [files, setFiles] = useState([]);
  const [imgLoading, setImgLoading] = useState(null);
  const [isRecording, setisRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState();
  const [index, setIndex] = useState(0);
  const [showAudioClip, setshowAudioClip] = useState(false);

  const toast = useToast();

  const record = async () => {
    if (isRecording) {
      let blob = await recorder.stopRecording();
      setVoiceNote(new File([blob], "ran.mpeg", { type: blob.type }));
      setisRecording(false);
    } else {
      try {
        await recorder.initAudio();
        await recorder.initWorker();
        recorder.startRecording();
        setisRecording(true);
        setshowAudioClip(true)
      } catch (e) {
        console.error(e);
      }
    }
  };
  useEffect(() => {
    if (voiceNote !== undefined)
    {
      handleFileInput(voiceNote)
    }
  },[voiceNote])

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        setNewMessage("");
        let file = files;
        const data2 = new FormData();

        data2.append("file", file);
        data2.append("content", newMessage);
        data2.append("chatId", selectedChat?._id);

        const config = {
          headers: {
            "Content-type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post("/api/message", data2, config);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleFileInput = (e) => {
    setImgLoading(true);
    setNewMessage("");
    if (e === undefined) return;

    if (
      e.type === "image/jpeg" ||
      e.type === "image/png" ||
      e.type === "application/pdf" ||
      e.type === "video/mp4" ||
      e.type === "audio/mp3" ||
      e.type === "audio/mpeg"
    ) {
      const data = new FormData();
      data.append("file", e);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dugdmyq5b");
      fetch("https://api.cloudinary.com/v1_1/dugdmyq5b/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setNewMessage(
            e.type === "application/pdf" || e.type === "video/mp4"
              ? e?.name
              : data.url.toString()
          );
          setFiles(e);
          setImgLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setImgLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setImgLoading(false);
      return;
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={[...messages].reverse()} />
              </div>
            )}
            <FormControl
              onKeyDown={(e) => e.key === 'Enter' && sendMessage}
              id="first-name"
              isRequired
              mt={3}
              justifyContent="space-between"
              flexDirection="row"
              w={"100%"}
              bg="#d2d6d3"
              borderWidth={1}
              borderRadius={10}
            >
              {istyping ? (
                <div>
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    style={{
                      marginBottom: 5,
                      marginLeft: 5,
                      height: 40,
                      width: 40,
                    }}
                  />
                </div>
              ) : (
                <></>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#E8E8E8",
                }}
              >
                {showAudioClip ? (
                  <InputGroup bg="white" borderRadius={15} height={"40px"}>
                    <Timer index={index} setIndex={setIndex} click={isRecording} />
                  </InputGroup>
                ) : (
                  <InputGroup height={"4 0px"} bg="white" borderRadius={15}>
                    <Input
                      variant="filled"
                      placeholder="Enter a message.."
                      value={newMessage}
                      onChange={typingHandler}
                      w={"91%"}
                      bg="white"
                
                    />
                    <InputRightElement
                      bg="white"
                      borderRadius={15}
                      
                      children={
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            marginRight: 3,
                            alignItems: "center",
                          }}
                        >
                          <label
                            style={{
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="file"
                              onChange={(e) => {
                                handleFileInput(e.target.files[0]);
                                setFiles(e.target.files[0]);
                              }}
                              style={{
                                visibility: "hidden",
                                width: 0,
                                height: 0,
                              }}
                            />
                            <AiOutlinePaperClip
                              size={"30px"}
                              onClick={handleFileInput}
                            />
                          </label>
                        </div>
                      }
                    />
                  </InputGroup>
                )}
                {isRecording ? (
                  <AiOutlinePauseCircle
                    size={"30px"}
                    onClick={record}
                    style={{ cursor: "pointer", marginLeft: 5 }}
                  />
                ) : (
                  <AiFillAudio
                    onClick={record}
                    size={"30px"}
                    style={{
                      cursor: "pointer",
                      marginLeft: 10,
                      padding: 2,
                    }}
                  />
                )}
                <AiOutlineSend
                  size={"30px"}
                  style={{
                    cursor: "pointer",
                    marginLeft: 5,
                  }}
                  onClick={() => {
                    sendMessage()
                    setshowAudioClip(false)
                    setIndex(0)
                  }}
                />
              </div>
              {imgLoading ? (
                <div style={{ width: "100%", paddingTop: 20 }}>
                  <Spinner display="flex" textAlign="center" m="auto" />
                </div>
              ) : (
                (newMessage.endsWith("jpg") || newMessage.endsWith("png")) && (
                  <Image
                    objectFit="cover"
                    src={
                      newMessage.endsWith("jpg") || newMessage.endsWith("png")
                        ? newMessage
                        : undefined
                    }
                    // alt='Dan Abramov'
                    htmlHeight={50}
                    htmlWidth={50}
                    m="auto"
                  />
                )
              )}
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
