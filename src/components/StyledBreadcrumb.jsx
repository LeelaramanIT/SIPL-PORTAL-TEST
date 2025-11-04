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
    backgroundColor: 'var(--primary)',  // ✅ your custom variable
    height: theme.spacing(3),
    color: 'var(--border)',         // ✅ optionally use another CSS variable for text
    fontWeight: theme.typography.fontWeightMedium,
    '&:hover, &:focus': {
      backgroundColor: 'var(--primary-hover)', // optional hover variable
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: 'var(--input)', // optional active variable
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
  
    return (
    <Breadcrumbs 
      aria-label="breadcrumb" 
      sx={{
        '& .MuiBreadcrumbs-separator': {
          fontSize: '0.75rem',
          '@media (max-width: 640px)': {
            fontSize: '0.625rem',
          }
        },
        '& .MuiChip-root': {
          fontSize: '0.75rem',
          height: '24px',
          '@media (max-width: 640px)': {
            fontSize: '0.625rem',
            height: '20px',
            padding: '0 4px',
          }
        }
      }}
    >
      {crumbs}
    </Breadcrumbs>
  );
  }
