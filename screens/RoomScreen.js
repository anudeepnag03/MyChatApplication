import React, { useState, useContext, useEffect } from 'react';
import {
  GiftedChat,
  Bubble,
  Send,
  SystemMessage,
} from 'react-native-gifted-chat';
import { ActivityIndicator, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import imageIcon from '../Images/image.png'
import { ChatContext } from '../provider/ChatProvider';

export default function RoomScreen({ route }) {

//  const [messages, setMessages] = useState([]);
  const { groupName, userName, userEmail,userId } = route.params;
  const { setThread, handleSend,createUser,messages,uploadImage } = useContext(ChatContext);
  const [selectedFile, setSelectedFile] = useState(null);

  const [imageUri, setImageUri] = useState(null)
  //console.log("Group Name " + groupName + " userName" + userName + "userEmail" + userEmail)

  useEffect(() => {
    if (selectedFile && selectedFile.name && selectedFile.uri) {
      sendMediaMessageCometChat();
    }
  }, [selectedFile]);

  const sendMediaMessageCometChat = async () => {
    console.log("sendMediaMessageCometChat " + selectedFile.name + " Type " + selectedFile.type + "Uri " + selectedFile.uri)

    const uri = selectedFile.uri;
    // const response = await fetch(uri)
    //const blob = response.blob
    const imageLoc = `/images/black-t-shirt-sm1.jpeg`
    console.log("Image Location " + imageLoc)
    const ref = storage()
      .ref(imageLoc)
    console.log("Firebase profile photo uploaded successfully")
    const task = ref.putFile(uri);

    task.on('state_changed', taskSnapshot => {
      console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
    });

    task.then(() => {

    });
    try {
      await task;
    } catch (e) {
      console.error(e);
    }
    const url = await storage().ref(imageLoc).getDownloadURL();
    console.log("Downloaded URL " + url)
    selectedFile(null);
  }

  useEffect(() => {
    createUser({userName:userName,groupName:groupName,userEmail:userEmail,userId:userId})
    return () => {
      unSucscribe()
    } 
  }, []);
 
  function unSucscribe() {
    setThread(null)
    console.log("UnSubscribe")
 }
  function renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#6646ee'
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          }
        }}
      />
    );
  }

  function renderLoading() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#6646ee' />
      </View>
    );
  }

  function renderSend(props) {
    return (
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <IconButton icon='send-circle' size={32} color='#6646ee' />
        </View>
      </Send>
    );
  }

  const getFileName = (fileName, type) => {
    if (Platform.OS === 'android' && type === 'photo') {
      return 'Camera_001.jpeg';
    } else if (Platform.OS === 'android' && type.includes('video')) {
      return 'Camera_001.mov'
    }
    return fileName;
  }

  function scrollToBottomComponent() {
    return (
      <View style={styles.bottomComponentContainer}>
        <IconButton icon='chevron-double-down' size={36} color='#6646ee' />
      </View>
    );
  }

  const renderActions = () => {
    return (
      <View style={styles.bottomComponentContainer}>
        <TouchableOpacity style={styles.select} onPress={handleSelectFile}>
          <Image source={imageUri == null ? imageIcon : { uri: imageUri }} style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
      </View>
    );
  };

  function renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        wrapperStyle={styles.systemMessageWrapper}
        textStyle={styles.systemMessageText}
      />
    );
  }

  const handleSelectFile = () => {
    const options = {
      mediaType: 'image/jpeg'
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return null;
      } else if (response.assets && response.assets.length !== 0) {
        const uri = response.assets[0].uri;
        const fileName = response.assets[0].fileName;
        const type = response.assets[0].type;
        if (uri && fileName) {
          const file = {
            name: getFileName(fileName, type),
            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
            type: type || 'video/quicktime'
          };
            uploadImage(uri)
        }
      }
    });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={handleSend}
      user={{ _id: userId }}
      placeholder='Type your message here...'
      alwaysShowSend
      showUserAvatar
      scrollToBottom
      renderBubble={renderBubble}
      renderLoading={renderLoading}
      renderSend={renderSend}
      renderActions={renderActions}
      scrollToBottomComponent={scrollToBottomComponent}
      renderSystemMessage={renderSystemMessage}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendingContainer: {
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomComponentContainer: {
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  systemMessageWrapper: {
    backgroundColor: '#6646ee',
    borderRadius: 4,
    padding: 5
  },
  systemMessageText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  }
});
