import React, { useState, useEffect, createContext, useContext } from 'react';

import firestore from '@react-native-firebase/firestore';

import storage from '@react-native-firebase/storage';

export const ChatContext = createContext();

export const useSomeContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {


  let members = [];

  const [messages, setMessages] = useState([]);

  const [thread, setThread] = useState(null);

  const [imgLoading, setImageLoading] = useState(null)

  const pathOfTheStorage = `/footfallImages/`

  let messageIds = []
  let started = false

  async function createUser({ userName, groupName, userEmail, userId }) {
    try {
      const snapShot = firestore()
        .collection(groupName)
        .doc(userName).collection('MESSAGES').get()
      console.log("Lenth Of messages For user " + (await snapShot).empty)
      if ((await snapShot).empty) {
        createNewUser({ userName: userName, groupName: groupName, userEmail: userEmail, userId: userId })
      } else {
        started = false
        setThread({ groupName: groupName, userName: userName, userEmail: userEmail, userId: userId })
      }
    } catch (e) {
      createNewUser({ userName: userName, groupName: groupName, userEmail: userEmail, userId: userId })
    }
  }

  async function createNewUser({ userName, groupName, userEmail, userId }) {
    console.log("Creating New User " + userName)
    setMessages([])
    members = []
    messageIds = []
    firestore()
      .collection(groupName)
      .doc(userName)
      .set({
        name: userName,
        userName: userName,
        userEmail: userEmail,
        latestMessage: {
          text: `${userName} created. Welcome!`,
          createdAt: new Date().getTime()
        }


      }).then(docRef => {
        firestore()
          .collection(groupName)
          .doc(userName).collection('MESSAGES').add({
            text: `${userName} created. Welcome!`,
            createdAt: new Date().getTime(),
            system: true,
            userName: userName,
            userEmail: "audeep.nag@gmail.com"
          })
        started = false
        setThread({ groupName: groupName, userName: userName, userEmail: userEmail, userId: userId })
      }); s
  }

  async function uploadImage(imageUri) {
    let date = new Date().getTime()

    const filePath = pathOfTheStorage + "FootFallz" + date + ".jpeg"
    console.log("Image Location " + filePath)
    const ref = storage().ref(filePath)
    const uploadTask = ref.putFile(imageUri);
    uploadTask.on('state_changed', taskSnapshot => {
      console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
      //setImageLoading({ bytesTransferred: bytesTransferred, totalBytes: totalBytes })
    });

    uploadTask.then(() => {
      console.log(`File Updloaded SuccessFully`);
    });
    try {
      await uploadTask;
    } catch (e) {
      console.error("Waiting For task " + e);
    }
    const downloadUrl = await storage().ref(filePath).getDownloadURL();
    console.log("Download Url " + downloadUrl)
    handleSendImage(downloadUrl)
  }

  async function handleSend(sendMessages) {
    const text = sendMessages[0].text;
    //console.log("Send Text " + text + "User Name " + thread.userName)
    firestore()
      .collection(thread.groupName)
      .doc(thread.userName)
      .collection('MESSAGES')
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: thread.userId,
          email: thread.userEmail,
          name: thread.userName,
          displayName: thread.userName,
          avatar: "http://commondatastorage.googleapis.com/codeskulptor-assets/lathrop/asteroid_blend.png"
        },
      });

    await firestore()
      .collection(thread.groupName)
      .doc(thread.userName)
      .set(
        {
          latestMessage: {
            text,
            createdAt: new Date().getTime()
          }
        },
        { merge: true }
      );
  }

  async function handleSendImage(imageUrl) {
    const text = "";

    firestore()
      .collection(thread.groupName)
      .doc(thread.userName)
      .collection('MESSAGES')
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: thread.userId,
          email: thread.userEmail,
          name: thread.userName,
          displayName: thread.userName,
          avatar: "http://commondatastorage.googleapis.com/codeskulptor-assets/lathrop/asteroid_blend.png"
        },
        image: "https://firebasestorage.googleapis.com/v0/b/anuchatapplication.appspot.com/o/footfallImages%2FFootFallz1693935289978.jpeg?alt=media&token=f7a4f78f-ecfc-473f-846a-647d26237639"
      });


  }

  function fetchMessages(msgCollection) {
    try {

    } catch (e) {
      //console.warn(e);
    }
  }
  useEffect(() => {
   
    if (thread != null) {
      console.log("Thread Name in Chat Provide " + thread.groupName)
     const messgeListner =  firestore()
        .collection(thread.groupName)
        .onSnapshot(querySnapshot => {
          console.log(" started Already " + started)
          if (querySnapshot != null && !querySnapshot.empty) {
            querySnapshot.docs.map(documentSnapshot => {
              if (documentSnapshot != null
                && !documentSnapshot.empty) {
                console.log("Document Id " + documentSnapshot.id)
                members.push(documentSnapshot.id)
                // let docs = documentSnapshot.ref.collection('MESSAGES').get().listDocuments()
                let msgCollection = documentSnapshot.ref.collection('MESSAGES')
                if (msgCollection != null) {
                 msgCollection.onSnapshot(querySnapshot => {
                    if (querySnapshot != null
                      && !querySnapshot.empty) {
                      querySnapshot.docs.map(doc => {
                        const firebaseData = doc.data();
                        console.log("Message Id " + doc.id)
                        //if (!checkMessageIdExist(doc.id)) {
                          console.log("fetchMessages message Id " + doc.id + " Time " +firebaseData.text)
                          messageIds.push(doc.id)
                          const data = {
                            _id: doc.id,
                            createdAt: firebaseData.createdAt,
                            text: firebaseData.text,
                            user: firebaseData.user,
                            system: firebaseData.system,
                            ...firebaseData
                          }
                          if (!firebaseData.system) {
                            console.log("Display Name " + firebaseData.user.displayName)
                            data.user = {
                              name: firebaseData.user.displayName,
                              _id: firebaseData.user._id,
                            }
                          } 
                          messages.push(data)
                          let newData =  messages
                              .filter( (ele, ind) => ind === messages
                             .findIndex( elem => elem._id === ele._id))
                             .sort((a, b) => b.createdAt - a.createdAt)
                          setMessages(newData);
                      });
                    }
                  })

                }
              }

            })

          }
        })
        return () => messgeListner
      }
    

  

    // Stop listening for updates whenever the component unmounts
  }, [thread]);


  return (
    <ChatContext.Provider value={{ createUser, thread, setThread, uploadImage, handleSend, messages, createUser }}>
      {children}
    </ChatContext.Provider>
  );
};