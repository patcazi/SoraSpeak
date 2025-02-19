import React, { useEffect } from 'react';
import { db } from './firebase'; // ensure firebase.js is in the same folder (src)
import { collection, addDoc } from 'firebase/firestore';

function FirestoreTest() {
  useEffect(() => {
    async function testFirestore() {
      try {
        const docRef = await addDoc(collection(db, 'testCollection'), {
          message: 'Hello from Firestore!'
        });
        console.log('Document written with ID:', docRef.id);
      } catch (e) {
        console.error('Error adding document:', e);
      }
    }

    testFirestore();
  }, []);

  return (
    <div>
      <h2>Firestore Test Component</h2>
      <p>If the Firestore document was successfully added, check your console for the document ID.</p>
    </div>
  );
}

export default FirestoreTest; 