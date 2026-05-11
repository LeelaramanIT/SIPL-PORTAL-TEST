import React, { useState, useEffect } from "react";
import {
    FullscreenOutlined,
    FullscreenExitOutlined,
} from "@ant-design/icons";
import { Button, Tooltip } from "antd";

const FullscreenComponent = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.log("Fullscreen error:", error);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    return (
        <div className="p-5">
            <Tooltip
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                <Button
                    icon={
                        isFullscreen ? (
                            <FullscreenExitOutlined />
                        ) : (
                            <FullscreenOutlined />
                        )
                    }
                    onClick={toggleFullscreen}
                    className="hover:scale-105 transition-transform duration-200"
                />
            </Tooltip>
        </div>
    );
};

export default FullscreenComponent;