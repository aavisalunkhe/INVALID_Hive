// input field for hive username
// check the extension is installed, code to request the user to sign a message for login via the keychain api
// login with keychain button onClick- window.keychain? requestSignBuffer: redirect to extension installation 
// requestSignBuffer: prompt user for signing, store the username in the state and update the ui accordingly

import { useState, useEffect } from 'react';
import { Client } from '@hiveio/dhive';
import Cookies from 'js-cookie';

const LoginComp = ({onLoginSuccess, onLogout}) => {
    const [username, setUsername]= useState('');
    const [error, setError]= useState('');
    const [loading, setLoading]= useState(false);
    const [extensionI, setExtensionI]= useState(false);

    const client= new Client([
        'https://api.hive.blog',
        'https://anyx.io',
        'https://api.openhive.network'
    ])

    useEffect(()=> {
        const checkExtension= ()=>{
            const keychainExists= !!window.hive_keychain;
            setExtensionI(keychainExists);
        }
        checkExtension();
        const interval= setInterval(checkExtension, 1000);
        return ()=> clearInterval(interval);
    }, []);

    const keychain= window.hive_keychain;
    const broadcastUserRegistration= async(username)=> {
        try{
            const operations= [
                [
                    'custom_json', 
                    {
                        required_auths: [],
                        required_posting_auths: [username],
                        id: "cleanTxt_registration",
                        json: JSON.stringify({
                            type: "user_registration",
                            timestamp: new Date().toISOString(),
                            app: 'CleanTxt/1.0'
                        })
                    }
                ]
            ];
            keychain.requestBroadcast(
                username,
                operations,
                "Posting",
                (response)=> {
                    if(!response.success){
                        console.error("Registration Broadcast failed: ", response);
                    }
                }
            );
        }catch(error){
            console.error("Registration Error: ", error);
        }
    };

    const handleLogin= async(e)=> {
        e.preventDefault();
        setLoading(true);
        setError("");

        if(!username){
            alert("Please enter your Hive username");
            setLoading(false);
            return;
        }
        try{
            const accounts= await client.database.getAccounts([username]);
            if(!accounts.length) {
                throw new Error("Account not found");
            }
            await new Promise((resolve, reject)=> {
                keychain.requestSignBuffer(
                    username,
                    "CleanTxt sign-in with hive keychain",
                    "Posting",
                    (response)=> {
                        if(response.success){
                            Cookies.set("cleanTxtSession", username, {
                                expires: 7
                            });
                            broadcastUserRegistration(username);
                            onLoginSuccess(username);
                            resolve();
                        }else{
                            reject(new Error("Error logging in"));
                        }
                    }
                );
            });
        }catch(error){
            setError(error.message);
            console.error("Login Error: ", error);
        }finally{
            setLoading(false);
        }
    };

    const handleLogout= ()=>{
        Cookies.remove('cleanTxtSession');
        setUsername('')
        onLogout();
    };

    return (
        <>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h1>Writer Sanctuary Login</h1>
                {extensionI ? (
                    <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Enter Hive Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '0.5rem', marginRight: '1rem' }}
                    />
                    <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
                        {loading ? 'Logging in...' : 'Login with Hive Keychain'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    </form>
                ) : (
                    <p>
                    Hive Keychain is not installed. Please install it from{' '}
                    <a href="https://hive-keychain.com/" target="_blank" rel="noopener noreferrer">
                        Hive Keychain
                    </a>
                    </p>
                )}
            </div>
        </>
    )
}

export default LoginComp