import { useState } from "react";

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
        console.log("Login response:", data.access_token);
    } catch (error) {
        console.error("Error logging in:", error);
        
    }
}

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [toggleLogin, setToggleLogin] = useState<boolean>(true);

    

    return(
        <>
            {toggleLogin ? (
                <div className="flex flex-col gap-4">
                    <h1>Login</h1>
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
                            console.log("Login clicked");
                            submitLogin(email, password);
                        }}
                        className="bg-blue-500 text-white rounded-md p-2"
                    />
                </div>
            ): (
                <div className="flex flex-col gap-4">
                    <h1>Sign up</h1>
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
                            console.log("Sign up clicked");
                            //submitSignup(email, password);
                            setToggleLogin(!toggleLogin);
                        }}
                        className="bg-blue-500 text-white rounded-md p-2"
                    />
                </div>
            )}
        </>
    );
}