import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { Stack } from "@chakra-ui/layout";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../context/chatProvider";
import { Image, useToast } from "@chakra-ui/react";
import {DownloadIcon } from "@chakra-ui/icons"
import axios from "axios";
import FileSaver from 'file-saver';
import { useEffect, useState } from "react";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const toast = useToast();
  const [file, setFiles] = useState()
  
  useEffect(() => {
    const getFiles = async () => {
      await axios.get('/api/message/audioFiles', {
        responseType:'blob'
      })
        .then((blob) => {
        //  console.log(blob);
          setFiles(blob.data)
        })
    } 
   // getFiles()
  },[])
  const downloadFile = async (filename) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.get(
        `/api/message/downloadFile/${filename}`,
        {
          responseType: "blob"
        },
        config
      ).then(response => {
          FileSaver.saveAs(response.data, filename);
      })
    }
    catch(err) {
      toast({
        title: "Error Occured!",
        description: "Something went wrong try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }

  return (
    <Stack direction={'column-reverse'} overflowY='scroll'>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
            {(m?.content?.endsWith('jpg') || m.content.endsWith('png')) ?
              <Image
                bg={m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"}
                ml={isSameSenderMargin(messages, m, i, user._id)}
                mt={isSameUser(messages, m, i, user._id) ? 3 : 10}
                src={m.content}
                objectFit='cover'
                htmlHeight={75}
                htmlWidth={75}
              />
              :
              m.content.endsWith('mp3') ?
                (<div style={{
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                }}>
                  <audio src={m.content} controls />
                </div>)                               
              :
              (m?.content?.endsWith('pdf') || m.content.endsWith('docx')) ?
                <div
                style={{
                  backgroundColor: `${m.sender._id === user._id ? '#99d2f2' : "#B9F5D0"
                    }`,
                    marginLeft: isSameSenderMargin(messages, m, i, user._id),
                    marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                    borderRadius: "10px",
                    padding: "5px 12px",
                    maxWidth: "75%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    borderTopWidth: 12,
                    borderBottomWidth: 12,
                    borderColor:`${m.sender._id === user._id ? '#BEE3F8' : '#9df5be'}`,
                    borderRightWidth: 4,
                    borderLeftWidth: 4
                    
                }}>
                  <span>
                    {m.content}
                  </span>
                  <DownloadIcon marginTop={1} fontSize='lg' cursor={"pointer"}
                    onClick={() => downloadFile(m.content)} />
                  </div>
              :
              <span
                style={{
                  backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                    }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                }}
              >
        {m.content}
      </span>
            }
          </div>
        ))}
    </Stack>
  );
};

export default ScrollableChat;