import React from 'react';
import { MdEmail } from "react-icons/md";
import './Footer.css'
const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; {new Date().getFullYear()} AIMPS. All rights reserved.</p>
            <p>
                <MdEmail/>  aimps24x7@gmail.com
            </p>
        </footer>
    );
};

export default Footer;
