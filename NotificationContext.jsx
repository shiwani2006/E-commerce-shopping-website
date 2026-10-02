import { createContext, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

const initialNotifications = [
  {
    id: 1,
    title: "Order out for delivery",
    message: "Your Floral Summer Dress will arrive today by 7:30 PM.",
    type: "order",
    read: false,
    time: "2 min ago",
  },
  {
    id: 2,
    title: "Reward unlocked",
    message: "You unlocked a ₹200 coupon for your next order.",
    type: "reward",
    read: false,
    time: "15 min ago",
  },
  {
    id: 3,
    title: "Payment secured",
    message: "Your saved card is protected with secure checkout.",
    type: "payment",
    read: true,
    time: "1 hr ago",
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !item.read).length;
  }, [notifications]);

  const addNotification = ({
    title,
    message,
    type = "order",
  }) => {
    const newNotification = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      time: "Just now",
    };

    setNotifications((prev) => [
      newNotification,
      ...prev,
    ]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}