import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
    const { user } = useAuth(); 

    return (
        <div className="relative min-h-screen flex flex-col bg-black overflow-hidden">

            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800">
                <polygon points="50,50 200,200 100,300" fill="red" opacity="0.5" />
                <polygon points="300,30 400,150 250,200" fill="blue" opacity="0.6" />
                <polygon points="1200,50 1400,200 1300,300" fill="purple" opacity="0.4" />
                <polygon points="1100,30 1250,180 1150,280" fill="black" opacity="0.3" />
                <polygon points="500,200 700,400 600,500" fill="red" opacity="0.5" />
                <polygon points="800,150 1000,350 900,450" fill="blue" opacity="0.5" />
                <polygon points="100,600 300,750 200,850" fill="purple" opacity="0.4" />
                <polygon points="400,650 600,800 500,900" fill="black" opacity="0.3" />
                <polygon points="1100,650 1300,800 1200,900" fill="red" opacity="0.5" />
                <polygon points="900,700 1100,850 1000,950" fill="blue" opacity="0.5" />
            </svg>


            <header className="relative z-10 w-full bg-white bg-opacity-90 shadow-md py-4 px-6 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-blue-700 tracking-wide">Satorial</h1>


                <div className="space-x-4">
                    {user ? (
                        <Link to="/dashboard" className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-lg text-lg">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-blue-600 font-semibold text-lg">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-lg text-lg">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </header>


            <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center p-6">
                <h2 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
                    The Smarter Way to <br /> Manage Your Projects
                </h2>
                <p className="text-white mt-4 max-w-lg text-lg md:text-xl leading-relaxed">
                    All the resources you need to ensure collaboration and timely delivery of your fashion projects.
                </p>


                {!user && (
                    <Link to="/register" className="bg-blue-700 text-white px-7 py-4 rounded-xl mt-8 shadow-lg text-xl font-semibold hover:bg-blue-800 transition duration-300">
                        Get Started
                    </Link>
                )}
            </main>
        </div>
    );
};

export default Login;
