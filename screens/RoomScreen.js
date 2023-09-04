import React, { useState, useContext, useEffect } from 'react';
import {
  GiftedChat,
  Bubble,
  Send,
  SystemMessage,
  Avatar,

} from 'react-native-gifted-chat';
import { ActivityIndicator, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import { AuthContext } from '../navigation/AuthProvider';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import imageIcon from '../Images/image.png'

export default function RoomScreen({ route }) {


  const [messages, setMessages] = useState([]);
  const { thread } = 'THREADS';
  const { user } = useContext(AuthContext);
  const currentUser = user.toJSON();
  const [selectedFile, setSelectedFile] = useState(null);

  const [imageUri, setImageUri] = useState(null)

  async function handleSend(messages) {
    const text = messages[0].text;

    firestore()
      .collection('THREADS')
      .doc('Anudeep')
      .collection('MESSAGES')
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: "1",
          email: "anudeep.nag@gmail.com",
          avatar: "http://commondatastorage.googleapis.com/codeskulptor-assets/lathrop/asteroid_blend.png"
        },
        image: "https://firebasestorage.googleapis.com/v0/b/anuchatapplication.appspot.com/o/images%2Fblack-t-shirt-sm1.jpeg?alt=media&token=b6f6f009-88eb-44b8-bc95-3e2f8bd2f65b"
      });

    /* await firestore()
       .collection('THREADS')
       .doc('Anudeep')
       .set(
         {
           latestMessage: {
             text,
             createdAt: new Date().getTime()
           }
         },
         { merge: true }
       );*/
  }

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
    console.log("Downloaded URL "+url)
    // set progress state

    /*Alert.alert(
      'Photo uploaded!',
      'Your photo has been uploaded to Firebase Cloud StoragsqAAAAXe!'
    );*/
    selectedFile(null);
  }

  useEffect(() => {
    console.log("Thread Id " + thread)
    const messagesListener = firestore()
      .collection('THREADS')
      .doc('Anudeep')
      .collection('MESSAGES')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const messages = querySnapshot.docs.map(doc => {
          console.log("Got new messages ")
          const firebaseData = doc.data();

          const data = {
            _id: doc.id,
            text: '',
            system: true,
            createdAt: new Date().getTime(),
            ...firebaseData
          };

          if (!firebaseData.system) {
            data.user = {
              ...firebaseData.user,
              name: firebaseData.user.email
            };
          }

          return data;
        });

        setMessages(messages);
      });

    // Stop listening for updates whenever the component unmounts
    return () => messagesListener();
  }, []);

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
          setImageUri(uri)
          setSelectedFile(() => file);
        }
      }
    });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={handleSend}
      user={{ _id: currentUser.uid }}
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomComponentContainer: {
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
