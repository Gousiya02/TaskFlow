/**
 * src/components/layout/Layout.jsx — App Shell Layout
 */
import Navbar from './Navbar.jsx';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-950">
            {/* Subtle background texture */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
                      from-violet-950/20 via-transparent to-transparent pointer-events-none" />
            <Navbar />
            <main className="relative">{children}</main>
        </div>
    );
};

export default Layout;