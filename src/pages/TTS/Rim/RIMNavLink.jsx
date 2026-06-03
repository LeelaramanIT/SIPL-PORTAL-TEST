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
    { key: 'PendingTransfer', label: 'PendingTransfer', onClick: () => navigate('PendingTransfer') },
    { key: 'factory', label: 'Send', onClick: () => navigate('factory',{state:{type:'SEND',mode: "NEW",}}) },
    { key: 'warehouse', label: 'Receive' }
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Header 
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