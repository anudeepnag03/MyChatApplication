import React, { useState, useEffect, createContext, useContext } from 'react';

import firestore from '@react-native-firebase/firestore';

import storage from '@react-native-firebase/storage';

export const ChatContext = createContext();

export const useSomeContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {


  const [members, setMembers] = useState([]);

  const [messages, setMessages] = useState([]);

  const [thread, setThread] = useState('');

  const [imgLoading,setImageLoading] = useState(null)

  const pathOfTheStorage = `/footfallImages/`

  function createUser ({ groupName, userName, emailName }){
    try {
      firestore()
        .collection(groupName)
        .doc(userName)
        .set({
          name: userName,
          latestMessage: {
            text: `You have joined the room ${userName}.`,
            createdAt: new Date().getTime(),
            email: emailName
          }
        })
        .then(docRef => {
          docRef.collection('MESSAGES').add({
            text: `You have joined the room ${roomName}.`,
            createdAt: new Date().getTime(),
            system: true
          });
        });
    } catch (e) {
      console.error(e)
    }
  }

  async function uploadImage(imageUri) {
    let date = new Date().toLocaleString()
    const filePath = pathOfTheStorage+"FootFallz"+{date}+".jpeg"
    console.log("Image Location " + filePath)
    const ref = storage().ref(filePath)
    const uploadTask = ref.putFile(uri);
    uploadTask.on('state_changed', taskSnapshot => {
      console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
      setImageLoading({bytesTransferred:bytesTransferred,totalBytes:totalBytes})
    });
    
    task.then(() => {
      console.log(`File Updloaded SuccessFully`);
    });
    try {
      await task;
    } catch (e) {
      console.error("Waiting For task "+e);
    }
    const url = await storage().ref(imageLoc).getDownloadURL();
    handleSendImage(url,user)
  }

  async function handleSend(messages,user,userEmail) {
    const text = messages[0].text;

    firestore()
      .collection(thread)
      .doc(user)
      .collection('MESSAGES')
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: "1",
          email: userEmail,
          avatar: "http://commondatastorage.googleapis.com/codeskulptor-assets/lathrop/asteroid_blend.png"
        },
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

  async function handleSendImage(imageUrl,user) {
    const text = "";

    firestore()
      .collection(thread)
      .doc(user)
      .collection('MESSAGES')
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: "1",
          email: "anudeep.nag@gmail.com",
          avatar: "http://commondatastorage.googleapis.com/codeskulptor-assets/lathrop/asteroid_blend.png"
        },
        image: imageUrl
      });

   
}


  function loadMessagesFromGroup() {
  
    console.log("Theread Name "+thread)
    firestore()
    .collection(thread)
    .onSnapshot(querySnapshot => {
      if (querySnapshot == null || querySnapshot.empty) {
        return;
      }
        querySnapshot.docs.map(documentSnapshot => {
          if (documentSnapshot == null || documentSnapshot.empty) {
            return;
          }
          console.log("Document Id "+documentSnapshot.id)
          setMembers(oldMembers => [...oldMembers, {
            _id: documentSnapshot.id,
            // give defaults
            name: '',

            latestMessage: {
              text: ''
              
            },
            ...documentSnapshot.data()
          }])
         fetchMessages(documentSnapshot.id)
      })
    })
  };

  function fetchMessages(docId) {
    console.log("DocId "+docId)
    
    firestore()
    .collection(thread)
    .doc(docId).collection('MESSAGES')
    .onSnapshot(querySnapshot => {
      if (querySnapshot == null || querySnapshot.empty) {
        return;
      }
      querySnapshot.docs.map(doc => {
        const firebaseData = doc.data();

        const data = {
          _id: doc.id,
          text: '',
          createdAt: new Date().getTime(),
          ...firebaseData
        };
       // console.log("Messages "+data)
        if (!firebaseData.system) {
          data.user = {
            ...firebaseData.user,
            name: firebaseData.user.email
          };
        }
       // console.log("Message "+data.text)
        setMessages(oldMessages => [...oldMessages ,data]);
      });
     
      
    })
  }
   
       
   return (
    <ChatContext.Provider value={{createUser,loadMessagesFromGroup,thread,setThread,uploadImage}}>
      {children}
    </ChatContext.Provider>
  );
};