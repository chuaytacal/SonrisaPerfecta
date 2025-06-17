
"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ButtonProps } from "@/components/ui/button"; // Import ButtonProps for variant type

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmButtonText?: string;
  confirmButtonVariant?: ButtonProps['variant'];
  cancelButtonText?: string;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmButtonText = "Confirmar",
  confirmButtonVariant = "default",
  cancelButtonText = "Cancelar",
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:w-[90vw] p-4 sm:p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse space-y-2 space-y-reverse sm:flex-row sm:space-x-2 sm:space-y-0">
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto">
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={confirmButtonVariant === 'destructive' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto" : "w-full sm:w-auto"}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
