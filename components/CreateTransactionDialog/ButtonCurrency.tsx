'use client'
import { UseControllerProps, useController } from "react-hook-form";
import { Button } from "../ui/button";

export const ButtonCurrency = ({
  opt,
  control,
  onClick,
}: {
  opt: { id: number; factor: number; name: string };
  control: UseControllerProps;
  onClick: () => void;
}) => {
  const {
    field: { value: fieldValue },
  } = useController(control);

  return (
    <Button
      className="flex-col flex h-12 py-1 flex-1"
      variant={fieldValue === opt.name ? "default" : "outline"}
      type="button"
      value={opt.id}
      onClick={onClick}
    >
      <span className="">{opt.name}</span>
      {opt.factor === 1 ? (
        <span>(Main)</span>
      ) : (
        <span>{opt.factor.toFixed(2)}</span>
      )}
    </Button>
  );
};
