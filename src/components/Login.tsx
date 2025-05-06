import { useState } from "react";



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
    } catch (error) {
        console.error("Error signing up:", error);
    }
}

export default function Login({loggedIn, setSessionToken}: {loggedIn: boolean; setSessionToken: React.Dispatch<React.SetStateAction<string>>}) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [toggleLogin, setToggleLogin] = useState<boolean>(true);
    const [hideAll, setHideAll] = useState<boolean>(false);

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
            {hideAll && <button className="bg-none underline m-4" onClick={()=>setHideAll(false)}>Login</button>}
            {(!loggedIn && !hideAll) ? (
                <div className="flex flex-col md:flex-row md:items-center gap-4 m-4">
                        <h1>{toggleLogin ? 'Login' : 'Sign up'}</h1>
                        <label htmlFor="emailField">email*</label>
                        <input
                            type="email"
                            id="emailField"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-2 border-gray-300 rounded-md p-2"
                        />
                        <label htmlFor="passwordField">password*</label>
                        <input
                            type="password"
                            id="passwordField"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-2 border-gray-300 rounded-md p-2"
                        />
                        <button
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
                            className="StandardButton"
                        >
                            {toggleLogin? 'Login' : 'Sign up'}
                        </button>
                        {toggleLogin && 
                            <button
                                onClick={() => {
                                    setToggleLogin(false);
                                }}
                                className="StandardButton"
                            >
                                No account yet?
                            </button>
                        }   
                    </div>
            ): (
                !hideAll &&
                    <div className="flex items-center m-4">
                        <button
                            onClick={() => {
                                setSessionToken('');
                                setHideAll(true);
                            }}
                            className="StandardButton"
                        >
                            Logout
                        </button>
                    </div>
            )}
        </>
    );
}