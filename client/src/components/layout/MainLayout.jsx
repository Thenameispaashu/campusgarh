import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar/Navbar';
import Footer from '../common/Footer/Footer';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <>
<<<<<<< HEAD
    <meta name="robots" content="index, follow" />

=======
>>>>>>> 1263476 (Fix: pin numpy<2.0 for prophet compatibility)
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default MainLayout;