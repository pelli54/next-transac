'use client'
import { UseControllerProps, useController } from "react-hook-form";
import { Button } from "../ui/button";
import { Download, Upload } from "lucide-react";

export const ButtonOptionType = ({
  opt,
  onClick,
  control,
}: {
  opt: {
    label: string;
    value: number;
  };
  onClick: () => void;
  control: UseControllerProps;
}) => {
  const {
    field: { value: fieldValue },
  } = useController(control);

  return (
    <Button
      className="flex-col flex h-12 py-1 flex-1"
      variant={fieldValue === !!opt.value ? "default" : "outline"}
      type="button"
      value={opt.value}
      onClick={onClick}
    >
      {!!opt.value ? <Download /> : <Upload />}
      <span className="">{opt.label}</span>
    </Button>
  );
};