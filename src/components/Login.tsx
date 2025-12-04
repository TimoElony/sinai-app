import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function Login({loggedIn, setSessionToken}: {loggedIn: boolean; setSessionToken: React.Dispatch<React.SetStateAction<string>>}) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [hideAll, setHideAll] = useState<boolean>(true);

    const submitLogin  = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
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
                        <h1>Login</h1>
                        <Label className="m-2" htmlFor="emailField">email*
                        <Input
                            type="email"
                            id="emailField"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-2 border-gray-300 rounded-md p-2"
                        />
                        </Label>
                        <Label className="m-2" htmlFor="passwordField">password*
                        <Input
                            type="password"
                            id="passwordField"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-2 border-gray-300 rounded-md p-2"
                        />
                        </Label>
                        <Button onClick={() => {
                                    console.log("Login clicked");
                                    submitLogin(email, password);                                
                        }}>Login</Button>
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