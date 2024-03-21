import ContainerCentered from "@/components/ContainerCentered";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import Producer from "./components/Producer";
import Company from "./components/Company";
import Currency from "./components/Currency";

const page = () => {
  return (
    <ContainerCentered>
      <div className="w-full">
        <h1 className="text-2xl font-extralight my-6 px-3">Settings</h1>
      </div>
      <div className="px-3">
        <Tabs  defaultValue="producer">
          <TabsList className="w-full justify-evenly">
            <TabsTrigger value="producer">Producers</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="currency">Currency</TabsTrigger>
          </TabsList>
          <TabsContent value="producer">
            <Producer/>
          </TabsContent>
          <TabsContent value="company">
            <Company/>
          </TabsContent>
          <TabsContent value="currency">
            <Currency/>
          </TabsContent>
        </Tabs>
      </div>
    </ContainerCentered>
  );
};

export default page;
