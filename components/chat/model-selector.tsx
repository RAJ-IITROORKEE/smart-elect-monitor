"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHAT_MODEL_OPTIONS } from "@/lib/chat-models";
import { ChevronDown, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  value: string;
  activeValue?: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  value,
  activeValue,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  const selected =
    CHAT_MODEL_OPTIONS.find((option) => option.id === value) ||
    CHAT_MODEL_OPTIONS[0];
  const active =
    CHAT_MODEL_OPTIONS.find((option) => option.id === activeValue) || selected;
  const isFallbackActive = Boolean(activeValue && activeValue !== value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium",
            "bg-muted/50 hover:bg-muted",
            "border border-border/50 hover:border-border",
            "transition-all duration-200",
            "disabled:opacity-50"
          )}
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="max-w-[80px] truncate sm:max-w-none">{active.label}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Select AI Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="rounded-md bg-muted/60 px-2 py-1.5 text-[11px] text-muted-foreground">
          Active: <span className="font-medium text-foreground">{active.label}</span>
          {isFallbackActive ? " (auto-fallback)" : ""}
        </div>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {CHAT_MODEL_OPTIONS.map((model) => (
            <DropdownMenuRadioItem
              key={model.id}
              value={model.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer",
                "transition-colors duration-150",
                "focus:bg-primary/10 focus:text-foreground",
                value === model.id && "bg-primary/5"
              )}
            >
              <div className="flex-1">
                <div className="font-medium">{model.label}</div>
              </div>
              {value === model.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
