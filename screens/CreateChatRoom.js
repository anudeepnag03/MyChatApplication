import React, { useState,useContext, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native'
import firestore from '@react-native-firebase/firestore';
import { ChatContext } from '../provider/ChatProvider';
import { AuthContext } from '../navigation/AuthProvider';
export default function CreateChatRoom({ navigation }) {
  const [roomName, setRoomName] = useState('')
  const {loadMessagesFromGroup,setThread,thread} = useContext(ChatContext)
  function handleButtonPress() {
    console.log("Add Thread")
    loadMessagesFromGroup()
    /*firestore()
      .collection(thread)
      .doc("Anudeep")
      .set({
        name: roomName,
        latestMessage: {
          text: `You have joined the room ${roomName}.`,
          createdAt: new Date().getTime()
        }
      })
      .then(docRef => {
        docRef.collection('MESSAGES').add({
          text: `You have joined the room ${roomName}.`,
          createdAt: new Date().getTime(),
          system: true
        });
       
      });*/
      navigation.navigate("PersonalRoom")
  }

  useEffect(() => {
    setThread('THREADS')
  },[]);
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder='Thread Name'
        onChangeText={roomName => setRoomName(roomName)}
      />
      <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>Create chat room</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dee2eb'
  },
  title: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 28,
    fontWeight: '500'
  },
  button: {
    backgroundColor: '#2196F3',
    textAlign: 'center',
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginStart:5
  },
  textInput: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderColor: '#aaa',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 5,
    width: 225
  }
})