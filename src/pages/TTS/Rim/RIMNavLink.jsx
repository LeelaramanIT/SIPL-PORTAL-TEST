import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Input, ConfigProvider, theme } from 'antd';
import { BarChartOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';

const { Header } = Layout;

const RIMNavLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use Ant Design's token to get the theme-derived colors
  const { token } = theme.useToken();

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const items = [
    { key: 'factory', label: 'Factory', onClick: () => navigate('factory') },
    { key: 'warehouse', label: 'Warehouse', onClick: () => navigate('warehouse') },
    // {
    //   key: 'rim-barcode',
    //   label: 'Rim Barcode',
    //   children: [
    //     { key: 'datawise', label: 'Data Wise', onClick: () => navigate('DataWise') },
    //     { key: 'edcnowise', label: 'EDC No Wise', onClick: () => navigate('EDCNoWise') },
    //   ],
    // },
    // { key: 'rimstock', label: 'Rim Stock', onClick: () => navigate('rimstock') },
    // { key: 'analytics', label: 'Analytics', icon: <BarChartOutlined />, onClick: () => navigate('/analytics') },
    // { key: 'settings', label: 'Settings', icon: <SettingOutlined />, onClick: () => navigate('/settings') },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Header 
        // 1. REMOVE Tailwind bg classes. 
        // 2. USE inline style with token.colorBgContainer so it changes with the theme.
        className="flex items-center justify-between px-4 py-3 shadow-sm border-b transition-all duration-300"
        style={{ 
          height: '64px',
          backgroundColor: token.colorBgContainer, // This automatically swaps between White and Dark
          borderBottomColor: token.colorBorderSecondary,
          lineHeight: '64px'
        }}
      >
        <div className="flex items-center flex-1">
          <Menu
            mode="horizontal"
            // Let the Menu be transparent so it takes the Header's color
            theme={isDarkMode ? 'dark' : 'light'}
            selectedKeys={[location.pathname.split('/').pop() || 'overview']}
            items={items}
            className="border-none bg-transparent flex-1"
            style={{ minWidth: 0 }} 
          />
        </div>
        
        <div className="flex items-center w-64 ml-4">
          <Input.Search
            placeholder="Search rims..."
            enterButton={<SearchOutlined />}
            size="middle"
            allowClear
          />
        </div>
      </Header>
    </ConfigProvider>
  );
};

export default RIMNavLink;