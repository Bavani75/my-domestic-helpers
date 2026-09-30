"use client";
import { useEffect, useRef, type ReactNode } from "react";
export default function Dialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal native-dialog"
      onCancel={onClose}
      aria-labelledby="editor-title"
    >
      {children}
    </dialog>
  );
}
