import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button, Image } from "@chakra-ui/react";
import { ChatState } from "../context/chatProvider";
import { BsFillFileEarmarkPdfFill, BsFillFileEarmarkMusicFill } from "react-icons/bs"

const   MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat?.chatName}
                </Text>
                {chat?.latestMessage && (
                  <Text fontSize="xs" display={'flex'} flexDirection='row'>
                    <b>{chat.latestMessage.sender.name } : </b>
                    {(chat.latestMessage.content.endsWith('png') || chat.latestMessage.content.endsWith('jpg')) ?
                      <Image
                        objectFit='cover'
                        alt="Photo"
                      />
                      :
                      <div style={{display:'flex', flexDirection:'row', alignItems:'center', marginLeft:2}} >
                        {
                          (chat.latestMessage.content.endsWith('pdf') &&
                            <BsFillFileEarmarkPdfFill />)
                        }
                        { ((chat.latestMessage.content.endsWith('mp3') || chat.latestMessage.content.endsWith('mp4') ) &&
                          <BsFillFileEarmarkMusicFill />)
                        }
                      <span style={{marginLeft:3}}>
                        {
                        chat.latestMessage.content.length > 40
                          ? chat.latestMessage.content.substring(0, 41) + "....." + chat.latestMessage.content.slice(-3)
                          : chat.latestMessage.content
                        }
                      </span>
                      </div>
                    }
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;