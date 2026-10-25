import { login } from './actions'

export default async function  LoginPage({ searchParams }) {
  const params = await searchParams;
  const errorMessage = params?.error;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form className="flex flex-col w-full max-w-sm gap-4 p-8 bg-white border border-gray-200 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">Login</h1>
        
        {errorMessage && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Email</label>
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            name="email"
            type="email"
            placeholder="Enter your gmail"
            value={'rayhan@gmail.com'}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Password</label>
          <input
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          formAction={login}
          className="p-3 mt-4 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}