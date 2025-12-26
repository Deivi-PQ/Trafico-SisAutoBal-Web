import React, { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../Components/ui/tabs";
import PesoBalanza from "./PesoBalanzaImpl";
import { ReportePesoBalanza } from "./ReportePesoBalanza";

const PesoBalanzaTab = () => {
  const [activeTab, setActiveTab] = useState("pesobalanza");

  // Recuperamos Datos Del ultimo Bacth Guardado.

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PESO BALANZA</h1>
            <p className="text-muted-foreground">
              Gestion de pesajes en balanza.
            </p>
          </div>
        </div>
      </div>
      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="w-full justify-start">
          <TabsTrigger
            value="pesobalanza"
            className="flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-2"
          >
            <span className="text-2xl sm:text-base">📊</span>
            <span className="hidden sm:inline">Peso Balanza</span>
          </TabsTrigger>
          <TabsTrigger
            value="reporte"
            className="flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-2"
          >
            <span className="text-2xl sm:text-base">📄</span>
            <span className="hidden sm:inline">Reporte</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pesobalanza" className="space-y-6">
          <PesoBalanza />
        </TabsContent>
        <TabsContent value="reporte" className="space-y-6">
          <ReportePesoBalanza />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export { PesoBalanzaTab };
export default PesoBalanzaTab;
