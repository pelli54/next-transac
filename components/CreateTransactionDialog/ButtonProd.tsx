'use client'
import { UseControllerProps, useController } from "react-hook-form";
import { Button } from "../ui/button";
import { User, UserRoundCog } from "lucide-react";

export const ButtonProd = ({
  opt,
  control,
  onClick,
}: {
  opt: { id: number; role: string; name: string };
  control: UseControllerProps;
  onClick: () => void;
}) => {
  const {
    field: { value: fieldValue },
  } = useController(control);

  return (
    <Button
      className="flex-col flex h-12 py-1 flex-1"
      variant={fieldValue === opt.id ? "default" : "outline"}
      type="button"
      value={opt.id}
      onClick={onClick}
    >
      {opt.role === "ADMIN" ? <UserRoundCog /> : <User />}
      <span className="">{opt.name}</span>
    </Button>
  );
};
