'use client';

import { animated, config, useSpring } from '@react-spring/web';
import { useCallback, useEffect, useRef, useState } from 'react';

// Types
export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export interface DropdownMenuSeparator {
  type: 'separator';
}

export type DropdownMenuItemOrSeparator = DropdownMenuItem | DropdownMenuSeparator;

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItemOrSeparator[];
  align?: 'left' | 'right';
  className?: string;
}

/**
 * DropdownMenu - Dropdown menu with jelly animations and keyboard navigation
 */
export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className = '',
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get only actionable items (not separators)
  const actionableItems = items.filter(
    (item): item is DropdownMenuItem => !('type' in item)
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < actionableItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : actionableItems.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && !actionableItems[focusedIndex]?.disabled) {
            actionableItems[focusedIndex]?.onClick();
            setIsOpen(false);
            setFocusedIndex(-1);
          }
          break;
      }
    },
    [isOpen, focusedIndex, actionableItems]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Animation
  const menuSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    scale: isOpen ? 1 : 0.95,
    y: isOpen ? 0 : -10,
    config: config.gentle,
  });

  const handleTriggerClick = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  };

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="cursor-pointer"
      >
        {trigger}
      </button>

      {/* Menu */}
      {isOpen && (
        <animated.div
          ref={menuRef}
          style={{
            opacity: menuSpring.opacity,
            transform: menuSpring.scale.to(
              (s) => `scale(${s}) translateY(${menuSpring.y.get()}px)`
            ),
          }}
          className={`
            absolute top-full mt-2 z-50
            ${align === 'right' ? 'right-0' : 'left-0'}
            min-w-[180px] py-2
            glass-card rounded-xl shadow-2xl shadow-black/20
            border border-border/50
          `}
          role="menu"
        >
          {items.map((item, index) => {
            if ('type' in item && item.type === 'separator') {
              return (
                <div
                  key={`sep-${index}`}
                  className="my-2 h-px bg-border/50"
                />
              );
            }

            const menuItem = item as DropdownMenuItem;
            const actionIndex = actionableItems.indexOf(menuItem);
            const isFocused = focusedIndex === actionIndex;

            return (
              <DropdownMenuItemComponent
                key={menuItem.id}
                item={menuItem}
                isFocused={isFocused}
                onClick={() => handleItemClick(menuItem)}
              />
            );
          })}
        </animated.div>
      )}
    </div>
  );
}

/**
 * DropdownMenuItemComponent - Individual menu item
 */
interface DropdownMenuItemComponentProps {
  item: DropdownMenuItem;
  isFocused: boolean;
  onClick: () => void;
}

function DropdownMenuItemComponent({
  item,
  isFocused,
  onClick,
}: DropdownMenuItemComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  const spring = useSpring({
    scale: isHovered ? 1.02 : 1,
    x: isHovered ? 4 : 0,
    config: { tension: 400, friction: 15 },
  });

  const variantClasses = {
    default: 'text-foreground hover:bg-violet-500/10',
    danger: 'text-red-400 hover:bg-red-500/10',
  };

  return (
    <animated.button
      style={{
        transform: spring.scale.to(
          (s) => `scale(${s}) translateX(${spring.x.get()}px)`
        ),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={item.disabled}
      className={`
        w-full px-4 py-2 text-left text-sm
        flex items-center gap-3
        transition-colors
        ${variantClasses[item.variant || 'default']}
        ${isFocused ? 'bg-violet-500/10' : ''}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      role="menuitem"
    >
      {item.icon && <span className="text-base">{item.icon}</span>}
      <span>{item.label}</span>
    </animated.button>
  );
}

/**
 * Helper to create menu items
 */
export const menuItem = (
  id: string,
  label: string,
  onClick: () => void,
  options?: { icon?: string; disabled?: boolean; variant?: 'default' | 'danger' }
): DropdownMenuItem => ({
  id,
  label,
  onClick,
  ...options,
});

export const menuSeparator = (): DropdownMenuSeparator => ({
  type: 'separator',
});
