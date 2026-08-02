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
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          🛠️ Handyman
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative p-2 rounded-full hover:bg-indigo-600 transition"
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-gray-800">შეტყობინებები</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          ყველას წაკითხვა
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">იტვირთება...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">შეტყობინებები არ არის</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                              !notif.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <p className="text-sm text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-sm bg-indigo-500 px-3 py-1 rounded-full">
                {user.name} ({user.role})
                {user.role === "craftsman" && user.profession && user.profession.length > 0 && (
                  <span className="ml-1 text-xs">: {user.profession.join(", ")}</span>
                )}
              </span>

              {user.role === "client" && (
                <Link
                  to="/post-job"
                  className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  + ახალი დავალება
                </Link>
              )}

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
              >
                გამოსვლა
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                შესვლა
              </Link>
              <Link
                to="/register"
                className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-semibold transition"
              >
                რეგისტრაცია
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
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
                <span className="text-sm font-semibold">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm transition"
                >
                  გამოსვლა
                </button>
              </div>
              {user.role === "client" && (
                <Link
                  to="/post-job"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full bg-white text-indigo-700 text-center px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  + ახალი დავალება
                </Link>
              )}
              {/* Notifications in mobile */}
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 w-full text-left text-sm font-semibold hover:text-indigo-200 transition"
                >
                  🔔 შეტყობინებები
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="mt-2 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-3 text-center text-gray-400 text-sm">შეტყობინებები არ არის</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            handleNotificationClick(notif);
                            setMobileMenuOpen(false);
                          }}
                          className={`p-3 border-b border-gray-100 cursor-pointer ${
                            !notif.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full bg-white text-indigo-700 text-center px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                შესვლა
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full bg-green-500 text-white text-center px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                რეგისტრაცია
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;