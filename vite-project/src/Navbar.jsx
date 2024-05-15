import './style/Navbar.css';

import React,{ useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PiPlantFill } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import { FaHotel } from "react-icons/fa";
// import { AuthButton } from 'src/frontend/components/signUp/AuthButton';


function Navbar()
{
    const [click, setClick] = useState(false);
    const [button,setButton] = useState(true);

    const handleClick = () => setClick(!click);

    const closeMobileMenu = () => setClick(false);

    const showButton = () =>
    {
        if(window.innerWidth <=960){
            setButton(false);
        }
        else
        {
            setButton(true);
        }
    };
    
    useEffect(() => { showButton(); },[]);

    window.addEventListener('resize', showButton);
  
    return (
    <>
    <nav className = "navbar">
    <Link to  ='/login' className='navbar-logo' onClick = {closeMobileMenu}>
            Booking Hotel <FaHotel className='fab fa-typo3'/>
    </Link>
    
    </nav>
    </>
  )
}

export default Navbar
