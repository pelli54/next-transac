import React, { ReactNode } from "react";

const ContainerCentered = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[768px]">{children}</div>
    </div>
  );
};

export default ContainerCentered;
