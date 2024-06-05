import React from "react";
import { addresses } from "../constants/addresses";
import { abi } from "../abi/index.js" 
import axios from 'axios'
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import {encodeFunctionData} from 'viem'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_FIREBASE_APPID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID
};

initializeApp(firebaseConfig)

const database = getDatabase()

const MainContext = React.createContext()


export const MainContextProvider = ({children}) => {
    const [fallPopup, setFallPopup] = React.useState(false)
    const [walletProvider, setWalletProvider] = React.useState()
    const [CFAddress, setCFAddress] = React.useState()
    const [devices, setDevices] = React.useState([
        // ...additional devices
    ])
    React.useEffect(() => {
        if(walletProvider && CFAddress){
            console.log('checking firebase rtb for fall')
            const fallRef = ref(database, 'fall');
            onValue(fallRef, (snapshot) => {
                if(snapshot.exists()){
                    console.log('fall detected', snapshot.val())
                    setFallPopup(true)
                    fetchFallDetails(walletProvider, CFAddress)
                    remove(fallRef)
                }
            });
        }
    }, [walletProvider, CFAddress])
    const serverUrl = 'http://localhost:5000/api'
    const [userDetails, setUserDetails] = React.useState(
        {
            
        }
    )

    const [fallDetails, setFallDetails] = React.useState(
        {
            //fall details
        }
    )

    const fetchUserDetails = async (walletProvider, CFAddress) => {
        const MetaSave = await walletProvider.getContract(addresses.MetaSave, abi.MetaSave)
        console.log('fetchin user details for', CFAddress)
        let IPFSid = 'QmcG553qsFk4cskCxMBukqEJSMv2oVm49kbC3Tc1zCAmz4'
        
        try{
            const res = await axios.get(`${serverUrl}/user/${IPFSid}`)
            console.log(res.data.data)
            setUserDetails(res.data.data)
        }catch(err){
            console.log('invalid ipfsid', err)
        }
    }

    const fetchFallDetails = async(walletProvider, CFAddress) => {
        console.log('fetch fall details', CFAddress)
        setWalletProvider(walletProvider)
        setCFAddress(CFAddress)
        try{
            const res = await axios.get(`${serverUrl}/falldata`)

            const result = res.data.result

            const uniqueObjects = {};

            // result.forEach(obj => {
            //     const timestamp = obj.timestamp;
            //     if (!uniqueObjects[timestamp]) {
            //         uniqueObjects[timestamp] = obj;
            //     }
            // });

            // const uniqueArray = Object.values(uniqueObjects);

            // console.log(uniqueArray);
            setFallDetails(result)
        }catch(err){
            console.log('No fall data for this user', err)
        }
    }

    const fetchDevices = async(walletProvider, CFAddress) => {
        try {
            // call the SC function that fetches all devices connected to the user
        } catch (error) {
            console.log('No devices found', error)
        }
    }

    const insertUserDetails = async(AAProvider, CFAddress, data) => {
        const res = await axios.post(`${serverUrl}/user`, {data})

        const IPFSid = res.data.CID

        console.log("IPFS ID: ", IPFSid)
        console.log("CFAddress: ", CFAddress)

        const uoCallData = encodeFunctionData({
            abi: abi.MetaSave,
            functionName: "setIPFSFileName",
            args: [CFAddress, IPFSid],
        })
        const uo = await AAProvider.sendUserOperation({
            target: addresses.MetaSave,
            data: uoCallData,
        });

        const txHash = await AAProvider.waitForUserOperationTransaction(uo.hash)
        if(txHash){
            console.log("TX HASH: ", txHash)
            return true
        }else{
            return false
        }
    
    }
    
    return(
        <MainContext.Provider value={{
            serverUrl,
            userDetails,
            fallDetails,
            fallPopup,
            devices,
            setDevices,
            setFallPopup,
            setFallDetails,
            setUserDetails,
            fetchUserDetails,
            fetchFallDetails,
            insertUserDetails,
            fetchDevices
        }}>
            {children}
        </MainContext.Provider>
    )
}

export const useMainContext = () => React.useContext(MainContext)