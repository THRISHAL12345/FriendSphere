import React from "react";
import { motion, AnimatePresence } from "framer-motion"; // <-- Import AnimatePresence

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const Tabs = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onTabClick(tab.name)}
              className={`${
                activeTab === tab.name
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              } relative whitespace-nowrap py-4 px-2 sm:px-1 font-medium text-sm transition-colors focus:outline-none`}
            >
              {tab.name}
              {activeTab === tab.name && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="underline"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* --- Updated Animated Tab Content --- */}
      <div className="py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {tabs.map((tab) => {
            if (activeTab === tab.name) {
              return (
                <motion.div
                  key={tab.name}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {tab.content}
                </motion.div>
              );
            }
            return null;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tabs;
