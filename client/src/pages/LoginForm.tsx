import { useState } from 'react';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Link } from 'react-router-dom';
import { IoIosLogIn } from 'react-icons/io';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form className="flex flex-col justify-center items-center m-4 p-4 gap-2">
      <div className="h-10">
        <IoIosLogIn className="h-16 w-8 text-primary-400" />
      </div>
      <div className="text-center">
        <h2>Sign in to your account</h2>
      </div>
      <div className="relative">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email-input"
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
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.currentTarget.value);
          }}
        />
      </div>

      <button className="container mx-auto p-2 bg-primary rounded-md hover:bg-primary-600">
        Sign In
      </button>

      <p>
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-50 hover:text-950">
          Create one
        </Link>
      </p>
    </form>
  );
}
