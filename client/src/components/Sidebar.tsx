"use client";

import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Dna,
  GitCompare,
  History,
  Box,
  LayoutDashboard,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Single Analysis", icon: Dna },
  { href: "/compare", label: "Sequence Compare", icon: GitCompare },
  { href: "/viewer", label: "3D Structure", icon: Box },
  // { href: "/history", label: "History", icon: History },
];

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <motion.div
        className="flex flex-col items-center gap-4 p-6 border-b border-border/50"
        layout
      >
        <motion.div
          onClick={() => collapsed && setCollapsed(false)}
          onKeyDown={(e) => {
            if (collapsed && (e.key === "Enter" || e.key === " "))
              setCollapsed(false);
          }}
          role={collapsed ? "button" : undefined}
          tabIndex={collapsed ? 0 : undefined}
          className={cn(
            "flex items-center gap-3",
            collapsed ? "cursor-pointer justify-center flex-col" : "",
          )}
          whileHover={collapsed ? { scale: 1.05 } : {}}
        >
          <motion.div
            className="p-2 bg-primary/10 rounded-lg flex-shrink-0"
            whileHover={{ backgroundColor: "rgb(var(--color-primary) / 0.15)" }}
          >
            <Dna className="w-6 h-6 text-primary" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1 }}
            transition={{ duration: 0.2, delay: collapsed ? 0 : 0.05 }}
            className="overflow-hidden"
          >
            {!collapsed && (
              <div className="whitespace-nowrap text-center">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  BioVis
                </h1>
                <p className="text-xs text-muted-foreground">
                  Bioinformatics tool
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-muted flex items-center justify-center flex-shrink-0 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          layout
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </motion.div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = location === item.href;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={item.href}>
                <motion.div
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer group relative",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setIsOpen(false)}
                  title={item.label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  layout
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-primary rounded-lg -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: collapsed ? 0 : 1,
                      width: collapsed ? 0 : "auto",
                    }}
                    transition={{ duration: 0.2, delay: collapsed ? 0 : 0.05 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.div className="p-6 border-t border-border/50" layout>
        <motion.div
          className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/20 border border-primary/10"
          whileHover={{ borderColor: "rgb(var(--color-primary) / 0.3)" }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={false}
            animate={{
              opacity: collapsed ? 0 : 1,
              height: collapsed ? 0 : "auto",
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {!collapsed && (
              <p className="text-xs font-semibold text-primary text-center">
                BOUDA 2025 M1-BIOINFO all rights reserved
              </p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-md shadow-md border"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 80 : 288 }}
        transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.5 }}
        className={cn(
          "hidden lg:block h-screen fixed left-0 top-0 z-30 overflow-hidden",
        )}
      >
        <SidebarContent />
      </motion.div>
    </>
  );
}
