import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({
    isAuthenticated = false,
    user = null,
    onLogin,
    onRegister,
    onLogout,
    onShowProfile,
    currentPage = 'none',
    onPageChange,
}) => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close mobile menu if clicked outside of the menu itself or the toggle button
            if (showMobileMenu && !event.target.closest('.nav-menu') && !event.target.closest('.mobile-toggle')) {
                setShowMobileMenu(false);
            }
            // Close user dropdown if clicked outside
            if (showUserDropdown && !event.target.closest('.user-menu')) {
                setShowUserDropdown(false);
            }
        };

        // Use mousedown to catch the event before a potential click event on another element
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileMenu, showUserDropdown]); // Re-run effect if state changes

    // Google OAuth handler
    const handleGoogleLogin = () => {
        const currentUrl = window.location.href;
        const googleAuthUrl = `http://localhost:4000/api/v1/auth/google?redirect=${encodeURIComponent(currentUrl)}`;
        window.location.href = googleAuthUrl;
    };

    const handleLogin = async (credentials) => {
        try {
            console.log('🔑 Header: Bắt đầu đăng nhập...');

            // Call onLogin from props (App.js will handle the API call)
            if (onLogin) {
                const result = await onLogin(credentials);
                if (result.success) {
                    setShowLoginModal(false);
                    console.log('✅ Header: Đăng nhập thành công');
                } else {
                    console.log('❌ Header: Đăng nhập thất bại:', result.message);
                }
            } else {
                console.log('❌ Header: onLogin function không được truyền');
            }
        } catch (error) {
            console.error('❌ Header: Lỗi đăng nhập:', error);
        }
    };

    const handleRegister = async (userData) => {
        try {
            console.log('🚀 Header: Bắt đầu đăng ký...');

            // Call onRegister from props (App.js will handle the API call)
            if (onRegister) {
                const result = await onRegister(userData);
                if (result.success) {
                    setShowRegisterModal(false);
                    console.log('✅ Header: Đăng ký thành công');
                } else {
                    console.log('❌ Header: Đăng ký thất bại:', result.message);
                }
            } else {
                console.log('❌ Header: onRegister function không được truyền');
            }
        } catch (error) {
            console.error('❌ Header: Lỗi đăng ký:', error);
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        setShowUserDropdown(false);
    };

    const handleNavClick = (page) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <>
            <header className="header">
                <div className="header-container">
                    {/* Logo */}
                    <div className="header-logo">
                        <img src="/logo_quiz.png" alt="Quiz Logo" className="logo-image" />
                        <span className="logo-text">QuizMaster</span>
                    </div>

                    {/* Navigation */}
                    <nav className={`nav-menu ${showMobileMenu ? 'nav-menu-active' : ''}`}>
                        <a
                            href="#"
                            className={`nav-link quiz ${currentPage === 'quiz' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('quiz');
                            }}
                        >
                            <span className="nav-icon">💡</span>
                            Quiz
                        </a>
                        <a
                            href="#"
                            className={`nav-link create ${currentPage === 'create' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('create');
                            }}
                        >
                            <span className="nav-icon">✏️</span>
                            Tạo Quiz
                        </a>
                        {/* Removed Leaderboard link as requested */}
                        <a
                            href="#"
                            className={`nav-link history ${currentPage === 'history' ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick('history');
                            }}
                        >
                            <span className="nav-icon">🕒</span>
                            Lịch sử
                        </a>
                    </nav>

                    {/* User Section */}
                    <div className="header-user">
                        {isAuthenticated && user ? (
                            <div className="user-menu">
                                <button className="user-button" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                                    <span className="user-name">{user.name}</span>
                                    <i className={`dropdown-arrow ${showUserDropdown ? 'rotate' : ''}`}>▼</i>
                                </button>

                                {showUserDropdown && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <img src={user.avatar} alt={user.name} className="dropdown-avatar" />
                                            <div>
                                                <div className="dropdown-name">{user.name}</div>
                                                <div className="dropdown-email">{user.email}</div>
                                            </div>
                                        </div>
                                        <hr className="dropdown-divider" />
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                onPageChange('edit-profile');
                                                setShowUserDropdown(false);
                                            }}
                                        >
                                            <i className="icon-user"></i>
                                            Hồ sơ của bạn
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                onPageChange('settings');
                                                setShowUserDropdown(false);
                                            }}
                                        >
                                            <i className="icon-settings"></i>
                                            Cài đặt
                                        </button>
                                        <hr className="dropdown-divider" />
                                        <button className="dropdown-item logout" onClick={handleLogout}>
                                            <i className="icon-logout"></i>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <button className="login-btn" onClick={() => setShowLoginModal(true)}>
                                    Đăng nhập
                                </button>
                                <button className="signup-btn" onClick={() => setShowRegisterModal(true)}>
                                    Đăng ký
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="mobile-toggle" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>

            {/* Login Modal */}
            {showLoginModal && (
                <LoginModal
                    onLogin={handleLogin}
                    onGoogleLogin={handleGoogleLogin}
                    onClose={() => setShowLoginModal(false)}
                    onSwitchToRegister={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                    }}
                />
            )}

            {/* Register Modal */}
            {showRegisterModal && (
                <RegisterModal
                    onRegister={handleRegister}
                    onGoogleLogin={handleGoogleLogin}
                    onClose={() => setShowRegisterModal(false)}
                    onSwitchToLogin={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                    }}
                />
            )}
        </>
    );
};

// Login Modal Component
const LoginModal = ({ onLogin, onGoogleLogin, onClose, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Đăng nhập</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Nhập địa chỉ email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn">
                            Đăng nhập
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Hủy
                        </button>
                    </div>

                    {/* Google OAuth Button */}
                    <div className="oauth-section">
                        <div className="oauth-divider">
                            <span>hoặc</span>
                        </div>
                        <button type="button" className="google-oauth-btn" onClick={onGoogleLogin}>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Đăng nhập với Google
                        </button>
                    </div>

                    <div className="form-footer">
                        <a href="#" className="forgot-password">
                            Quên mật khẩu?
                        </a>
                        <p>
                            Chưa có tài khoản?
                            <button type="button" className="switch-modal-btn" onClick={onSwitchToRegister}>
                                Đăng ký ngay
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Register Modal Component
const RegisterModal = ({ onRegister, onGoogleLogin, onClose, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên hiển thị không được để trống';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Tên hiển thị phải có ít nhất 2 ký tự';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            onRegister(formData);
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content register-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Đăng ký tài khoản</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="register-name">Tên hiển thị</label>
                        <input
                            type="text"
                            id="register-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Nhập tên hiển thị"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-email">Email</label>
                        <input
                            type="email"
                            id="register-email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Nhập địa chỉ email"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-password">Mật khẩu</label>
                        <input
                            type="password"
                            id="register-password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            id="register-confirm-password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Nhập lại mật khẩu"
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Hủy
                        </button>
                    </div>

                    {/* Google OAuth Button */}
                    <div className="oauth-section">
                        <div className="oauth-divider">
                            <span>hoặc</span>
                        </div>
                        <button type="button" className="google-oauth-btn" onClick={onGoogleLogin}>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Đăng nhập với Google
                        </button>
                    </div>

                    <div className="form-footer">
                        <p>
                            Đã có tài khoản?
                            <button type="button" className="switch-modal-btn" onClick={onSwitchToLogin}>
                                Đăng nhập ngay
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Header;
