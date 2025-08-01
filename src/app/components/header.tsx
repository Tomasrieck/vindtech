'use client';

import React, { useEffect, useState } from 'react';
import styles from './header.module.css';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { IoMenu, IoHomeOutline } from "react-icons/io5";
import { IoMdTime, IoIosList  } from "react-icons/io";
import { IoImageOutline, IoMusicalNotesOutline } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Link from 'next/dist/client/link';
import { Divider } from '@mui/material';

export default function Header() {
  const [path, setPath] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const routes = [
    { name: 'Timeregistrering', icon: <IoMdTime size={24} color='var(--foreground)' />, path: '/time-reg' },
    { name: 'Musikprogram', icon: <IoMusicalNotesOutline size={24} color='var(--foreground)' />, path: '/daw' },
    { name: 'Todo-liste', icon: <IoIosList size={24} color='var(--foreground)' />, path: '/todo' },
    { name: 'Billeder', icon: <IoImageOutline size={24} color='var(--foreground)' />, path: '/images' },
  ];

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  const toggleDrawer =
    (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const list = () => (
    <Box
      sx={{ width: "100vw", height: "100%", backgroundColor: "var(--background)" }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "1rem",
          cursor: "pointer",
          color: "var(--foreground)"
        }}
        onClick={() => toggleDrawer(false)}
      >
        <FaChevronLeft size={24} />
      </Box>
      <List>
        <ListItem className={`${styles.listItem} ${path === '/home' && styles.activeListItem}`}>
          <ListItemButton disabled={path === '/home'} component={Link} href={'/home'}>
            <ListItemIcon><IoHomeOutline size={24} color='var(--foreground)' /></ListItemIcon>
            <ListItemText className={styles.listItemText} primary={'Hjem'} />
            <FaChevronRight size={20} color='-apple-system-gray' />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ backgroundColor: 'rgba(117,117,117,0.5)', marginX: '0.7rem', marginTop: '1rem' }} />
        <div className={styles.menuHeader}>
            <h3>Udforsk mulighederne med en PWA</h3>
        </div>
        {routes.map((route) => (
          <ListItem key={route.name} className={`${styles.listItem} ${path === route.path && styles.activeListItem}`}>
            <ListItemButton disabled={path === route.path} component={Link} href={route.path}>
              <ListItemIcon>{route.icon}</ListItemIcon>
              <ListItemText className={styles.listItemText} primary={route.name} />
              <FaChevronRight size={20} color='-apple-system-gray' />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div className={styles.container}>
      <span><strong>Vind</strong>tech</span>

      {/* Burger menu icon */}
      <IoMenu
        size={34}
        className={styles.menuIcon}
        onClick={toggleDrawer(true)}
        visibility={path === '/' ? 'hidden' : 'visible'}
      />

      {/* Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {list()}
      </Drawer>
    </div>
  );
}