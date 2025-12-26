import React, { createContext, useContext, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const TabsContext = createContext();

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TabsTrigger = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }
  
  const isActive = context.value === value;
  
  return (
    <button
      type="button"
      className={cn(
        tabsTriggerVariants(),
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }
  
  if (context.value !== value) {
    return null;
  }
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
