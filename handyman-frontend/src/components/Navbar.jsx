// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    if (notification.relatedJob) {
      window.location.href = `/jobs/${notification.relatedJob}`;
    }
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          🛠️ Handyman
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={dropdownRef}>
                {/* ... თქვენი შეტყობინებების კოდი აქ ... */}
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative p-2 rounded-full hover:bg-indigo-600 transition">
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {/* ... dropdown კონტენტი ... */}
              </div>

              <span className="text-sm bg-indigo-500 px-3 py-1 rounded-full">
                {user.name} ({user.role})
              </span>

              {/* 🔥 ახალი ღილაკი ადმინისთვის! */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
                >
                  🛡️ ადმინის პანელი
                </Link>
              )}

              {user.role === "client" && (
                <Link to="/post-job" className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                  + ახალი შეკვეთა
                </Link>
              )}

              <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition">
                გამოსვლა
              </button>
            </>
          ) : (
            // ... არაავტორიზებული მენიუ ...
            <>
              <Link to="/login" className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">შესვლა</Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-semibold transition">რეგისტრაცია</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white focus:outline-none">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-800 px-4 py-3 space-y-3 border-t border-indigo-600">
          {user ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{user.name} ({user.role})</span>
                <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm transition">გამოსვლა</button>
              </div>

              {/* 🔥 მობილურზეც დავამატოთ ადმინის ღილაკი */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-red-500 text-white text-center px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  🛡️ ადმინის პანელი
                </Link>
              )}

              {user.role === "client" && (
                <Link to="/post-job" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-white text-indigo-700 text-center px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                  + ახალი შეკვეთა
                </Link>
              )}
              {/* ... დანარჩენი ... */}
            </>
          ) : (
            // ... მობილურის არაავტორიზებული მენიუ ...
             <div className="flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-white text-indigo-700 text-center px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">შესვლა</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full bg-green-500 text-white text-center px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition">რეგისტრაცია</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;