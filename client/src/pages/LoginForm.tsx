import { useState } from 'react';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { IoIosLogIn } from 'react-icons/io';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form className="flex flex-col justify-center items-center m-4 p-4 gap-2">
      <div className="h-10">
        <IoIosLogIn className="h-16 w-8 text-400" />
      </div>
      <div className="text-center">
        <h2>Sign in to your account</h2>
      </div>
      <div className="relative">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.currentTarget.value);
          }}
        />
      </div>

      <div className="my-3">
        <Label htmlFor="email">Password</Label>
        <Input
          id="password-input"
          type="text"
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
          }}
        />
      </div>

      <button className="container mx-auto p-2 bg-primary rounded-md hover:bg-primary-600">
        Sign In
      </button>
    </form>
  );
}
