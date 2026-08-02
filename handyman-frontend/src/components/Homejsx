// src/components/Home.jsx
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative w-full min-h-[85vh] flex items-center justify-center">

      
      {/* ფონის ჩაბნელება, რომ ტექსტი კარგად იკითხებოდეს */}
      <div className="absolute inset-0 bg-blue-900/70 backdrop-blur-sm"></div>

      {/* შინაარსი */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white flex flex-col items-center gap-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
          Handyman
        </h1>
        
        <p className="max-w-2xl text-xl md:text-2xl font-medium drop-shadow-md leading-relaxed">
          განათავსეთ შეკვეთა და ხელოსანი თვითონ დაგიკავშირდებათ
        </p>
        
        <p className="max-w-xl text-lg text-blue-100 drop-shadow-sm">
          იპოვეთ სანდო ხელოსნები თქვენს მახლობლად. ჩვენ ვზრუნავთ, რომ საქმე სწრაფად და ხარისხიანად შესრულდეს.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Link 
            to="/create" 
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200"
          >
            განათავსე შეკვეთა
          </Link>
          <Link 
            to="/jobs" 
            className="px-8 py-3 bg-transparent text-white border-2 border-white font-bold rounded-full hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-200"
          >
            იხილეთ დავალებები
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;