"use client";

import React, {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import AuthPage from "@/components/AuthPage";
import api from "@/lib/api";


export default function ResetPasswordForm(){

const router = useRouter();
const searchParams = useSearchParams();

const identifier =
 searchParams.get("identifier") || "";

const [otp,setOtp] = useState("");
const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);

const [error,setError] = useState("");
const [message,setMessage] = useState("");



async function handleReset(){

if(!otp || !password){
 setError("Enter OTP and new password");
 return;
}


if(password.length < 8){
 setError("Password must be at least 8 characters");
 return;
}


setLoading(true);
setError("");

try{

const {data}= await api.post(
"/auth/password/reset",
{
 identifier,
 otp,
 newPassword: password
}
);


if(!data.success){
 setError(data.message);
 return;
}


setMessage(
"Password reset successfully. Redirecting..."
);


setTimeout(()=>{
 router.push("/login");
},1200);


}catch(err:any){

setError(
err.response?.data?.message ||
"Invalid or expired code"
);

}finally{

setLoading(false);

}

}



return (

<AuthPage
 videoSrc="/videos/login-bg.mp4"
 imageSrc="/images/login-bg.jpg"
>

<div className="
max-w-md
mx-auto
bg-white
dark:bg-gray-800
rounded-2xl
shadow
p-6
space-y-6
">


<h1 className="
text-2xl
font-semibold
text-center
">

Reset Password

</h1>



<input
className="
w-full
p-3
border
rounded-lg
dark:bg-gray-700
"
placeholder="OTP"
value={otp}
onChange={
e=>setOtp(e.target.value)
}
/>



<input
type="password"
className="
w-full
p-3
border
rounded-lg
dark:bg-gray-700
"
placeholder="New Password"
value={password}
onChange={
e=>setPassword(e.target.value)
}
/>



<button
onClick={handleReset}
disabled={loading}
className="
w-full
py-3
bg-blue-600
text-white
rounded-lg
"
>

{
loading
?
"Resetting..."
:
"Reset Password"
}

</button>



<div className="text-center text-sm">

<a
href="/login"
className="text-blue-600"
>
Back to login
</a>

</div>



{message &&
<p className="text-green-600 text-center">
{message}
</p>
}



{error &&
<p className="text-red-600 text-center">
{error}
</p>
}


</div>


</AuthPage>

)

}
