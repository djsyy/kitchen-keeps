import { useState } from 'react';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { Link } from 'react-router-dom';
import { VscAccount } from 'react-icons/vsc';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form className="flex flex-col justify-center items-center m-4 p-4 gap-2">
      <div className="h-10">
        <VscAccount className="h-16 w-8 text-primary-400" />
      </div>
      <div className="text-center my-3">
        <h2 className="text-xl">Create an account</h2>
      </div>

      <div className="my-3">
        <Label htmlFor="email">Name</Label>
        <Input
          id="name-input"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.currentTarget.value);
          }}
        />
      </div>

      <div className="my-3">
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

      <button className="container mx-auto p-2 bg-primary rounded-md text-text-100 hover:bg-primary-700">
        Create account
      </button>

      <p>
        Already have an account?{' '}
        <Link to="/login" className="text-text-950 hover:text-text-500">
          Log in
        </Link>
      </p>
    </form>
  );
}
