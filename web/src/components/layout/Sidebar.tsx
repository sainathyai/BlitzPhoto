import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Images, 
  LogOut,
  Menu,
  X,
  Star,
  Folder,
  Users,
  MapPin,
  Video,
  Clock,
  Archive,
  FileText,
  Camera,
  Cloud
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  action?: () => void;
  disabled?: boolean;
  badge?: string;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

/**
 * Sidebar Component
 * 
 * Fixed sidebar navigation with modern design and smooth animations.
 */
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearAuth } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if we're on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
      // Auto-open sidebar on desktop
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(true);
      }
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const sidebarSections: SidebarSection[] = [
    {
      items: [
        {
          label: 'Photos',
          icon: Images,
          path: '/',
        },
      ],
    },
    {
      title: 'Collections',
      items: [
        {
          label: 'Albums',
          icon: Folder,
          path: '/albums',
          disabled: true,
        },
        {
          label: 'Favorites',
          icon: Star,
          path: '/favorites',
          disabled: true,
        },
        {
          label: 'People',
          icon: Users,
          path: '/people',
          disabled: true,
        },
        {
          label: 'Places',
          icon: MapPin,
          path: '/places',
          disabled: true,
        },
        {
          label: 'Videos',
          icon: Video,
          path: '/videos',
          disabled: true,
        },
        {
          label: 'Recently Added',
          icon: Clock,
          path: '/recent',
          disabled: true,
        },
        {
          label: 'Archive',
          icon: Archive,
          path: '/archive',
          disabled: true,
        },
        {
          label: 'Documents',
          icon: FileText,
          path: '/documents',
          disabled: true,
        },
        {
          label: 'Screenshots',
          icon: Camera,
          path: '/screenshots',
          disabled: true,
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.startsWith('/#')) {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.disabled) {
      return; // Don't navigate if disabled
    }
    if (item.action) {
      item.action();
    } else if (item.path.startsWith('/#')) {
      // Scroll to section on same page
      const section = item.path.substring(2);
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileOpen(false);
    } else {
      navigate(item.path);
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: (isMobileOpen || isDesktop) ? 0 : -180,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed lg:relative top-0 left-0 z-40
          h-screen
          w-[180px] sm:w-[200px] md:w-[224px] lg:w-64 bg-neutral-50 border-r border-neutral-200
          flex flex-col
          shadow-lg lg:shadow-none
        `}
      >
          {/* Logo */}
          <div className="p-3 sm:p-4 lg:p-6 border-b border-neutral-200">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm lg:text-lg">BP</span>
              </div>
              <span className="text-sm sm:text-base lg:text-xl font-bold text-neutral-900 font-heading truncate">
                BlitzPhoto
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4 lg:space-y-6 overflow-y-auto">
            {sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-0.5 sm:space-y-1">
                {section.title && (
                  <h3 className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-[9px] sm:text-[10px] lg:text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => handleItemClick(item)}
                      disabled={item.disabled}
                      whileHover={!item.disabled ? { x: 2 } : {}}
                      whileTap={!item.disabled ? { scale: 0.98 } : {}}
                      className={`
                        w-full flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg
                        transition-all duration-200
                        ${
                          active
                            ? 'bg-primary text-white shadow-sm'
                            : item.disabled
                            ? 'text-neutral-400 cursor-not-allowed opacity-60'
                            : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                        }
                      `}
                      title={item.disabled ? 'Coming soon' : item.label}
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0 ${
                          active ? 'text-white' : item.disabled ? 'text-neutral-400' : 'text-neutral-500'
                        }`}
                      />
                      <span className="font-medium text-xs sm:text-xs lg:text-sm truncate text-left">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] lg:text-xs font-medium bg-neutral-200 text-neutral-700 rounded-full flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Storage Info */}
          <div className="p-2 sm:p-3 lg:p-4 border-t border-neutral-200">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 text-[10px] sm:text-xs lg:text-sm text-neutral-600">
              <Cloud className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-neutral-400 flex-shrink-0" />
              <span className="text-[9px] sm:text-[10px] lg:text-xs">Storage</span>
            </div>
            <div className="px-2 sm:px-3 lg:px-4 pb-2">
              <div className="text-[9px] sm:text-[10px] lg:text-xs text-neutral-500 mb-1">Unlimited storage</div>
              <div className="w-full bg-neutral-200 rounded-full h-1 sm:h-1 lg:h-1.5">
                <div className="bg-primary h-1 sm:h-1 lg:h-1.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-2 sm:p-3 lg:p-4 border-t border-neutral-200">
            <motion.button
              onClick={handleLogout}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-xs lg:text-sm">Logout</span>
            </motion.button>
          </div>
        </motion.aside>
    </>
  );
}

