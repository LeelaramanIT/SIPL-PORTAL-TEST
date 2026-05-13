import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";
import { notification, Button } from "antd";

const SystemUpdater = () => {
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  useEffect(() => {
    if (needRefresh) {
      notification.info({
        message: "System Update Available",

        description:
          "New version deployed. Update now for latest features.",

        duration: 0,

        placement: "topRight",

        btn: (
          <Button
            type="primary"
            onClick={() => updateServiceWorker(true)}
          >
            Update Now
          </Button>
        ),
      });
    }
  }, [needRefresh]);

  return null;
};

export default SystemUpdater;