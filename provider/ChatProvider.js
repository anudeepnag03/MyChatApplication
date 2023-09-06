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
    started = false
    console.log("Creating New User " + started)
    try {
      const snapShot = firestore()
        .collection(groupName)
        .doc(userName).collection('MESSAGES').get()
      console.log("Lenth Of messages For user " + (await snapShot).empty)
      if ((await snapShot).empty) {
        createNewUser({ userName: userName, groupName: groupName, userEmail: userEmail, userId: userId })
      } else {
        setThread({ groupName: groupName, userName: userName, userEmail: userEmail, userId: userId })
      }
    } catch (e) {
      createNewUser({ userName: userName, groupName: groupName, userEmail: userEmail, userId: userId })
    }
  }

function createNewUser({ userName, groupName, userEmail, userId }) {
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
        setThread({ groupName: groupName, userName: userName, userEmail: userEmail, userId: userId })
      });
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
        image: imageUrl
      });


  }

  function resetFields(msgCollection) {
     setMessages([])
     started = false
  }
  useEffect(() => {
    resetFields()
    if (thread != null) {
      console.log("Thread Name in Chat Provide " + thread.groupName)
      const messgeListner = firestore()
        .collection(thread.groupName)
        .onSnapshot(querySnapshot => {
          if (querySnapshot != null && !querySnapshot.empty) {
            querySnapshot.docs.map(documentSnapshot => {
              if (documentSnapshot != null
                && !documentSnapshot.empty) {
                  console.log("Creating New User " + started)
                if (started) return
                console.log("Document Id " + documentSnapshot.id)
                members.push(documentSnapshot.id)
                if (members.length == querySnapshot.docs.length) {
                  started = true
                }
                // let docs = documentSnapshot.ref.collection('MESSAGES').get().listDocuments()
                let msgCollection = documentSnapshot.ref.collection('MESSAGES')
                if (msgCollection != null) {
                  msgCollection.onSnapshot(querySnapshot => {
                    if (querySnapshot != null
                      && !querySnapshot.empty) {

                      querySnapshot.docChanges().forEach((change) => {
                        const doc = change.doc
                        const firebaseData = change.doc.data()
                        if (change.type === "added") {
                             console.log("New Document Added : ", firebaseData);

                          //if (!checkMessageIdExist(doc.id)) {
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
                          let newData = messages
                          newData.push(data)
                          console.log("Length Of the messages ", newData.length)
                         
                          setMessages(newData.sort((a, b) => b.createdAt - a.createdAt));

                        }
                        if (change.type === "modified") {
                          console.log("Modified city: ", change.doc.data());
                        }
                        if (change.type === "removed") {
                          console.log("Removed Doc: ", doc);
                          setMessages(oldMessages => oldMessages.filter((document) => document._id != doc.id))
                        }
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