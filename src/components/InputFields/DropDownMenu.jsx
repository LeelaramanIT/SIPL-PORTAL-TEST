import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";

export default function DropDownMenu({
  buttonLabel = "Menu",
  menuItems = [],
  size = "md",
  className,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-2.5",
  };

  return (
    <div className="my-auto">
      <button
        id="custom-button"
        aria-controls={open ? "custom-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        className={`${className} rounded ${sizeClasses[size]} transition duration-200`}
      >
        {buttonLabel}
      </button>

      <Menu
        id="custom-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            "aria-labelledby": "custom-button",
          },
        }}
        PaperProps={{
          sx: {
            bgcolor: "var(--color-background)", 
            color: "black",
            minWidth: 180,
            borderRadius: 1,
            boxShadow: 3,
            py: 0,
          },
        }}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleClose();
              item.onClick && item.onClick();
            }}
            sx={{
              fontSize: size === "sm" ? "0.875rem" : size === "lg" ? "1.125rem" : "1rem",
              fontWeight: 0,
              py: 1,
              px: 1,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "var(--color-primary)",
                color:'var(--color-text)'
              },
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
