// components/CustomBreadcrumbs.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import { IoIosHome } from "react-icons/io";
import { routePermissions } from '../components/ProtectedRoutes/routePermissions';


export const validRoutes = new Set(
    Object.keys(routePermissions).map((key) => `/${key}`)
  );
  

  const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
    backgroundColor: 'var(--color-secondary)',  // ✅ your custom variable
    height: theme.spacing(3),
    color: 'var(--color-on-secondary)',         // ✅ optionally use another CSS variable for text
    fontWeight: theme.typography.fontWeightMedium,
    '&:hover, &:focus': {
      backgroundColor: 'var(--color-secondary-hover)', // optional hover variable
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: 'var(--color-secondary-active)', // optional active variable
    },
  }));
  
  
  export default function CustomBreadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(Boolean);
  
    const crumbs = [
      <StyledBreadcrumb
        key="home"
        component={Link}
        to="/"
        label="Home"
        icon={<IoIosHome size={16} />}
      />,
      ...pathnames.map((segment, index) => {
        const fullPath = '/' + pathnames.slice(0, index + 1).join('/');
        const label = segment;
  
        const isValid = validRoutes.has(fullPath);
  
        return (
          <StyledBreadcrumb
            key={fullPath}
            component={isValid ? Link : 'div'}
            to={isValid ? fullPath : undefined}
            label={label}
          />
        );
      }),
    ];
  
    return <Breadcrumbs aria-label="breadcrumb">{crumbs}</Breadcrumbs>;
  }
