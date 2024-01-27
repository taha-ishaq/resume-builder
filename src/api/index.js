
import {collection, doc, onSnapshot,orderBy,setDoc,query} from "firebase/firestore"
import {auth,db} from "../config/firebase.config"


export const getUserDetail = () =>{
    return new Promise((resolve, reject)=>{
        const unsubscribe= auth.onAuthStateChanged((userCred) =>{
            if(userCred){
                const userData = userCred.providerData[0]

                const unsubscribe= onSnapshot(doc(db,"users", userData?.uid),(_doc)=>{
                        if(_doc.exists()){
                            resolve(_doc.data())
                        }else{
                            setDoc(doc(db,"users",userData?.uid),userData).then(()=>{
                                resolve(userData);
                            })
                        }
                });
                return unsubscribe;

            }else{
                reject(new Error("User is not authenticated"))
            }
            unsubscribe();
        })
    })
}

export const getTemplates = () => {
    return new Promise((resolve, reject) => {
        const templateQuery = query(
            collection(db, 'templates'),
            orderBy('timeStamp', 'asc')
        );

        const unsubscribe = onSnapshot(templateQuery, (querySnap) => {
            const templates = querySnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Fetched templates:', templates);
            resolve(templates);
        }, (error) => {
            // Handle errors
            console.error('Error fetching templates:', error);
            reject(error);
        });

        // Return the unsubscribe function
        return unsubscribe;
    });
};




