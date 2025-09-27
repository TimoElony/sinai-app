import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";



const submitSignup = async (email: string, password: string) => {
    try {
        const response = await fetch('https://sinai-backend.onrender.com/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        const data = await response.json();
        console.log("Signup response:", data.message);
        alert("Click on the link in your email to confirm your account");
    } catch (error) {
        console.error("Error signing up:", error);
    }
}

export default function Login({loggedIn, setSessionToken}: {loggedIn: boolean; setSessionToken: React.Dispatch<React.SetStateAction<string>>}) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [toggleLogin, setToggleLogin] = useState<boolean>(true);
    const [hideAll, setHideAll] = useState<boolean>(true);

    const submitLogin  = async (email: string, password: string) => {
        try {
            const response = await fetch('https://sinai-backend.onrender.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            const data = await response.json();
    
            console.log("Login response:", data.message);
            setSessionToken(data.token);
        } catch (error) {
            console.error("Error logging in:", error);
            
        }
    }

    return(
        <>
            {hideAll && <Button className="m-2" onClick={()=>setHideAll(false)}>Login</Button>}
            {(!loggedIn && !hideAll) ? (
                <div className="flex flex-col md:flex-row md:items-center gap-2 m-2">
                        <Button onClick={()=>setHideAll(true)}>hide</Button>
                        <h1>{toggleLogin ? 'Login' : 'Sign up'}</h1>
                        <label className="m-2" htmlFor="emailField">email*
                        <Input
                            type="email"
                            id="emailField"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-2 border-gray-300 rounded-md p-2"
                        />
                        </label>
                        <label className="m-2" htmlFor="passwordField">password*
                        <Input
                            type="password"
                            id="passwordField"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-2 border-gray-300 rounded-md p-2"
                        />
                        </label>
                        <Button
                            onClick={() => {
                                if (toggleLogin){
                                    console.log("Login clicked");
                                    submitLogin(email, password);
                                } else {
                                    console.log("Sign up clicked");
                                    submitSignup(email, password);
                                    setToggleLogin(!toggleLogin);
                                    alert('Check your email to confirm Sign up')
                                }
                            }}
                            
                        >
                            {toggleLogin? 'Login' : 'Sign up'}
                        </Button>
                        {toggleLogin && 
                            <Button
                                onClick={() => {
                                    setToggleLogin(false);
                                }}
                            >
                                No account yet?
                            </Button>
                        }   
                    </div>
            ): (
                !hideAll &&
                    <div className="flex items-center m-4">
                        <Button
                            onClick={() => {
                                setSessionToken('');
                                setHideAll(true);
                            }}
                        >
                            Logout
                        </Button>
                    </div>
            )}
        </>
    );
}